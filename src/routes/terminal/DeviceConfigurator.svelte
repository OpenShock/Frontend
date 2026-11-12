<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { ParaglideMessage } from '@inlang/paraglide-js-svelte';
  import type { Snippet } from 'svelte';
  import { AlertTriangle, Eye, RefreshCw, Send, TriangleAlert, WifiOff } from '@lucide/svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { ConfirmDeleteDialog } from '@openshock/svelte-core/components';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { Input } from '@openshock/svelte-core/components/ui/input';
  import { Label } from '@openshock/svelte-core/components/ui/label';
  import { Switch } from '@openshock/svelte-core/components/ui/switch';
  import { Textarea } from '@openshock/svelte-core/components/ui/textarea';
  import type { TerminalContext } from './TerminalContext.svelte';

  interface Props {
    terminal: TerminalContext;
    disabled?: boolean;
    onSendCommand: (command: string) => void;
  }

  let { terminal, disabled = false, onSendCommand }: Props = $props();

  // RF
  let rfTxPin = $state('');
  let keepaliveEnabled = $state(true);

  // EStop
  let estopEnabled = $state(false);
  let estopPin = $state('');

  // WiFi
  let hostname = $state('');
  let networksJson = $state('[]');

  // Backend
  let backendDomain = $state('');
  let authToken = $state('');
  let showAuthToken = $state(false);

  // Serial
  let echoEnabled = $state(false);

  // Advanced
  let jsonConfig = $state('');
  let rawConfig = $state('');

  // Danger zone
  let confirmFactoryResetOpen = $state(false);

  function send(cmd: string) {
    if (disabled) return;
    onSendCommand(cmd);
  }

  // Parse incoming firmware responses ($SYS$|Response|<Key>|<Value>) and
  // populate fields. JsonConfig also fans out to every individual field so
  // a single jsonconfig read fills the whole form.
  const RESPONSE_PREFIX = '$SYS$|Response|';
  let lastSeenLineId = -1;

  function applyJsonConfig(jsonStr: string) {
    let cfg: unknown;
    try {
      cfg = JSON.parse(jsonStr);
    } catch {
      return;
    }
    if (!cfg || typeof cfg !== 'object') return;
    const c = cfg as Record<string, Record<string, unknown>>;
    if (typeof c.rf?.txPin === 'number') rfTxPin = String(c.rf.txPin);
    if (typeof c.rf?.keepAliveEnabled === 'boolean') keepaliveEnabled = c.rf.keepAliveEnabled;
    if (typeof c.estop?.enabled === 'boolean') estopEnabled = c.estop.enabled;
    if (typeof c.estop?.gpioPin === 'number') estopPin = String(c.estop.gpioPin);
    if (typeof c.wifi?.hostname === 'string') hostname = c.wifi.hostname;
    if (Array.isArray(c.wifi?.credentials))
      networksJson = JSON.stringify(c.wifi.credentials, null, 2);
    if (typeof c.backend?.domain === 'string') backendDomain = c.backend.domain;
    if (typeof c.backend?.authToken === 'string') authToken = c.backend.authToken;
    if (typeof c.serialInput?.echoEnabled === 'boolean') echoEnabled = c.serialInput.echoEnabled;
  }

  function handleResponseLine(text: string) {
    const idx = text.indexOf(RESPONSE_PREFIX);
    if (idx === -1) return;
    const rest = text.slice(idx + RESPONSE_PREFIX.length).replace(/[\r\n]+$/, '');
    const sep = rest.indexOf('|');
    if (sep === -1) return;
    const key = rest.slice(0, sep);
    const value = rest.slice(sep + 1);
    switch (key) {
      case 'RmtPin':
        rfTxPin = value;
        break;
      case 'KeepAlive':
        keepaliveEnabled = value === 'true';
        break;
      case 'EStopEnabled':
        estopEnabled = value === 'true';
        break;
      case 'EStopPin':
        estopPin = value;
        break;
      case 'Hostname':
        hostname = value;
        break;
      case 'Networks':
        networksJson = value;
        break;
      case 'Domain':
        backendDomain = value;
        break;
      case 'AuthToken':
        authToken = value;
        break;
      case 'SerialEcho':
        echoEnabled = value === 'true';
        break;
      case 'JsonConfig':
        jsonConfig = value;
        applyJsonConfig(value);
        break;
      case 'RawConfig':
        rawConfig = value;
        break;
    }
  }

  // Pending awaiters for read commands. Each tracks a Response key and resolves
  // when the firmware emits a matching Response or any Error line.
  type ReadOutcome = 'success' | 'error' | 'timeout';
  type PendingRead = { key: string; settle: (outcome: ReadOutcome) => void };
  const pendingReads: PendingRead[] = [];
  const ERROR_PREFIX = '$SYS$|Error|';

  function notifyPending(text: string) {
    if (pendingReads.length === 0) return;
    for (const pending of [...pendingReads]) {
      if (text.includes(`${RESPONSE_PREFIX}${pending.key}|`)) {
        pending.settle('success');
      } else if (text.includes(ERROR_PREFIX)) {
        pending.settle('error');
      }
    }
  }

  $effect(() => {
    const lines = terminal.lines;
    const len = lines.length;

    // Defensive: if the terminal was cleared (or its id counter rolled), restart tracking
    // so we don't get stuck silently skipping every entry.
    if (len === 0 || lines[len - 1].id < lastSeenLineId) {
      lastSeenLineId = -1;
    }
    if (len === 0) return;

    // Lines are appended in monotonic id order. Walk back from the end to find the first
    // unseen entry so we only process the newly-appended slice (O(k) instead of O(n)).
    let startIdx = len;
    while (startIdx > 0 && lines[startIdx - 1].id > lastSeenLineId) {
      startIdx--;
    }

    for (let i = startIdx; i < len; i++) {
      const line = lines[i];
      lastSeenLineId = line.id;
      handleResponseLine(line.text);
      notifyPending(line.text);
    }
  });

  const READ_TIMEOUT_MS = 3000;
  const READ_ATTEMPTS = 3;

  function readOnce(command: string, key: string): Promise<ReadOutcome> {
    return new Promise((resolve) => {
      let done = false;
      const settle = (outcome: ReadOutcome) => {
        if (done) return;
        done = true;
        const idx = pendingReads.indexOf(pending);
        if (idx !== -1) pendingReads.splice(idx, 1);
        clearTimeout(timeoutId);
        resolve(outcome);
      };
      const pending: PendingRead = { key, settle };
      pendingReads.push(pending);
      const timeoutId = setTimeout(() => settle('timeout'), READ_TIMEOUT_MS);
      onSendCommand(command);
    });
  }

  let isReadingJson = $state(false);
  let isReadingRaw = $state(false);
  let failedReadOpen = $state(false);
  let failedReadKey = $state('');

  async function readWithRetry(command: string, key: string): Promise<boolean> {
    for (let attempt = 1; attempt <= READ_ATTEMPTS; attempt++) {
      const outcome = await readOnce(command, key);
      if (outcome === 'success') return true;
    }
    failedReadKey = key;
    failedReadOpen = true;
    return false;
  }

  async function readJsonConfig() {
    if (isReadingJson) return;
    isReadingJson = true;
    try {
      await readWithRetry('jsonconfig', 'JsonConfig');
    } finally {
      isReadingJson = false;
    }
  }

  async function readRawConfig() {
    if (isReadingRaw) return;
    isReadingRaw = true;
    try {
      await readWithRetry('rawconfig', 'RawConfig');
    } finally {
      isReadingRaw = false;
    }
  }

  async function retryFailedRead() {
    failedReadOpen = false;
    if (failedReadKey === 'JsonConfig') await readJsonConfig();
    else if (failedReadKey === 'RawConfig') await readRawConfig();
  }

  function isValidJsonArray(s: string): boolean {
    try {
      return Array.isArray(JSON.parse(s));
    } catch {
      return false;
    }
  }

  function isValidJson(s: string): boolean {
    try {
      JSON.parse(s);
      return true;
    } catch {
      return false;
    }
  }

  function isBase64(s: string): boolean {
    const stripped = s.replace(/\s/g, '');
    if (stripped.length === 0 || stripped.length % 4 !== 0) return false;
    return /^[A-Za-z0-9+/]+={0,2}$/.test(stripped);
  }
</script>

<div class="flex flex-col gap-4">
  <!-- Introductory note -->
  <p class="text-muted-foreground text-sm">
    <ParaglideMessage message={m.terminal_cfg_intro}>
      {#snippet eye()}
        <Eye class="inline h-3.5 w-3.5" />
      {/snippet}
    </ParaglideMessage>
  </p>

  <!-- RF -->
  <Card.Root>
    <Card.Header>
      <Card.Title>{m.terminal_cfg_rf_title()}</Card.Title>
      <Card.Description>{m.terminal_cfg_rf_desc()}</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <Label for="cfg-rftxpin">{m.terminal_cfg_tx_pin()}</Label>
        <div class="flex gap-2">
          <Input
            id="cfg-rftxpin"
            type="number"
            min={0}
            placeholder={m.terminal_cfg_example({ value: '15' })}
            bind:value={rfTxPin}
            {disabled}
          />
          <Button
            variant="outline"
            {disabled}
            onclick={() => send('rftxpin')}
            title={m.terminal_cfg_read_value()}
          >
            <Eye />
          </Button>
          <Button
            onclick={() => rfTxPin !== '' && send(`rftxpin ${rfTxPin}`)}
            disabled={disabled || rfTxPin === ''}
          >
            <Send />
            {m.terminal_cfg_set()}
          </Button>
        </div>
      </div>

      <div class="flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <Label for="cfg-keepalive">{m.terminal_cfg_keepalive()}</Label>
          <span class="text-muted-foreground text-sm">
            {m.terminal_cfg_keepalive_desc()}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <Switch id="cfg-keepalive" bind:checked={keepaliveEnabled} {disabled} />
          <Button
            variant="outline"
            size="sm"
            {disabled}
            onclick={() => send('keepalive')}
            title={m.terminal_cfg_read_value()}
          >
            <Eye />
          </Button>
          <Button size="sm" {disabled} onclick={() => send(`keepalive ${keepaliveEnabled}`)}>
            <Send />
            {m.terminal_cfg_set()}
          </Button>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- EStop -->
  <Card.Root>
    <Card.Header>
      <Card.Title>{m.terminal_cfg_estop_title()}</Card.Title>
      <Card.Description>{m.terminal_cfg_estop_desc()}</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
      <div class="flex items-center justify-between gap-4">
        <Label for="cfg-estop-enabled">{m.terminal_cfg_estop_enabled()}</Label>
        <div class="flex items-center gap-2">
          <Switch id="cfg-estop-enabled" bind:checked={estopEnabled} {disabled} />
          <Button
            variant="outline"
            size="sm"
            {disabled}
            onclick={() => send('estop enabled')}
            title={m.terminal_cfg_read_value()}
          >
            <Eye />
          </Button>
          <Button size="sm" {disabled} onclick={() => send(`estop enabled ${estopEnabled}`)}>
            <Send />
            {m.terminal_cfg_set()}
          </Button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="cfg-estop-pin">{m.terminal_cfg_estop_pin()}</Label>
        <div class="flex gap-2">
          <Input
            id="cfg-estop-pin"
            type="number"
            min={0}
            placeholder={m.terminal_cfg_example({ value: '13' })}
            bind:value={estopPin}
            {disabled}
          />
          <Button
            variant="outline"
            {disabled}
            onclick={() => send('estop pin')}
            title={m.terminal_cfg_read_value()}
          >
            <Eye />
          </Button>
          <Button
            onclick={() => estopPin !== '' && send(`estop pin ${estopPin}`)}
            disabled={disabled || estopPin === ''}
          >
            <Send />
            {m.terminal_cfg_set()}
          </Button>
        </div>
        <p class="text-muted-foreground text-xs">
          <ParaglideMessage
            message={m.terminal_cfg_estop_note}
            inputs={{ latching: 'estop.latching', active: 'estop.active' }}
            {code}
          />
        </p>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- WiFi -->
  <Card.Root>
    <Card.Header>
      <Card.Title>{m.terminal_cfg_wifi_title()}</Card.Title>
      <Card.Description>{m.terminal_cfg_wifi_desc()}</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <Label for="cfg-hostname">{m.terminal_cfg_hostname()}</Label>
        <div class="flex gap-2">
          <Input
            id="cfg-hostname"
            placeholder={m.terminal_cfg_example({ value: 'OpenShock-Kitchen' })}
            bind:value={hostname}
            {disabled}
          />
          <Button
            variant="outline"
            {disabled}
            onclick={() => send('hostname')}
            title={m.terminal_cfg_read_value()}
          >
            <Eye />
          </Button>
          <Button
            onclick={() => hostname && send(`hostname ${hostname}`)}
            disabled={disabled || !hostname}
          >
            <Send />
            {m.terminal_cfg_set()}
          </Button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="cfg-networks">{m.terminal_cfg_networks()}</Label>
        <Textarea
          id="cfg-networks"
          rows={4}
          class="font-mono text-xs"
          placeholder={'[{"ssid":"MyWiFi","password":"secret"}]'}
          bind:value={networksJson}
          {disabled}
        />
        {#if networksJson && !isValidJsonArray(networksJson)}
          <p class="text-destructive flex items-center gap-1 text-xs">
            <TriangleAlert class="h-3.5 w-3.5" />
            {m.terminal_cfg_invalid_json_array()}
          </p>
        {/if}
        <div class="flex gap-2">
          <Button
            variant="outline"
            {disabled}
            onclick={() => send('networks')}
            title={m.terminal_cfg_read_value()}
          >
            <Eye />
            {m.terminal_cfg_read()}
          </Button>
          <Button
            onclick={() => isValidJsonArray(networksJson) && send(`networks ${networksJson}`)}
            disabled={disabled || !isValidJsonArray(networksJson)}
          >
            <Send />
            {m.terminal_cfg_set()}
          </Button>
        </div>
        <p class="text-muted-foreground text-xs">
          <ParaglideMessage
            message={m.terminal_cfg_ap_note}
            inputs={{
              ssid: 'ap_ssid',
              password: 'ap_password',
              disabled: 'ap_disabled',
              staDisabled: 'sta_disabled',
              offlineMode: 'offline_mode',
            }}
            {code}
          />
        </p>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Backend -->
  <Card.Root>
    <Card.Header>
      <Card.Title>{m.terminal_cfg_backend_title()}</Card.Title>
      <Card.Description>{m.terminal_cfg_backend_desc()}</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <Label for="cfg-domain">{m.terminal_cfg_domain()}</Label>
        <div class="flex gap-2">
          <Input
            id="cfg-domain"
            placeholder="api.openshock.app"
            bind:value={backendDomain}
            {disabled}
          />
          <Button
            variant="outline"
            {disabled}
            onclick={() => send('domain')}
            title={m.terminal_cfg_read_value()}
          >
            <Eye />
          </Button>
          <Button
            onclick={() => backendDomain && send(`domain ${backendDomain}`)}
            disabled={disabled || !backendDomain}
          >
            <Send />
            {m.terminal_cfg_set()}
          </Button>
        </div>
        <p class="text-muted-foreground flex items-center gap-1 text-xs">
          <AlertTriangle class="h-3.5 w-3.5" />
          {m.terminal_cfg_domain_restart()}
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="cfg-authtoken">{m.terminal_cfg_auth_token()}</Label>
        <div class="flex gap-2">
          <Input
            id="cfg-authtoken"
            type={showAuthToken ? 'text' : 'password'}
            placeholder={m.terminal_cfg_auth_token_placeholder()}
            bind:value={authToken}
            autocomplete="off"
            {disabled}
          />
          <Button
            variant="outline"
            {disabled}
            onclick={() => (showAuthToken = !showAuthToken)}
            title={showAuthToken ? m.terminal_cfg_hide() : m.terminal_cfg_show()}
          >
            <Eye />
          </Button>
          <Button
            onclick={() => authToken && send(`authtoken ${authToken}`)}
            disabled={disabled || !authToken}
          >
            <Send />
            {m.terminal_cfg_set()}
          </Button>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Serial -->
  <Card.Root>
    <Card.Header>
      <Card.Title>{m.terminal_cfg_serial_title()}</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <Label for="cfg-echo">{m.terminal_cfg_echo()}</Label>
          <span class="text-muted-foreground text-sm">
            {m.terminal_cfg_echo_desc()}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <Switch id="cfg-echo" bind:checked={echoEnabled} {disabled} />
          <Button
            variant="outline"
            size="sm"
            {disabled}
            onclick={() => send('echo')}
            title={m.terminal_cfg_read_value()}
          >
            <Eye />
          </Button>
          <Button size="sm" {disabled} onclick={() => send(`echo ${echoEnabled}`)}>
            <Send />
            {m.terminal_cfg_set()}
          </Button>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Advanced -->
  <Card.Root>
    <Card.Header>
      <Card.Title>{m.terminal_cfg_advanced_title()}</Card.Title>
      <Card.Description>
        {m.terminal_cfg_advanced_desc()}
      </Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <Label for="cfg-jsonconfig">{m.terminal_cfg_json_config()}</Label>
        <Textarea
          id="cfg-jsonconfig"
          rows={6}
          class="font-mono text-xs"
          placeholder={'{"rf":{...},"wifi":{...},...}'}
          bind:value={jsonConfig}
          {disabled}
        />
        {#if jsonConfig && !isValidJson(jsonConfig)}
          <p class="text-destructive flex items-center gap-1 text-xs">
            <TriangleAlert class="h-3.5 w-3.5" />
            {m.terminal_cfg_invalid_json()}
          </p>
        {/if}
        <div class="flex gap-2">
          <Button
            variant="outline"
            disabled={disabled || isReadingJson}
            onclick={readJsonConfig}
            title={m.terminal_cfg_read_json()}
          >
            <Eye />
            {isReadingJson ? m.terminal_cfg_reading() : m.terminal_cfg_read()}
          </Button>
          <Button
            onclick={() => isValidJson(jsonConfig) && send(`jsonconfig ${jsonConfig}`)}
            disabled={disabled || !isValidJson(jsonConfig)}
          >
            <Send />
            {m.terminal_cfg_apply()}
          </Button>
        </div>
        <p class="text-muted-foreground flex items-center gap-1 text-xs">
          <AlertTriangle class="h-3.5 w-3.5" />
          {m.terminal_cfg_json_restart()}
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="cfg-rawconfig">{m.terminal_cfg_raw_config()}</Label>
        <Textarea
          id="cfg-rawconfig"
          rows={4}
          class="font-mono text-xs"
          placeholder="CgQIIBABEgsKAAoADQAAAAAaABoA..."
          bind:value={rawConfig}
          {disabled}
        />
        {#if rawConfig && !isBase64(rawConfig)}
          <p class="text-destructive flex items-center gap-1 text-xs">
            <TriangleAlert class="h-3.5 w-3.5" />
            {m.terminal_cfg_invalid_base64()}
          </p>
        {/if}
        <div class="flex gap-2">
          <Button
            variant="outline"
            disabled={disabled || isReadingRaw}
            onclick={readRawConfig}
            title={m.terminal_cfg_read_raw()}
          >
            <Eye />
            {isReadingRaw ? m.terminal_cfg_reading() : m.terminal_cfg_read()}
          </Button>
          <Button
            onclick={() => isBase64(rawConfig) && send(`rawconfig ${rawConfig.replace(/\s/g, '')}`)}
            disabled={disabled || !isBase64(rawConfig)}
          >
            <Send />
            {m.terminal_cfg_apply()}
          </Button>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Danger zone -->
  <Card.Root class="border-destructive/50">
    <Card.Header>
      <Card.Title class="text-destructive">{m.common_danger_zone()}</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="font-medium">{m.terminal_cfg_factory_reset()}</span>
          <span class="text-muted-foreground text-sm">
            {m.terminal_cfg_factory_reset_desc()}
          </span>
        </div>
        <Button variant="destructive" {disabled} onclick={() => (confirmFactoryResetOpen = true)}>
          {m.terminal_cfg_factory_reset()}
        </Button>
      </div>
    </Card.Content>
  </Card.Root>
</div>

{#snippet code({ children }: { children?: Snippet })}
  <code>{@render children?.()}</code>
{/snippet}

<ConfirmDeleteDialog
  bind:open={confirmFactoryResetOpen}
  title={m.terminal_cfg_factory_reset_title()}
  actionLabel={m.terminal_cfg_factory_reset_action()}
  onConfirm={() => send('factoryreset')}
>
  {#snippet description()}
    {m.terminal_cfg_factory_reset_confirm()}
  {/snippet}
</ConfirmDeleteDialog>

<Dialog.Root bind:open={failedReadOpen}>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <div class="flex items-start gap-3">
        <div
          class="bg-destructive/10 text-destructive flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        >
          <WifiOff class="h-5 w-5" />
        </div>
        <div class="flex flex-1 flex-col gap-1">
          <Dialog.Title class="text-left"
            >{failedReadKey === 'JsonConfig'
              ? m.terminal_cfg_read_failed_json_title()
              : m.terminal_cfg_read_failed_raw_title()}</Dialog.Title
          >
          <Dialog.Description class="text-left">
            {m.terminal_cfg_read_failed_desc({ attempts: READ_ATTEMPTS })}
          </Dialog.Description>
        </div>
      </div>
    </Dialog.Header>
    <div class="flex flex-col gap-2 py-2">
      <p class="text-muted-foreground text-sm">{m.terminal_cfg_common_causes()}</p>
      <ul class="text-muted-foreground ml-1 flex flex-col gap-1.5 text-sm">
        <li class="flex items-start gap-2">
          <span class="bg-muted-foreground/40 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"></span>
          {m.terminal_cfg_cause_busy()}
        </li>
        <li class="flex items-start gap-2">
          <span class="bg-muted-foreground/40 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"></span>
          {m.terminal_cfg_cause_disconnected()}
        </li>
        <li class="flex items-start gap-2">
          <span class="bg-muted-foreground/40 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"></span>
          {m.terminal_cfg_cause_unsupported()}
        </li>
      </ul>
    </div>
    <Dialog.Footer class="gap-2 sm:gap-2">
      <Button variant="outline" onclick={() => (failedReadOpen = false)}>{m.common_close()}</Button>
      <Button onclick={retryFailedRead}>
        <RefreshCw class="h-4 w-4" />
        {m.common_try_again()}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
