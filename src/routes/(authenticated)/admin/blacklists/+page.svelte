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
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import type { TimeoutHandle } from '$lib/types/WAPI';

  // --- state ---
  let usernameEntry = $state<string>('');
  let matchTypeEntry = $state<MatchTypeEnum>(MatchTypeEnum.Exact);
  let usernameBlacklist = $state<UserNameBlacklistDto[]>([]);
  let isLoadingUsernames = $state(false);

  let emailEntry = $state<string>('');
  let emailEntryValid = $derived<ValidationResult>(
    emailEntry.length > 0
      ? /^[A-Z-]+\.[A-Z]{2,24}$/i.test(emailEntry)
        ? { valid: true }
        : { valid: false, message: 'Invalid domain' }
      : { valid: false }
  );
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
  async function loadUsernames() {
    isLoadingUsernames = true;
    try {
      usernameBlacklist = await adminApi.adminListUsernameBlacklist(
        usernameEntry.length > 0 ? usernameEntry : undefined
      );
    } catch (err) {
      handleApiError(err);
    } finally {
      isLoadingUsernames = false;
    }
  }

  async function loadEmails() {
    isLoadingEmails = true;
    try {
      emailBlacklist = await adminApi.adminListEmailProviderBlacklist(
        emailEntry.length > 0 ? emailEntry : undefined
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
    } catch (err) {
      handleApiError(err);
    } finally {
      usernameEntry = '';
      loadUsernames();
    }
  }

  async function removeUsername(id: string) {
    try {
      await adminApi.adminRemoveUsernameBlacklist(id);
      loadUsernames();
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
    emailEntry = '';
    loadEmails();
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
        emailEntry = '';
        loadEmails();
      }
    } catch (err) {
      handleApiError(err);
    }
  }

  async function removeEmail(id: string) {
    try {
      await adminApi.adminRemoveEmailProviderBlacklist(id);
      loadEmails();
    } catch (err) {
      handleApiError(err);
    }
  }

  let usernameDebounce: TimeoutHandle | undefined;
  $effect(() => {
    clearTimeout(usernameDebounce);
    if (usernameEntry.length == 0) {
      loadUsernames();
      return;
    }

    usernameDebounce = setTimeout(() => loadUsernames(), 400);
  });

  let emailDebounce: TimeoutHandle | undefined;
  $effect(() => {
    clearTimeout(emailDebounce);
    if (emailEntry.length == 0) {
      loadEmails();
      return;
    }

    if (!emailEntryValid) return;

    emailDebounce = setTimeout(() => loadEmails(), 400);
  });
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
  <!-- Username Blacklist -->
  <Card>
    <CardHeader>
      <CardTitle>Username Blacklist</CardTitle>
      <TextInput autocomplete="off" placeholder="e.g. baduser123" bind:value={usernameEntry}>
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
    <CardContent class="overflow-clip">
      <ScrollArea>
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
      <TextInput
        type="url"
        autocomplete="off"
        placeholder="e.g. gmail.com"
        bind:value={emailEntry}
        validationResult={emailEntryValid}
      >
        {#snippet after()}
          <Button onclick={addEmailEntry} disabled={isLoadingEmails}>Add</Button>
          <Button onclick={addEmailsBatch} disabled={isLoadingEmails}
            >Batch Upload From Clipboard</Button
          >
        {/snippet}
      </TextInput>
    </CardHeader>
    <CardContent class="overflow-clip">
      <ScrollArea>
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
