<script lang="ts">
  export let name: string;
</script>

<div class="flex flex-col items-center justify-center gap-2 p-2 bg-slate-400 rounded-md">
  <!-- Title -->
  <h2 class="text-lg font-bold">{name}</h2>
  <!-- Buttons -->
  <div class="w-full flex gap-2">
    <!-- Beep button -->
    <button class="btn p-2 bg-slate-300 rounded-md flex-1">
      <i class="fa-solid fa-volume-high" />
    </button>
    <!-- Vibrate button -->
    <button class="btn p-2 bg-slate-300 rounded-md flex-1">
      <i class="fa-solid fa-water" />
    </button>
    <!-- Shock button -->
    <button class="btn p-2 bg-slate-300 rounded-md flex-1">
      <i class="fa-solid fa-bolt" />
    </button>
  </div>
</div>
