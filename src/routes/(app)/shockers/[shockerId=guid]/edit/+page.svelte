<script lang="ts">
  import {
    ShockerModelType,
    shockerEditShocker,
    shockerGetShockerById,
    shockerRemoveShocker,
  } from '$lib/api';
  import type { ShockerWithDevice } from '$lib/api';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import Container from '$lib/components/Container.svelte';
  import { dialog } from '$lib/components/dialog-manager/dialog-store.svelte';
  import { RfIdMax, RfIdMin, isValidRfId } from '$lib/constants/ShockerConstants';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Spinner } from '$lib/components/ui/spinner';
  import * as Card from '$lib/components/ui/card';
  import { Field, FieldLabel } from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input';
  import * as Select from '$lib/components/ui/select';
  import PauseToggle from '$lib/components/utils/PauseToggle.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { refreshOwnHubs } from '$lib/state/hubs-state.svelte';
  import { ArrowLeft, Trash2 } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  let shocker = $state<ShockerWithDevice | null>(null);
  let loadError = $state(false);
  let name = $state('');
  let rfId = $state(0);
  let model = $state<ShockerModelType>(ShockerModelType.CaiXianlin);
  let saving = $state(false);

  registerBreadcrumbs(() => [
    { label: 'Shockers', href: '/shockers/own' },
    { label: shocker?.name ?? 'Edit Shocker' },
  ]);

  let hasChanges = $derived(
    shocker !== null &&
      (name.trim() !== shocker.name || rfId !== shocker.rfId || model !== shocker.model)
  );

  let rfIdValid = $derived(isValidRfId(rfId));

  onMount(async () => {
    try {
      const shockerId = page.params.shockerId!;
      const response = await shockerGetShockerById({ path: { shockerId } });
      shocker = response.data;
      name = shocker.name;
      rfId = shocker.rfId;
      model = shocker.model;
    } catch (error) {
      loadError = true;
      handleApiError(error);
    }
  });

  async function save() {
    if (!shocker || !name.trim() || !rfIdValid) return;
    saving = true;
    try {
      await shockerEditShocker({
        path: { shockerId: shocker.id },
        body: {
          name: name.trim(),
          rfId,
          model,
          device: shocker.device,
        },
      });
      shocker.name = name.trim();
      shocker.rfId = rfId;
      shocker.model = model;
      toast.success('Shocker updated');
      await refreshOwnHubs();
    } catch (error) {
      handleApiError(error);
    } finally {
      saving = false;
    }
  }

  async function deleteShocker() {
    if (!shocker) return;
    const result = await dialog.confirm({
      title: 'Delete Shocker',
      desc: `Are you sure you want to delete "${shocker.name}"? This action cannot be undone.`,
      confirmButtonText: 'Delete',
    });
    if (!result.confirmed) return;
    try {
      await shockerRemoveShocker({ path: { shockerId: shocker.id } });
      toast.success(`Shocker "${shocker.name}" deleted`);
      await refreshOwnHubs();
      goto(resolve('/shockers/own'));
    } catch (error) {
      handleApiError(error);
    }
  }
</script>

<Container>
  {#if loadError}
    <div class="flex flex-col items-center gap-4 py-12">
      <p class="text-muted-foreground">Failed to load shocker.</p>
      <Button variant="outline" href={resolve('/shockers/own')}>
        <ArrowLeft class="size-4" />
        Back to Shockers
      </Button>
    </div>
  {:else if !shocker}
    <div class="flex items-center gap-3 p-12">
      <Spinner class="size-5" />
      <span class="text-muted-foreground">Loading shocker...</span>
    </div>
  {:else}
    <div class="mx-auto flex w-full max-w-lg flex-col gap-6 py-4">
      <div class="flex items-center gap-3">
        <Button variant="ghost" size="icon" href={resolve('/shockers/own')} aria-label="Back">
          <ArrowLeft class="size-4" />
        </Button>
        <h1 class="text-2xl font-bold">Edit Shocker</h1>
      </div>

      <Card.Root>
        <Card.Header>
          <Card.Title>Shocker Details</Card.Title>
          <Card.Description>Update the name, RF ID, and model for this shocker.</Card.Description>
        </Card.Header>
        <Card.Content class="flex flex-col gap-4">
          <TextInput label="Name" placeholder="Shocker name" bind:value={name} />

          <Field class="gap-2">
            <FieldLabel>RF ID</FieldLabel>
            <Input type="number" bind:value={rfId} min={RfIdMin} max={RfIdMax} step={1} />
            {#if !rfIdValid}
              <span class="text-destructive text-sm">
                RF ID must be a whole number between {RfIdMin} and {RfIdMax}.
              </span>
            {/if}
          </Field>

          <Field class="gap-2">
            <FieldLabel>Model</FieldLabel>
            <Select.Root type="single" name="model" bind:value={model}>
              <Select.Trigger>
                {model ?? 'Select model'}
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  {#each Object.values(ShockerModelType) as option (option)}
                    <Select.Item value={option} label={option}>
                      {option}
                    </Select.Item>
                  {/each}
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </Field>

          <Field class="gap-2">
            <FieldLabel>Pause State</FieldLabel>
            <div class="flex items-center gap-2">
              <PauseToggle
                shockerId={shocker.id}
                bind:paused={shocker.isPaused}
                userShareUserId={undefined}
                onPausedChange={() => {}}
              />
              <span class="text-muted-foreground text-sm">
                {shocker.isPaused ? 'Shocker is paused' : 'Shocker is active'}
              </span>
            </div>
          </Field>
        </Card.Content>
        <Card.Footer>
          <Button disabled={saving || !name.trim() || !rfIdValid || !hasChanges} onclick={save}>
            {#if saving}<Spinner class="size-4" />{/if}
            Save Changes
          </Button>
        </Card.Footer>
      </Card.Root>

      <Card.Root class="border-destructive/30">
        <Card.Header>
          <Card.Title class="text-destructive">Danger Zone</Card.Title>
          <Card.Description>
            Permanently delete this shocker. This action cannot be undone.
          </Card.Description>
        </Card.Header>
        <Card.Footer>
          <Button variant="destructive" onclick={deleteShocker}>
            <Trash2 class="size-4" />
            Delete Shocker
          </Button>
        </Card.Footer>
      </Card.Root>
    </div>
  {/if}
</Container>
