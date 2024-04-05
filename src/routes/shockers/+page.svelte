<!-- Rounded bordered container -->
<div class="container h-full mx-auto flex justify-center items-center">
  <!-- Grid container -->
  <div class="grid grid-rows-3 grid-cols-3">
    {#each [1, 2, 3, 4, 5, 6] as a}
      <!-- Grid item -->
      <div class="p-4">
        <div class="border radius-2 p-4">
          <h3 class="h3">Shocker</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>
    {/each}
  </div>
</div>
