<script lang="ts" module>
  import { ShockerModelType } from '$lib/api/internal/v1';

  export interface AddShockerData {
    name: string;
    rfId: number;
    device: string;
    model: ShockerModelType;
  }

  export function defaultAddShockerData(): AddShockerData {
    return {
      name: '',
      rfId: Math.floor(Math.random() * 65535) + 1,
      device: '',
      model: ShockerModelType.CaiXianlin,
    };
  }
</script>

<script lang="ts">
  import type { NewShocker } from '$lib/api/internal/v1';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Select from '$lib/components/ui/select';
  import { Field, FieldLabel } from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input';
  import type { DialogContentProps } from '$lib/components/dialog-manager/types';
  import type { OwnHub } from '$lib/state/hubs-state.svelte';

  interface Props extends DialogContentProps<NewShocker | undefined> {
    data: AddShockerData;
    hubs: [string, OwnHub][];
  }

  // eslint-disable-next-line svelte/no-unused-props -- properties are used via the local $state copy
  let { data: initialData, hubs, resolve, close }: Props = $props();

  // svelte-ignore state_referenced_locally -- intentionally captures initial value as own reactive copy
  let data: AddShockerData = $state(initialData);

  const modelOptions = [
    { value: ShockerModelType.CaiXianlin, label: 'CaiXianlin' },
    { value: ShockerModelType.PetTrainer, label: 'PetTrainer' },
    { value: ShockerModelType.Petrainer998Dr, label: 'Petrainer998DR' },
  ];

  let canSubmit = $derived(data.name.trim().length > 0 && data.rfId > 0 && data.device.length > 0);

  function submit() {
    if (!canSubmit) return;
    resolve({
      name: data.name.trim(),
      rfId: data.rfId,
      device: data.device,
      model: data.model,
    });
  }
</script>

<Dialog.Header>
  <Dialog.Title>Add Shocker</Dialog.Title>
  <Dialog.Description>Register a new shocker to one of your hubs.</Dialog.Description>
</Dialog.Header>
<div class="flex flex-col gap-4 py-2">
  <TextInput label="Name" placeholder="My Shocker" bind:value={data.name} />

  <Field class="gap-2">
    <FieldLabel>RF ID</FieldLabel>
    <Input type="number" placeholder="12345" bind:value={data.rfId} min={1} />
  </Field>

  <Field class="gap-2">
    <FieldLabel>Model</FieldLabel>
    <Select.Root type="single" name="model" bind:value={data.model}>
      <Select.Trigger>
        {modelOptions.find((o) => o.value === data.model)?.label ?? 'Select model'}
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
    <FieldLabel>Hub</FieldLabel>
    <Select.Root type="single" name="hub" bind:value={data.device}>
      <Select.Trigger>
        {hubs.find(([id]) => id === data.device)?.[1].name ?? 'Select hub'}
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {#each hubs as [id, hub] (id)}
            <Select.Item value={id} label={hub.name}>{hub.name}</Select.Item>
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  </Field>
</div>
<Dialog.Footer>
  <Button variant="outline" onclick={() => close()}>Cancel</Button>
  <Button disabled={!canSubmit} onclick={submit}>Add Shocker</Button>
</Dialog.Footer>
