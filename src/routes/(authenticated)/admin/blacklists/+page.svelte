<script lang="ts">
  import { Trash2 } from '@lucide/svelte';
  import { adminApi } from '$lib/api';
  import {
    type EmailProviderBlacklistDto,
    MatchTypeEnum,
    type UserNameBlacklistDto,
  } from '$lib/api/internal/v1';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { ScrollArea } from '$lib/components/ui/scroll-area';
  import * as Select from '$lib/components/ui/select';
  import { Separator } from '$lib/components/ui/separator';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import type { TimeoutHandle } from '$lib/types/WAPI';

  // --- state ---
  let usernameEntry = $state<string>('');
  let matchTypeEntry = $state<MatchTypeEnum>(MatchTypeEnum.Exact);
  let usernameBlacklist = $state<UserNameBlacklistDto[]>([]);
  let isLoadingUsernames = $state(false);

  let emailEntry = $state<string>('');
  let emailBlacklist = $state<EmailProviderBlacklistDto[]>([]);
  let isLoadingEmails = $state(false);

  const matchTypes = Object.values(MatchTypeEnum).map((type) => ({ value: type, label: type }));

  let triggerLabel = $derived(
    matchTypes.find((m) => m.value === matchTypeEntry)?.label ?? 'Match type'
  );

  function limit<T>(arr: T[], size: number) {
    return arr.length > size ? arr.slice(0, size) : arr;
  }

  // --- API calls ---
  async function loadUsernames(filter: string) {
    isLoadingUsernames = true;
    try {
      usernameBlacklist = await adminApi.adminListUsernameBlacklist(
        filter.length > 0 ? filter : undefined
      );
    } catch (err) {
      handleApiError(err);
    } finally {
      isLoadingUsernames = false;
    }
  }

  async function loadEmails(filter: string) {
    isLoadingEmails = true;
    try {
      emailBlacklist = await adminApi.adminListEmailProviderBlacklist(
        filter.length > 0 ? filter : undefined
      );
    } catch (err) {
      handleApiError(err);
    } finally {
      isLoadingEmails = false;
    }
  }

  // --- handlers ---
  async function addUsernameEntry() {
    const value = usernameEntry.trim();
    if (!value) return;

    try {
      await adminApi.adminAddUsernameBlacklist({ value, matchType: matchTypeEntry });
      loadUsernames(value);
    } catch (err) {
      handleApiError(err);
    }
  }

  async function removeUsername(id: string) {
    try {
      await adminApi.adminRemoveUsernameBlacklist(id);
      loadUsernames(usernameEntry);
    } catch (err) {
      handleApiError(err);
    }
  }

  async function addEmail(domain: string) {
    try {
      await adminApi.adminAddEmailProviderBlacklist({ domains: [domain] });
    } catch (err) {
      handleApiError(err);
    }
  }

  async function addEmailEntry() {
    const value = emailEntry.trim();
    if (!value) return;
    await addEmail(value);
    loadEmails(value);
  }

  async function addEmailsBatch() {
    try {
      const text = await navigator.clipboard.readText();
      const domains = text
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (domains.length) {
        await adminApi.adminAddEmailProviderBlacklist({ domains });
        loadEmails('');
      }
    } catch (err) {
      handleApiError(err);
    }
  }

  async function removeEmail(id: string) {
    try {
      await adminApi.adminRemoveEmailProviderBlacklist(id);
      loadEmails(emailEntry);
    } catch (err) {
      handleApiError(err);
    }
  }

  let usernameDebounce: TimeoutHandle | undefined;
  $effect(() => {
    clearTimeout(usernameDebounce);
    if (usernameEntry.length == 0) {
      loadUsernames('');
      return;
    }

    usernameDebounce = setTimeout(() => loadUsernames(usernameEntry), 400);
  });

  let emailDebounce: TimeoutHandle | undefined;
  $effect(() => {
    clearTimeout(emailDebounce);
    if (emailEntry.length == 0) {
      loadEmails('');
      return;
    }

    emailDebounce = setTimeout(() => loadEmails(emailEntry), 400);
  });
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
  <!-- Username Blacklist -->
  <Card>
    <CardHeader>
      <CardTitle>Username Blacklist</CardTitle>
      <TextInput placeholder="e.g. baduser123" bind:value={usernameEntry}>
        {#snippet after()}
          <Select.Root type="single" name="matchType" bind:value={matchTypeEntry}>
            <Select.Trigger class="w-[150px]">{triggerLabel}</Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.Label>Match Type</Select.Label>
                {#each matchTypes as m (m.value)}
                  <Select.Item value={m.value} label={m.label}>{m.label}</Select.Item>
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>

          <Button onclick={addUsernameEntry} disabled={isLoadingUsernames}>Add</Button>
        {/snippet}
      </TextInput>
    </CardHeader>
    <CardContent>
      <ScrollArea class="max-h-64">
        <div class="space-y-2">
          {#each limit(usernameBlacklist, 10) as item (item.id)}
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center space-x-2">
                <span>{item.value}</span>
                <span class="px-2 py-0.5 text-xs rounded bg-gray-800">{item.matchType}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onclick={() => removeUsername(item.id)}
                disabled={isLoadingUsernames}
              >
                <Trash2 size="16" class="text-red-500" />
              </Button>
            </div>
            <Separator />
          {/each}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>

  <!-- Email-Provider Blacklist -->
  <Card>
    <CardHeader>
      <CardTitle>Email-Provider Blacklist</CardTitle>
      <TextInput placeholder="e.g. gmail.com" bind:value={emailEntry}>
        {#snippet after()}
          <Button onclick={addEmailEntry} disabled={isLoadingEmails}>Add</Button>
          <Button onclick={addEmailsBatch} disabled={isLoadingEmails}
            >Batch Upload From Clipboard</Button
          >
        {/snippet}
      </TextInput>
    </CardHeader>
    <CardContent>
      <ScrollArea class="max-h-64">
        <div class="space-y-2">
          {#each limit(emailBlacklist, 10) as item (item.id)}
            <div class="flex items-center justify-between text-sm">
              <span>{item.domain}</span>
              <Button
                variant="ghost"
                size="sm"
                onclick={() => removeEmail(item.id)}
                disabled={isLoadingEmails}
              >
                <Trash2 size="16" class="text-red-500" />
              </Button>
            </div>
            <Separator />
          {/each}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
</div>
