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
  import { onMount } from 'svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

  // --- state ---
  let usernameEntry = $state<string>('');
  let matchTypeEntry = $state<MatchTypeEnum>(MatchTypeEnum.Exact);
  let usernameBlacklist = $state<UserNameBlacklistDto[]>([]);

  let emailEntry = $state<string>('');
  let emailBlacklist = $state<EmailProviderBlacklistDto[]>([]);

  // Prepare select options
  const matchTypes = Object.values(MatchTypeEnum).map((type) => ({ value: type, label: type }));
  const triggerLabel = $derived.by(
    () => matchTypes.find((m) => m.value === matchTypeEntry)?.label ?? 'Match type'
  );

  // --- load helpers ---
  function loadUsernames() {
    adminApi.adminListUsernameBlacklist().then((list) => (usernameBlacklist = list));
  }
  function loadEmails() {
    adminApi.adminListEmailProviderBlacklist().then((list) => (emailBlacklist = list));
  }

  // --- username handlers ---
  function addUsername() {
    if (!usernameEntry.trim()) return;
    adminApi
      .adminAddUsernameBlacklist({
        value: usernameEntry,
        matchType: matchTypeEntry,
      })
      .then(() => {
        usernameEntry = '';
        matchTypeEntry = MatchTypeEnum.Exact;
        loadUsernames();
      });
  }
  function removeUsername(id: string) {
    adminApi.adminRemoveUsernameBlacklist(id).then(loadUsernames);
  }

  function uploadDomains(domains: string[]) {
    return adminApi
      .adminAddEmailProviderBlacklist({ domains })
      .then(loadEmails)
      .catch(handleApiError);
  }

  // --- email-provider handlers ---
  function addEmail() {
    uploadDomains([emailEntry]);
    emailEntry = '';
  }
  function addEmailsBatch() {
    navigator.clipboard.readText().then((text) => uploadDomains(text.split(/\r|\n/).filter(s => s.trim().length != 0)));
  }
  function removeEmail(id: string) {
    adminApi.adminRemoveEmailProviderBlacklist(id).then(loadEmails);
  }

  onMount(() => {
    loadUsernames();
    loadEmails();
  });
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
  <!-- Username Blacklist -->
  <Card>
    <CardHeader>
      <CardTitle>Username Blacklist</CardTitle>
      <div class="mt-4 flex items-center gap-2">
        <TextInput label="Username" placeholder="e.g. baduser123" bind:value={usernameEntry} />

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

        <Button onclick={addUsername}>Add</Button>
      </div>
    </CardHeader>
    <CardContent>
      <ScrollArea class="max-h-64">
        <div class="space-y-2">
          {#each usernameBlacklist as item (item.id)}
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center space-x-2">
                <span>{item.value}</span>
                <span class="px-2 py-0.5 text-xs rounded bg-gray-800">{item.matchType}</span>
              </div>
              <Button variant="ghost" size="sm" onclick={() => removeUsername(item.id)}>
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
      <div class="mt-4 flex items-center gap-2">
        <TextInput label="Email domain" placeholder="e.g. gmail.com" bind:value={emailEntry} />
        <Button onclick={addEmail}>Add</Button>
        <Button onclick={addEmailsBatch}>Batch Upload From Clipboard</Button>
      </div>
    </CardHeader>
    <CardContent>
      <ScrollArea class="max-h-64">
        <div class="space-y-2">
          {#each emailBlacklist as item (item.id)}
            <div class="flex items-center justify-between text-sm">
              <span>{item.domain}</span>
              <Button variant="ghost" size="sm" onclick={() => removeEmail(item.id)}>
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
