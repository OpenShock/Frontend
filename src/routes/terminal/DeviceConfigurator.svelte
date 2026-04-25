<script lang="ts">
  import { AlertTriangle, Eye, RefreshCw, Send, TriangleAlert, WifiOff } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import ConfirmDeleteDialog from '$lib/components/ConfirmDeleteDialog.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Switch } from '$lib/components/ui/switch';
  import { Textarea } from '$lib/components/ui/textarea';
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
    for (const line of terminal.lines) {
      if (line.id <= lastSeenLineId) continue;
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
  let failedReadField = $state('');
  let failedReadKey = $state('');

  async function readWithRetry(
    command: string,
    key: string,
    friendlyName: string
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= READ_ATTEMPTS; attempt++) {
      const outcome = await readOnce(command, key);
      if (outcome === 'success') return true;
    }
    failedReadField = friendlyName;
    failedReadKey = key;
    failedReadOpen = true;
    return false;
  }

  async function readJsonConfig() {
    if (isReadingJson) return;
    isReadingJson = true;
    try {
      await readWithRetry('jsonconfig', 'JsonConfig', 'JSON config');
    } finally {
      isReadingJson = false;
    }
  }

  async function readRawConfig() {
    if (isReadingRaw) return;
    isReadingRaw = true;
    try {
      await readWithRetry('rawconfig', 'RawConfig', 'raw config');
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

  function handleFactoryReset() {
    confirmFactoryResetOpen = false;
    send('factoryreset');
  }
</script>

<div class="flex flex-col gap-4">
  <!-- Introductory note -->
  <p class="text-muted-foreground text-sm">
    Values are sent to the device via UART. Read the device's response in the console below.
    Commands without an argument act as getters; use the
    <Eye class="inline h-3.5 w-3.5" /> button next to each field to read the current value.
  </p>

  <!-- RF -->
  <Card.Root>
    <Card.Header>
      <Card.Title>RF Transmitter</Card.Title>
      <Card.Description>Controls the shocker RF output.</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <Label for="cfg-rftxpin">TX GPIO pin</Label>
        <div class="flex gap-2">
          <Input
            id="cfg-rftxpin"
            type="number"
            min={0}
            placeholder="e.g. 15"
            bind:value={rfTxPin}
            {disabled}
          />
          <Button
            variant="outline"
            {disabled}
            onclick={() => send('rftxpin')}
            title="Read current value"
          >
            <Eye />
          </Button>
          <Button
            onclick={() => rfTxPin !== '' && send(`rftxpin ${rfTxPin}`)}
            disabled={disabled || rfTxPin === ''}
          >
            <Send />
            Set
          </Button>
        </div>
      </div>

      <div class="flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <Label for="cfg-keepalive">Keepalive enabled</Label>
          <span class="text-muted-foreground text-sm">
            Periodically pings paired shockers to keep them awake.
          </span>
        </div>
        <div class="flex items-center gap-2">
          <Switch id="cfg-keepalive" bind:checked={keepaliveEnabled} {disabled} />
          <Button
            variant="outline"
            size="sm"
            {disabled}
            onclick={() => send('keepalive')}
            title="Read current value"
          >
            <Eye />
          </Button>
          <Button size="sm" {disabled} onclick={() => send(`keepalive ${keepaliveEnabled}`)}>
            <Send />
            Set
          </Button>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- EStop -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Emergency Stop</Card.Title>
      <Card.Description>Hardware button that halts all output.</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
      <div class="flex items-center justify-between gap-4">
        <Label for="cfg-estop-enabled">EStop enabled</Label>
        <div class="flex items-center gap-2">
          <Switch id="cfg-estop-enabled" bind:checked={estopEnabled} {disabled} />
          <Button
            variant="outline"
            size="sm"
            {disabled}
            onclick={() => send('estop enabled')}
            title="Read current value"
          >
            <Eye />
          </Button>
          <Button size="sm" {disabled} onclick={() => send(`estop enabled ${estopEnabled}`)}>
            <Send />
            Set
          </Button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="cfg-estop-pin">EStop GPIO pin</Label>
        <div class="flex gap-2">
          <Input
            id="cfg-estop-pin"
            type="number"
            min={0}
            placeholder="e.g. 13"
            bind:value={estopPin}
            {disabled}
          />
          <Button
            variant="outline"
            {disabled}
            onclick={() => send('estop pin')}
            title="Read current value"
          >
            <Eye />
          </Button>
          <Button
            onclick={() => estopPin !== '' && send(`estop pin ${estopPin}`)}
            disabled={disabled || estopPin === ''}
          >
            <Send />
            Set
          </Button>
        </div>
        <p class="text-muted-foreground text-xs">
          Note: <code>estop.latching</code> and <code>estop.active</code> have no dedicated commands;
          set them via the JSON config below.
        </p>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- WiFi -->
  <Card.Root>
    <Card.Header>
      <Card.Title>WiFi</Card.Title>
      <Card.Description>Station credentials and device hostname.</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <Label for="cfg-hostname">Hostname</Label>
        <div class="flex gap-2">
          <Input
            id="cfg-hostname"
            placeholder="e.g. OpenShock-Kitchen"
            bind:value={hostname}
            {disabled}
          />
          <Button
            variant="outline"
            {disabled}
            onclick={() => send('hostname')}
            title="Read current value"
          >
            <Eye />
          </Button>
          <Button
            onclick={() => hostname && send(`hostname ${hostname}`)}
            disabled={disabled || !hostname}
          >
            <Send />
            Set
          </Button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="cfg-networks">Networks (JSON array)</Label>
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
            Must be a valid JSON array
          </p>
        {/if}
        <div class="flex gap-2">
          <Button
            variant="outline"
            {disabled}
            onclick={() => send('networks')}
            title="Read current value"
          >
            <Eye />
            Read
          </Button>
          <Button
            onclick={() => isValidJsonArray(networksJson) && send(`networks ${networksJson}`)}
            disabled={disabled || !isValidJsonArray(networksJson)}
          >
            <Send />
            Set
          </Button>
        </div>
        <p class="text-muted-foreground text-xs">
          AP settings (<code>ap_ssid</code>, <code>ap_password</code>, <code>ap_disabled</code>,
          <code>sta_disabled</code>, <code>offline_mode</code>) have no dedicated commands;
          use the JSON config.
        </p>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Backend -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Backend</Card.Title>
      <Card.Description>OpenShock server and authentication.</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <Label for="cfg-domain">Domain</Label>
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
            title="Read current value"
          >
            <Eye />
          </Button>
          <Button
            onclick={() => backendDomain && send(`domain ${backendDomain}`)}
            disabled={disabled || !backendDomain}
          >
            <Send />
            Set
          </Button>
        </div>
        <p class="text-muted-foreground flex items-center gap-1 text-xs">
          <AlertTriangle class="h-3.5 w-3.5" />
          Setting the domain will restart the device.
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="cfg-authtoken">Auth token</Label>
        <div class="flex gap-2">
          <Input
            id="cfg-authtoken"
            type={showAuthToken ? 'text' : 'password'}
            placeholder="Paste device token"
            bind:value={authToken}
            autocomplete="off"
            {disabled}
          />
          <Button
            variant="outline"
            {disabled}
            onclick={() => (showAuthToken = !showAuthToken)}
            title={showAuthToken ? 'Hide' : 'Show'}
          >
            <Eye />
          </Button>
          <Button
            onclick={() => authToken && send(`authtoken ${authToken}`)}
            disabled={disabled || !authToken}
          >
            <Send />
            Set
          </Button>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Serial -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Serial Input</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <Label for="cfg-echo">Echo enabled</Label>
          <span class="text-muted-foreground text-sm">
            Print typed characters back to the console.
          </span>
        </div>
        <div class="flex items-center gap-2">
          <Switch id="cfg-echo" bind:checked={echoEnabled} {disabled} />
          <Button
            variant="outline"
            size="sm"
            {disabled}
            onclick={() => send('echo')}
            title="Read current value"
          >
            <Eye />
          </Button>
          <Button size="sm" {disabled} onclick={() => send(`echo ${echoEnabled}`)}>
            <Send />
            Set
          </Button>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Advanced -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Advanced: full config</Card.Title>
      <Card.Description>
        For fields without dedicated commands (captive portal, OTA, LAN, etc.), replace the entire
        config.
      </Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <Label for="cfg-jsonconfig">JSON config</Label>
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
            Must be valid JSON
          </p>
        {/if}
        <div class="flex gap-2">
          <Button
            variant="outline"
            disabled={disabled || isReadingJson}
            onclick={readJsonConfig}
            title="Read current config as JSON"
          >
            <Eye />
            {isReadingJson ? 'Reading…' : 'Read'}
          </Button>
          <Button
            onclick={() => isValidJson(jsonConfig) && send(`jsonconfig ${jsonConfig}`)}
            disabled={disabled || !isValidJson(jsonConfig)}
          >
            <Send />
            Apply
          </Button>
        </div>
        <p class="text-muted-foreground flex items-center gap-1 text-xs">
          <AlertTriangle class="h-3.5 w-3.5" />
          Applying a JSON config will restart the device.
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="cfg-rawconfig">Raw FlatBuffer config (base64)</Label>
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
            Must be a valid base64 string
          </p>
        {/if}
        <div class="flex gap-2">
          <Button
            variant="outline"
            disabled={disabled || isReadingRaw}
            onclick={readRawConfig}
            title="Read current config as base64"
          >
            <Eye />
            {isReadingRaw ? 'Reading…' : 'Read'}
          </Button>
          <Button
            onclick={() => isBase64(rawConfig) && send(`rawconfig ${rawConfig.replace(/\s/g, '')}`)}
            disabled={disabled || !isBase64(rawConfig)}
          >
            <Send />
            Apply
          </Button>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Danger zone -->
  <Card.Root class="border-destructive/50">
    <Card.Header>
      <Card.Title class="text-destructive">Danger zone</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="font-medium">Factory reset</span>
          <span class="text-muted-foreground text-sm">
            Wipes the entire device configuration.
          </span>
        </div>
        <Button variant="destructive" {disabled} onclick={() => (confirmFactoryResetOpen = true)}>
          Factory reset
        </Button>
      </div>
    </Card.Content>
  </Card.Root>
</div>

<ConfirmDeleteDialog
  bind:open={confirmFactoryResetOpen}
  title="Factory reset device?"
  actionLabel="Wipe config"
  onConfirm={handleFactoryReset}
>
  {#snippet description()}
    This will erase all configuration on the device; WiFi networks, backend credentials,
    pins, and all other settings. The device will be reset to defaults.
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
          <Dialog.Title class="text-left">Couldn't read {failedReadField}</Dialog.Title>
          <Dialog.Description class="text-left">
            The device didn't respond after {READ_ATTEMPTS} attempts.
          </Dialog.Description>
        </div>
      </div>
    </Dialog.Header>
    <div class="flex flex-col gap-2 py-2">
      <p class="text-muted-foreground text-sm">Common causes:</p>
      <ul class="text-muted-foreground ml-1 flex flex-col gap-1.5 text-sm">
        <li class="flex items-start gap-2">
          <span class="bg-muted-foreground/40 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"></span>
          The device is busy handling another command.
        </li>
        <li class="flex items-start gap-2">
          <span class="bg-muted-foreground/40 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"></span>
          The device disconnected or rebooted.
        </li>
        <li class="flex items-start gap-2">
          <span class="bg-muted-foreground/40 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"></span>
          The firmware version doesn't support this command.
        </li>
      </ul>
    </div>
    <Dialog.Footer class="gap-2 sm:gap-2">
      <Button variant="outline" onclick={() => (failedReadOpen = false)}>Close</Button>
      <Button onclick={retryFailedRead}>
        <RefreshCw class="h-4 w-4" />
        Try again
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
