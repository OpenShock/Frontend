<script lang="ts">
  import { getPasswordStrength } from '$lib/inputvalidation/passwordValidator';

  interface Props {
    password: string;
  }

  let { password }: Props = $props();

  let { percent, text, color } = $derived(getPasswordStrength(password));
</script>

<div aria-hidden="true">
  <div class="flex flex-row items-center space-x-1 text-xs">
    <p class="text-gray-400">Password strength:</p>
    <p class={`text-${color}`}>{text}</p>
  </div>

  <!-- SVG Meter -->
  <svg viewBox="0 0 100 6" class="mt-1 w-full">
    <rect x="0" y="0" width="30" height="2" fill="#ef4444" />
    <rect x="30" y="0" width="20" height="2" fill="#f97316" />
    <rect x="50" y="0" width="10" height="2" fill="#eab308" />
    <rect x="60" y="0" width="40" height="2" fill="#22c55e" />

    <polygon
      points="0,-2 -2,0 0,2 2,0"
      transform={`translate(${percent}, 2)`}
      fill="white"
      stroke="black"
      stroke-width="0.2"
    />
  </svg>
</div>
