<script lang="ts">
  import { AlertTriangle, Eye, Send, TriangleAlert } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import ConfirmDeleteDialog from '$lib/components/ConfirmDeleteDialog.svelte';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Switch } from '$lib/components/ui/switch';
  import { Textarea } from '$lib/components/ui/textarea';

  interface Props {
    disabled?: boolean;
    onSendCommand: (command: string) => void;
  }

  let { disabled = false, onSendCommand }: Props = $props();

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

  function isHex(s: string): boolean {
    return /^[0-9a-fA-F\s]+$/.test(s) && s.replace(/\s/g, '').length % 2 === 0;
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
    Commands without an argument act as getters &mdash; use the
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
          Note: <code>estop.latching</code> and <code>estop.active</code> have no dedicated commands &mdash;
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
          <code>sta_disabled</code>, <code>offline_mode</code>) have no dedicated commands &mdash;
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
            {disabled}
            onclick={() => send('jsonconfig')}
            title="Read current config as JSON"
          >
            <Eye />
            Read
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
        <Label for="cfg-rawconfig">Raw FlatBuffer config (hex)</Label>
        <Textarea
          id="cfg-rawconfig"
          rows={4}
          class="font-mono text-xs"
          placeholder="0a1b2c..."
          bind:value={rawConfig}
          {disabled}
        />
        {#if rawConfig && !isHex(rawConfig)}
          <p class="text-destructive flex items-center gap-1 text-xs">
            <TriangleAlert class="h-3.5 w-3.5" />
            Must be an even-length hex string
          </p>
        {/if}
        <div class="flex gap-2">
          <Button
            variant="outline"
            {disabled}
            onclick={() => send('rawconfig')}
            title="Read current config as hex"
          >
            <Eye />
            Read
          </Button>
          <Button
            onclick={() => isHex(rawConfig) && send(`rawconfig ${rawConfig.replace(/\s/g, '')}`)}
            disabled={disabled || !isHex(rawConfig)}
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
    This will erase all configuration on the device &mdash; WiFi networks, backend credentials,
    pins, and all other settings. The device will be reset to defaults.
  {/snippet}
</ConfirmDeleteDialog>
