<script lang="ts">
  import { adminApi } from '$lib/api';
  import { ConfigurationValueType } from '$lib/api/internal/v1';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Select from '$lib/components/ui/select';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    onAdded: () => void;
  }

  let { open = $bindable<boolean>(), onAdded }: Props = $props();

  const valueTypes = Object.values(ConfigurationValueType).map((type) => ({
    value: type,
    label: type,
  }));

  let name = $state('');
  let description = $state('');
  let valueType = $state(ConfigurationValueType.String);
  let value = $state('');
  let nameValidationResult = $derived.by<ValidationResult>(() => {
    if (name.trim().length == 0) {
      return {
        valid: false,
      };
    }

    // Step 2: Define a regular expression for name
    const validationRegex = /^[A-Z]+(?:_[A-Z]+)*$/;

    // Step 3: Test the name against the regex
    if (!validationRegex.test(name)) {
      return {
        valid: false,
        message: 'Must be SCREAMING_SNAKE_CASE',
      };
    }

    // Step 4: If all checks pass, the name is valid
    return {
      valid: true,
    };
  });

  let triggerLabel = $derived(valueTypes.find((m) => m.value === valueType)?.label ?? 'Value type');

  let valid = $derived(name.length > 0 && value.length > 0 && nameValidationResult.valid);

  function onSubmit() {
    adminApi
      .adminConfigurationAdd({ name, description, type: valueType, value })
      .then(() => {
        onAdded();
        toast.success('Created configuration item');
        open = false;
      })
      .catch(handleApiError)
      .finally(() => (open = false));
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Add configuration item</Dialog.Title>
      <Dialog.Description>
        <strong>BE CAREFUL. This will alter the server's behaviour!</strong>
      </Dialog.Description>
    </Dialog.Header>
    <TextInput label="Name" bind:value={name} validationResult={nameValidationResult} />
    <TextInput label="Description" bind:value={description} />
    <Select.Root type="single" name="matchType" bind:value={valueType}>
      <Select.Trigger class="w-full">{triggerLabel}</Select.Trigger>
      <Select.Content>
        <Select.Group>
          <Select.Label>Value Type</Select.Label>
          {#each valueTypes as m (m.value)}
            <Select.Item value={m.value} label={m.label}>{m.label}</Select.Item>
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>
    <TextInput label="Value" bind:value />
    <Button onclick={onSubmit} disabled={!valid}>Create</Button>
  </Dialog.Content>
</Dialog.Root>
