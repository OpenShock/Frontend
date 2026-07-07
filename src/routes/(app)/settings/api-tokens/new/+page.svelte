<script lang="ts" module>
  import { PermissionType } from '$lib/api';
  import type { ValidationResult } from '@openshock/svelte-core/types/ValidationResult.js';

  type PermissionCategory = {
    name: string;
    perms: { name: string; key: string }[];
  };

  const permissionCategories = Object.values(PermissionType).reduce(
    (acc: PermissionCategory[], v) => {
      const [category, perm] = v.split('.');
      const cat = acc.find((c) => c.name === category);
      if (cat) {
        cat.perms.push({ name: perm, key: v });
      } else {
        acc.push({ name: category, perms: [{ name: perm, key: v }] });
      }
      return acc;
    },
    []
  );

  function nameValidation(name: string): ValidationResult {
    if (name.length === 0) return { valid: false, message: 'Name is required' };
    if (name.length > 32) return { valid: false, message: 'Name is too long' };
    return { valid: true };
  }

  function capitalizeFirstLetter(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
</script>

<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { ControlLimitMode, tokensCreateTokenV2 } from '$lib/api';
  import type { ShockerControlSettings } from '$lib/api';
  import { Container } from '@openshock/svelte-core/components';
  import { CopyInput } from '@openshock/svelte-core/components';
  import ExpirationPicker from '$lib/components/ExpirationPicker.svelte';
  import { TextInput } from '@openshock/svelte-core/components/input';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { isValidTokenRedirectUri } from '$lib/utils/url';
  import CircleCheck from '@lucide/svelte/icons/circle-check';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import { toast } from 'svelte-sonner';
  import ShockerControlSettingsEditor, {
    defaultShockerControl,
    durationRange,
    intensityRange,
  } from '../shocker-control-settings.svelte';

  registerBreadcrumbs(() => [
    { label: 'Settings', href: '/settings/account' },
    { label: 'API Tokens', href: '/settings/api-tokens' },
    { label: 'New' },
  ]);

  // Form state (prefilled from query params, then freely editable).
  let name = $state('');
  let expire = $state('never');
  let expireInstant = $state<Temporal.Instant | null>(null);
  let permissions = $state<PermissionType[]>([]);
  let shockerControl = $state<ShockerControlSettings>(defaultShockerControl());

  // External-request context.
  let redirectUri = $state<string | null>(null);
  let parseError = $state<string | null>(null);

  let creating = $state(false);
  let tokenSecret = $state<string | null>(null);

  let isExternal = $derived(redirectUri !== null);
  let nameValidationResult = $derived(nameValidation(name));

  function clampInt(value: string | null, min: number, max: number, fallback: number): number {
    if (value === null) return fallback;
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
  }

  function parseMode(value: string | null, fallback: ControlLimitMode): ControlLimitMode {
    if (value === ControlLimitMode.Lerp) return ControlLimitMode.Lerp;
    if (value === ControlLimitMode.Clamp) return ControlLimitMode.Clamp;
    return fallback;
  }

  function parseQueryParams() {
    const params = page.url.searchParams;

    redirectUri = params.get('redirect_uri');
    const external = redirectUri !== null;

    // Reject redirect targets that could exfiltrate the freshly minted token to
    // an attacker (remote http(s) origins, javascript:/data: schemes, …).
    if (redirectUri !== null && !isValidTokenRedirectUri(redirectUri)) {
      redirectUri = null;
      parseError =
        'The provided redirect_uri is not allowed. Only loopback addresses or custom application schemes are permitted.';
      return;
    }

    const qName = params.get('name');
    const qPermissions = params.get('permissions');

    // An external request must declare what it wants.
    if (external && (!qName || !qPermissions)) {
      parseError =
        'Required get parameters are missing. Make sure name, redirect_uri, and permissions are provided.';
      return;
    }

    if (qName) name = qName;

    if (qPermissions) {
      const requested = qPermissions.split(',').filter(Boolean);
      const invalid = requested.filter(
        (p) => !Object.values(PermissionType).includes(p as PermissionType)
      );
      if (invalid.length > 0) {
        parseError = `Invalid permissions provided: ${invalid.join(', ')}`;
        return;
      }
      permissions = requested as PermissionType[];
    } else if (!external) {
      // Sensible default for the in-app self-service flow.
      permissions = [PermissionType.ShockersUse];
    }

    const qExpiration = params.get('expiration');
    if (qExpiration) {
      try {
        expireInstant = Temporal.Instant.from(qExpiration);
        expire = 'custom';
      } catch {
        // Invalid datetime, leave the default ('never').
      }
    }

    const sc = defaultShockerControl();
    const i = intensityRange;
    const d = durationRange;
    sc.intensity.min = clampInt(params.get('intensity_min'), i.min, i.max, sc.intensity.min);
    sc.intensity.max = clampInt(params.get('intensity_max'), i.min, i.max, sc.intensity.max);
    if (sc.intensity.min > sc.intensity.max) {
      [sc.intensity.min, sc.intensity.max] = [sc.intensity.max, sc.intensity.min];
    }
    sc.intensity.mode = parseMode(params.get('intensity_mode'), sc.intensity.mode);
    sc.duration.min = clampInt(params.get('duration_min'), d.min, d.max, sc.duration.min);
    sc.duration.max = clampInt(params.get('duration_max'), d.min, d.max, sc.duration.max);
    if (sc.duration.min > sc.duration.max) {
      [sc.duration.min, sc.duration.max] = [sc.duration.max, sc.duration.min];
    }
    sc.duration.mode = parseMode(
      params.get('duration_mode'),
      sc.duration.mode ?? ControlLimitMode.Clamp
    );
    shockerControl = sc;
  }

  async function createToken() {
    if (!nameValidationResult.valid) return;
    creating = true;
    try {
      const response = await tokensCreateTokenV2({
        body: { name, validUntil: expireInstant, permissions, shockerControl },
      });
      tokenSecret = response.token;
      toast.success('Token created successfully');
      if (isExternal) redirectBack();
    } catch (error) {
      await handleApiError(error);
    } finally {
      creating = false;
    }
  }

  function redirectBack() {
    if (!tokenSecret || !redirectUri) return;
    // redirectUri was validated in parseQueryParams; encode the token so it
    // can't alter the URL structure of the (trusted) redirect target.
    const target = redirectUri.replace('%', encodeURIComponent(tokenSecret));
    window.location.href = target;
  }

  // Parse query params at init so child pickers receive the prefilled values immediately.
  parseQueryParams();
</script>

<Container class="items-center-safe justify-center-safe overflow-y-auto">
  <Card.Root class="w-lg max-w-2xl shrink-0">
    {#if parseError}
      <Card.Header>
        <Card.Title class="text-2xl">API Token Request</Card.Title>
      </Card.Header>
      <Card.Content>
        <span class="text-red-500">{parseError}</span>
      </Card.Content>
    {:else if tokenSecret && isExternal}
      <Card.Header>
        <Card.Title class="flex items-center gap-2 text-2xl">
          <CircleCheck class="text-green-500" />
          Access granted
        </Card.Title>
        <Card.Description>
          The token has been created and shared with the application. Redirecting you back to<br />
          <b>{redirectUri}</b>
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <span class="text-muted-foreground text-sm">
          If you are not redirected automatically, use the button below.
        </span>
      </Card.Content>
      <Card.Footer class="flex justify-end space-x-2">
        <Button variant="outline" onclick={redirectBack}>Retry</Button>
        <Button href={resolve('/settings/api-tokens')}>Finish</Button>
      </Card.Footer>
    {:else if tokenSecret}
      <Card.Header>
        <Card.Title class="flex items-center gap-2 text-2xl">
          <CircleCheck class="text-green-500" />
          API Token Generated
        </Card.Title>
        <Card.Description>
          Please copy your API Token now, you will not be able to view it again later!
        </Card.Description>
      </Card.Header>
      <Card.Content class="flex flex-col space-y-4">
        <CopyInput value={tokenSecret}>
          {#snippet icon()}
            <KeyRound size="20" />
          {/snippet}
        </CopyInput>
      </Card.Content>
      <Card.Footer class="flex justify-end">
        <Button href={resolve('/settings/api-tokens')}>Done</Button>
      </Card.Footer>
    {:else}
      <Card.Header>
        <Card.Title class="text-2xl">
          {isExternal ? 'API Token Request' : 'New API Token'}
        </Card.Title>
        <Card.Description>
          {#if isExternal}
            An external application is requesting access to your account. Review and adjust the
            permissions below before allowing access.
          {:else}
            Configure and generate a new API token for your account.
          {/if}
        </Card.Description>
      </Card.Header>
      <Card.Content class="flex flex-col space-y-4">
        {#if isExternal}
          <span>
            <b>{name}</b> is requesting an API Token. Your token will be shared with the application
            at<br /><b>{redirectUri}</b>
          </span>
        {/if}

        <TextInput
          label="Token Name"
          placeholder="Token name..."
          bind:value={name}
          validationResult={nameValidationResult}
        />

        <ExpirationPicker bind:option={expire} bind:instant={expireInstant} />

        <div>
          <h2>Permissions</h2>
          <div class="border-surface-500 mt-3 flex flex-col space-y-4 rounded-md border p-4">
            {#each permissionCategories as permission (permission.name)}
              <span>{capitalizeFirstLetter(permission.name)}</span>
              {#each permission.perms as perm (perm.key)}
                <label class="mt-0! ml-4">
                  <input
                    type="checkbox"
                    class="checkbox"
                    value={perm.key}
                    bind:group={permissions}
                  />
                  {capitalizeFirstLetter(perm.name)}
                </label>
              {/each}
            {/each}
          </div>
        </div>

        <div>
          <h2>Shocker Control</h2>
          <div class="mt-3">
            <ShockerControlSettingsEditor bind:settings={shockerControl} />
          </div>
        </div>
      </Card.Content>
      <Card.Footer class="flex justify-end space-x-2">
        <Button
          onclick={createToken}
          disabled={creating || !nameValidationResult.valid}
          color="yellow"
        >
          {#if creating}
            <Spinner />
          {:else if isExternal}
            Allow
          {:else}
            Generate
          {/if}
        </Button>
        <Button href={resolve(isExternal ? '/' : '/settings/api-tokens')} variant="outline">
          {isExternal ? 'Deny' : 'Cancel'}
        </Button>
      </Card.Footer>
    {/if}
  </Card.Root>
</Container>
