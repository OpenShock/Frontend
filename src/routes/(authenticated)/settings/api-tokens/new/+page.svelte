<script lang="ts">
  import { apiTokensApi } from '$lib/api';
  import { PermissionType, instanceOfPermissionType } from '$lib/api/internal/v1';
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import type { QueryParamsType } from './queryParamsType';

  let windowQueryParams = $state<
    | QueryParamsType
    | {
        error: string;
      }
  >({
    error: 'Loading...',
  });

  let creatingToken = $state(false);
  let tokenSecret = $state<string | null>(null);

  function getQueryParams():
    | QueryParamsType
    | {
        error: string;
      } {
    if (typeof window === 'undefined') {
      throw new Error('getQueryParams can only be called in the browser');
    }

    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);

    const name = params.get('name');
    const redirectUri = params.get('redirect_uri');
    const permissions = params.get('permissions');

    if (!name || !redirectUri || !permissions) {
      return {
        error:
          'Required get parameters are missing. Make sure name, redirect_uri, and permissions are provided.',
      };
    }

    const permissionsArray = permissions.split(',');
    if (permissionsArray.length === 0) {
      return {
        error: 'Permissions cannot be empty',
      };
    }

    let invalidPermissions: string[] = [];

    permissionsArray.forEach((p) => {
      if (!instanceOfPermissionType(p)) {
        invalidPermissions.push(p);
      }
    });

    if (invalidPermissions.length > 0) {
      return {
        error: `Invalid permissions provided: ${invalidPermissions.join(', ')}`,
      };
    }

    return {
      name: name,
      redirectUri: redirectUri,
      permissions: permissionsArray.map((p) => p as PermissionType),
    };
  }

  function allowRequest() {
    const params = windowQueryParams as QueryParamsType;

    creatingToken = true;

    apiTokensApi
      .tokensCreateToken({
        name: params.name,
        permissions: params.permissions as PermissionType[],
      })
      .then((response) => {
        tokenSecret = response.token;
        openUrl();
      })
      .catch((error) => {
        // Handle error in token creation, e.g., show an error message
        console.error('Error creating token:', error);
        toast.error('Failed to create token');
      });
  }

  function openUrl() {
    if (!tokenSecret) {
      console.error('Token secret is not available');
      toast.error('Token secret is not available');
      return;
    }

    if (!windowQueryParams) {
      console.error('Redirect URI is not available');
      toast.error('Redirect URI is not available');
      return;
    }

    const redirectUriReplaced = (windowQueryParams as QueryParamsType).redirectUri.replace('%', tokenSecret);;

    console.log('Redirecting to:', redirectUriReplaced);
    window.location.href = redirectUriReplaced;
  }

  onMount(() => {
    windowQueryParams = getQueryParams();
  });
</script>

<div class="flex items-center justify-center h-full w-full">
  <Card.Root class="w-lg max-w-2xl">
    {#if 'error' in windowQueryParams}
      <Card.Header>
        <Card.Title class="text-2xl">API Token Request</Card.Title>
      </Card.Header>
      <Card.Content>
        <span class="text-red-500">
          {windowQueryParams.error}
        </span>
      </Card.Content>
    {:else}
      <Card.Header>
        <Card.Title class="text-2xl">API Token Request</Card.Title>
        <Card.Description
          >An external application is requesting access to your account. Please review the
          permissions it is requesting before allowing access</Card.Description
        >
      </Card.Header>
      <Card.Content class="flex flex-col space-y-4">
        <span>
          <b>{windowQueryParams.name}</b> is requesting an API Token with the following permissions:
        </span>
        <ul class="list-disc pl-5">
          {#each windowQueryParams.permissions as permission}
            <li>{permission}</li>
          {/each}
        </ul>
        <span class="mt-4">
          Your token will be shared with the application at<br /><b
            >{windowQueryParams.redirectUri}</b
          ></span
        >
      </Card.Content>
      <Card.Footer class="flex justify-end space-x-2">
        <Button class="m-w-16" onclick={allowRequest} disabled={creatingToken && !tokenSecret} color="yellow">
          {#if tokenSecret}
            <span>Open Again</span>
          {:else if creatingToken}
            <LoadingCircle />
          {:else}
            Allow
          {/if}
        </Button>
        <Button class="w-16" href="/" variant="outline">Deny</Button>
      </Card.Footer>
    {/if}
  </Card.Root>
</div>
