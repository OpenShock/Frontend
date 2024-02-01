<script lang="ts">
  import type { ValidationResult } from '$lib/types/ValidationResult';

  export let label = 'Password';
  export let placeholder = 'Password';
  export let autocomplete: 'new-password' | 'current-password';
  export let value: string;
  export let valueShown = false;
  export let validationResult: ValidationResult | null | undefined = undefined;
</script>

<label class="label">
  <span>{label}</span>
  <div class="input-group input-group-divider grid-cols-[1fr_auto]">
    <input
      class="input"
      type={valueShown ? 'text' : 'password'}
      title={label}
      {placeholder}
      {autocomplete}
      {value}
      on:input={(e) => {
        valueShown = false;
        value = e.currentTarget.value;
      }}
    />
    <div>
      <button
        class={'fa-solid !m-0 h-[20px] w-[20px] cursor-pointer !p-0 ' +
          (valueShown ? 'fa-eye-slash' : 'fa-eye')}
        type="button"
        on:click={() => (valueShown = !valueShown)}
      />
    </div>
  </div>
  {#if validationResult}
    <p class="text-sm text-red-500">{validationResult.message}</p>
  {/if}
</label>
