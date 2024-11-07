<script lang="ts">
  import { getPasswordStrength } from '$lib/inputvalidation/passwordValidator';

  let { password }: { password: string } = $props();

  let { percent, text, color } = $derived(getPasswordStrength(password));
</script>

<div class="card p-4 w-72 shadow-xl">
  <div class="flex flex-row items-center space-x-1">
    <p class="text-sm text-gray-500">Password strength:</p>
    <p class={`text-sm text-${color}`}>{text}</p>
  </div>
  <div class="arrow bg-surface-100-800-token"></div>
  <div class="pt-2 h-1 w-full flex flex-row items-center space-x-1">
    <div class="h-1 bg-red-500" style="flex: 3 3 0%"></div>
    <div class="h-1 bg-orange-500" style="flex: 2 2 0%"></div>
    <div class="h-1 bg-yellow-500" style="flex: 1 1 0%"></div>
    <div class="h-1 bg-green-500" style="flex: 4 4 0%"></div>
  </div>
  <!-- Arrow -->
  <div class="relative w-full h-0">
    <div
      class="absolute w-2 h-2 bg-black dark:bg-white transform rotate-45 -translate-x-1 -translate-y-1"
      style={`left: ${percent}%`}
    ></div>
  </div>
</div>
