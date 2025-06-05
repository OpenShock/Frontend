<script lang="ts">
  import { getPasswordStrength } from '$lib/inputvalidation/passwordValidator';

  interface Props {
    password: string;
  }

  let { password }: Props = $props();

  let { percent, text, color } = $derived(getPasswordStrength(password));
</script>

<div class="card w-72 p-4 shadow-xl" aria-hidden="true">
  <div class="flex flex-row items-center space-x-1">
    <p class="text-sm text-gray-500">Password strength:</p>
    <p class={`text-sm text-${color}`}>{text}</p>
  </div>
  <div class="arrow bg-surface-100-800-token"></div>
  <div class="flex h-1 w-full flex-row items-center space-x-1 pt-2">
    <div class="h-1 bg-red-500" style="flex: 3 3 0%"></div>
    <div class="h-1 bg-orange-500" style="flex: 2 2 0%"></div>
    <div class="h-1 bg-yellow-500" style="flex: 1 1 0%"></div>
    <div class="h-1 bg-green-500" style="flex: 4 4 0%"></div>
  </div>
  <!-- Arrow -->
  <div class="relative h-0 w-full">
    <div
      class="absolute size-2 -translate-x-1 -translate-y-1 rotate-45 transform bg-black dark:bg-white"
      style:left={`${percent}%`}
    ></div>
  </div>
</div>
