<script lang="ts" module>
  import { PermissionType } from '#lib/api/index.js';
  import type { ValidationResult } from '@openshock/svelte-core/types';

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
    if (name.length === 0) return { valid: false, message: m.token_name_required() };
    if (name.length > 32) return { valid: false, message: m.token_name_too_long() };
    return { valid: true };
  }

  function capitalizeFirstLetter(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
</script>

<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { ParaglideMessage } from '@inlang/paraglide-js-svelte';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { ControlLimitMode, tokensCreateTokenV2 } from '#lib/api/index.js';
  import type { ShockerControlSettings } from '#lib/api/index.js';
  import { Container, CopyInput } from '@openshock/svelte-core/components';
  import ExpirationPicker from '#lib/components/ExpirationPicker.svelte';
  import { TextInput } from '@openshock/svelte-core/components/input';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { isValidTokenRedirectUri } from '#lib/utils/url.js';
  import CircleCheck from '@lucide/svelte/icons/circle-check';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import { toast } from 'svelte-sonner';
  import ShockerControlSettingsEditor, {
    defaultShockerControl,
    durationRange,
    intensityRange,
  } from '../shocker-control-settings.svelte';

  registerBreadcrumbs(() => [
    { label: m.sidebar_group_settings(), href: 'settings/account' },
    { label: m.sidebar_settings_api_tokens(), href: 'settings/api-tokens' },
    { label: m.token_new_breadcrumb() },
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
      parseError = m.token_redirect_not_allowed();
      return;
    }

    const qName = params.get('name');
    const qPermissions = params.get('permissions');

    // An external request must declare what it wants.
    if (external && (!qName || !qPermissions)) {
      parseError = m.token_params_missing();
      return;
    }

    if (qName) name = qName;

    if (qPermissions) {
      const requested = qPermissions.split(',').filter(Boolean);
      const invalid = requested.filter(
        (p) => !Object.values(PermissionType).includes(p as PermissionType)
      );
      if (invalid.length > 0) {
        parseError = m.token_invalid_permissions({ list: invalid.join(', ') });
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
      toast.success(m.token_toast_created());
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
        <Card.Title class="text-2xl"><h1>{m.token_request_title()}</h1></Card.Title>
      </Card.Header>
      <Card.Content>
        <span class="text-destructive">{parseError}</span>
      </Card.Content>
    {:else if tokenSecret && isExternal}
      <Card.Header>
        <Card.Title class="flex items-center gap-2 text-2xl">
          <CircleCheck class="text-success" />
          <h1>{m.token_access_granted()}</h1>
        </Card.Title>
        <Card.Description>
          {m.token_shared_redirecting()}<br />
          <b>{redirectUri}</b>
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <span class="text-muted-foreground text-sm">
          {m.token_not_redirected()}
        </span>
      </Card.Content>
      <Card.Footer class="flex justify-end space-x-2">
        <Button variant="outline" onclick={redirectBack}>{m.common_retry()}</Button>
        <Button href={resolve('settings/api-tokens')}>{m.token_finish()}</Button>
      </Card.Footer>
    {:else if tokenSecret}
      <Card.Header>
        <Card.Title class="flex items-center gap-2 text-2xl">
          <CircleCheck class="text-success" />
          <h1>{m.token_generated_title()}</h1>
        </Card.Title>
        <Card.Description>
          {m.token_copy_now()}
        </Card.Description>
      </Card.Header>
      <Card.Content class="flex flex-col space-y-4">
        <CopyInput value={tokenSecret}>
          {#snippet icon()}
            <KeyRound size="20" />
          {/snippet}
        </CopyInput>
      </Card.Content>

      <Card.Footer class="flex justify-end"
        ><Button href={resolve('settings/api-tokens')}>{m.common_done()}</Button></Card.Footer
      >
    {:else}
      <Card.Header>
        <Card.Title class="text-2xl">
          <h1>{isExternal ? m.token_request_title() : m.token_new_title()}</h1>
        </Card.Title>
        <Card.Description>
          {#if isExternal}
            {m.token_external_desc()}
          {:else}
            {m.token_new_desc()}
          {/if}
        </Card.Description>
      </Card.Header>
      <Card.Content class="flex flex-col space-y-4">
        {#if isExternal}
          <span>
            <ParaglideMessage message={m.token_external_requesting} inputs={{ name }}>
              {#snippet b({ children })}<b>{@render children?.()}</b>{/snippet}
            </ParaglideMessage><br /><b>{redirectUri}</b>
          </span>
        {/if}

        <TextInput
          label={m.token_name_label()}
          placeholder={m.token_name_placeholder()}
          bind:value={name}
          validationResult={nameValidationResult}
        />

        <ExpirationPicker bind:option={expire} bind:instant={expireInstant} />

        <div>
          <h2>{m.token_permissions()}</h2>
          <div class="mt-3 flex flex-col space-y-4 rounded-md border p-4">
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
          <h2>{m.token_shocker_control()}</h2>
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
            {m.token_allow()}
          {:else}
            {m.token_generate()}
          {/if}
        </Button>
        <Button href={isExternal ? resolve('') : resolve('settings/api-tokens')} variant="outline">
          {isExternal ? m.token_deny() : m.common_cancel()}
        </Button>
      </Card.Footer>
    {/if}
  </Card.Root>
</Container>
