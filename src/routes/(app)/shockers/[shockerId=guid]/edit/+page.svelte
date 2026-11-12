<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import {
    ShockerModelType,
    shockerEditShocker,
    shockerGetShockerById,
    shockerRemoveShocker,
  } from '#lib/api/index.js';
  import type { ShockerWithDevice } from '#lib/api/index.js';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { Container, PageError, PageHeader, PageLoading } from '@openshock/svelte-core/components';
  import { dialog } from '@openshock/svelte-core/components/dialog-manager';
  import { RfIdMax, RfIdMin, isValidRfId } from '#lib/constants/ShockerConstants.js';
  import { TextInput } from '@openshock/svelte-core/components/input';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { Field, FieldLabel } from '@openshock/svelte-core/components/ui/field';
  import { Input } from '@openshock/svelte-core/components/ui/input';
  import * as Select from '@openshock/svelte-core/components/ui/select';
  import PauseToggle from '#lib/components/utils/PauseToggle.svelte';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { refreshOwnHubs } from '#lib/state/hubs-state.svelte.js';
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
    { label: m.shockers_title(), href: 'shockers/own' },
    { label: shocker?.name ?? m.shocker_edit_title() },
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
      toast.success(m.shocker_edit_toast_updated());
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
      title: m.shocker_delete_title(),
      desc: m.shocker_delete_desc({ name: shocker.name }),
      confirmButtonText: m.common_delete(),
    });
    if (!result.confirmed) return;
    try {
      await shockerRemoveShocker({ path: { shockerId: shocker.id } });
      toast.success(m.shocker_toast_deleted({ name: shocker.name }));
      await refreshOwnHubs();
      goto(resolve('shockers/own'));
    } catch (error) {
      handleApiError(error);
    }
  }
</script>

<Container>
  <PageHeader title={m.shocker_edit_title()} subtitle={m.shocker_edit_subtitle()}>
    <Button variant="outline" href={resolve('shockers/own')}>
      <ArrowLeft />
      {m.shocker_edit_back()}
    </Button>
  </PageHeader>

  {#if loadError}
    <PageError message={m.shocker_edit_load_failed()} />
  {:else if !shocker}
    <PageLoading label={m.shocker_edit_loading()} />
  {:else}
    <div class="mx-auto flex w-full max-w-lg flex-col gap-6 py-4">
      <Card.Root>
        <Card.Header>
          <Card.Title>{m.shocker_edit_details_title()}</Card.Title>
          <Card.Description>{m.shocker_edit_details_desc()}</Card.Description>
        </Card.Header>
        <Card.Content class="flex flex-col gap-4">
          <TextInput
            label={m.common_name()}
            placeholder={m.shocker_name_placeholder()}
            bind:value={name}
          />

          <Field class="gap-2">
            <FieldLabel>{m.shocker_rf_id()}</FieldLabel>
            <Input type="number" bind:value={rfId} min={RfIdMin} max={RfIdMax} step={1} />
            {#if !rfIdValid}
              <span class="text-destructive text-sm">
                {m.shocker_rf_id_invalid({ min: RfIdMin, max: RfIdMax })}
              </span>
            {/if}
          </Field>

          <Field class="gap-2">
            <FieldLabel>{m.shocker_model()}</FieldLabel>
            <Select.Root type="single" name="model" bind:value={model}>
              <Select.Trigger>
                {model ?? m.shocker_select_model()}
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
            <FieldLabel>{m.shocker_edit_pause_state()}</FieldLabel>
            <div class="flex items-center gap-2">
              <PauseToggle
                shockerId={shocker.id}
                bind:paused={shocker.isPaused}
                userShareUserId={undefined}
                onPausedChange={() => {}}
              />
              <span class="text-muted-foreground text-sm">
                {shocker.isPaused ? m.shocker_edit_is_paused() : m.shocker_edit_is_active()}
              </span>
            </div>
          </Field>
        </Card.Content>
        <Card.Footer>
          <Button disabled={saving || !name.trim() || !rfIdValid || !hasChanges} onclick={save}>
            {#if saving}<Spinner class="size-4" />{/if}
            {m.common_save_changes()}
          </Button>
        </Card.Footer>
      </Card.Root>

      <Card.Root class="border-destructive/30">
        <Card.Header>
          <Card.Title class="text-destructive">{m.common_danger_zone()}</Card.Title>
          <Card.Description>
            {m.shocker_edit_delete_desc()}
          </Card.Description>
        </Card.Header>
        <Card.Footer>
          <Button variant="destructive" onclick={deleteShocker}>
            <Trash2 class="size-4" />
            {m.shocker_delete_title()}
          </Button>
        </Card.Footer>
      </Card.Root>
    </div>
  {/if}
</Container>
