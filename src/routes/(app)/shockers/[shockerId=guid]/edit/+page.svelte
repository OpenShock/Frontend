<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { shockersV1Api } from '$lib/api';
  import { ShockerModelType, type ShockerWithDevice } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import { dialog } from '$lib/components/dialog-manager/dialog-store.svelte';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Field, FieldLabel } from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input';
  import * as Select from '$lib/components/ui/select';
  import PauseToggle from '$lib/components/utils/PauseToggle.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { refreshOwnHubs } from '$lib/stores/HubsStore.svelte';
  import { LoaderCircle } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  const modelOptions = [
    { value: ShockerModelType.CaiXianlin, label: 'CaiXianlin' },
    { value: ShockerModelType.PetTrainer, label: 'PetTrainer' },
    { value: ShockerModelType.Petrainer998Dr, label: 'Petrainer998DR' },
  ];

  let shocker = $state<ShockerWithDevice | null>(null);
  let name = $state('');
  let rfId = $state(0);
  let model = $state<ShockerModelType>(ShockerModelType.CaiXianlin);
  let saving = $state(false);

  onMount(async () => {
    try {
      const shockerId = page.params.shockerId!;
      const response = await shockersV1Api.shockerGetShockerById(shockerId);
      shocker = response.data;
      name = shocker.name;
      rfId = shocker.rfId;
      model = shocker.model;
    } catch (error) {
      handleApiError(error);
      goto(resolve('/shockers/own'));
    }
  });

  async function save() {
    if (!shocker || !name.trim()) return;
    saving = true;
    try {
      await shockersV1Api.shockerEditShocker(shocker.id, {
        name: name.trim(),
        rfId,
        model,
        device: shocker.device,
      });
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
      await shockersV1Api.shockerRemoveShocker(shocker.id);
      toast.success(`Shocker "${shocker.name}" deleted`);
      await refreshOwnHubs();
      goto(resolve('/shockers/own'));
    } catch (error) {
      handleApiError(error);
    }
  }
</script>

<Container>
  {#if !shocker}
    <div class="flex items-center gap-2 p-8">
      <LoaderCircle class="animate-spin" />
      <span>Loading shocker...</span>
    </div>
  {:else}
    <div class="mx-auto flex w-full max-w-lg flex-col gap-6 py-4">
      <h1 class="text-2xl font-bold">Edit Shocker</h1>

      <TextInput label="Name" placeholder="Shocker name" bind:value={name} />

      <Field class="gap-2">
        <FieldLabel>RF ID</FieldLabel>
        <Input type="number" bind:value={rfId} min={1} />
      </Field>

      <Field class="gap-2">
        <FieldLabel>Model</FieldLabel>
        <Select.Root type="single" name="model" bind:value={model}>
          <Select.Trigger>
            {modelOptions.find((o) => o.value === model)?.label ?? 'Select model'}
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              {#each modelOptions as option (option.value)}
                <Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
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

      <Button disabled={saving || !name.trim()} onclick={save}>
        {#if saving}<LoaderCircle class="animate-spin" />{/if}
        Save Changes
      </Button>

      <hr class="border-destructive/30" />

      <div class="flex flex-col gap-2">
        <h2 class="text-destructive text-lg font-semibold">Danger Zone</h2>
        <p class="text-muted-foreground text-sm">
          Permanently delete this shocker. This action cannot be undone.
        </p>
        <Button variant="destructive" onclick={deleteShocker}>Delete Shocker</Button>
      </div>
    </div>
  {/if}
</Container>
