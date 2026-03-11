<script lang="ts" module>
  import { ShockerModelType } from '$lib/api/internal/v1';

  export interface AddShockerData {
    name: string;
    rfId: number;
    device: string;
    model: ShockerModelType;
  }

  export const defaultAddShockerData: AddShockerData = {
    name: '',
    rfId: 0,
    device: '',
    model: ShockerModelType.CaiXianlin,
  };
</script>

<script lang="ts">
  import type { NewShocker } from '$lib/api/internal/v1';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Select from '$lib/components/ui/select';
  import { Field, FieldLabel } from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input';
  import type { DialogRenderProps } from '$lib/components/dialog-manager/types';
  import type { OwnHub } from '$lib/stores/HubsStore.svelte';

  interface Props {
    renderProps: DialogRenderProps<AddShockerData, NewShocker | undefined>;
    hubs: [string, OwnHub][];
  }

  let { renderProps, hubs }: Props = $props();

  const modelOptions = [
    { value: ShockerModelType.CaiXianlin, label: 'CaiXianlin' },
    { value: ShockerModelType.PetTrainer, label: 'PetTrainer' },
    { value: ShockerModelType.Petrainer998Dr, label: 'Petrainer998DR' },
  ];

  let canSubmit = $derived(
    renderProps.data.name.trim().length > 0 &&
      renderProps.data.rfId > 0 &&
      renderProps.data.device.length > 0
  );

  function submit() {
    if (!canSubmit) return;
    renderProps.resolve({
      name: renderProps.data.name.trim(),
      rfId: renderProps.data.rfId,
      device: renderProps.data.device,
      model: renderProps.data.model,
    });
  }
</script>

<Dialog.Header>
  <Dialog.Title>Add Shocker</Dialog.Title>
  <Dialog.Description>Register a new shocker to one of your hubs.</Dialog.Description>
</Dialog.Header>
<div class="flex flex-col gap-4 py-2">
  <TextInput label="Name" placeholder="My Shocker" bind:value={renderProps.data.name} />

  <Field class="gap-2">
    <FieldLabel>RF ID</FieldLabel>
    <Input type="number" placeholder="12345" bind:value={renderProps.data.rfId} min={1} />
  </Field>

  <Field class="gap-2">
    <FieldLabel>Model</FieldLabel>
    <Select.Root type="single" name="model" bind:value={renderProps.data.model}>
      <Select.Trigger>
        {modelOptions.find((o) => o.value === renderProps.data.model)?.label ?? 'Select model'}
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
    <Select.Root type="single" name="hub" bind:value={renderProps.data.device}>
      <Select.Trigger>
        {hubs.find(([id]) => id === renderProps.data.device)?.[1].name ?? 'Select hub'}
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
  <Button variant="outline" onclick={() => renderProps.close()}>Cancel</Button>
  <Button disabled={!canSubmit} onclick={submit}>Add Shocker</Button>
</Dialog.Footer>
