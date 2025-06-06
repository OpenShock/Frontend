<script lang="ts">
  import Container from '$lib/components/Container.svelte';
</script>

<Container>
  <div class="flex flex-col">
    <h1 class="text-5xl leading-none font-bold text-gray-800 dark:text-white">
      Welcome to <span class="text-blue-600">OpenShock</span>
    </h1>
    <p class="text-2xl font-light text-gray-600">[Put a slogan here]</p>
    <div class="mt-8 flex flex-row items-center justify-start space-x-4">
      <a href="signup" class="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
        Get Started
      </a>
      <a
        href="https://wiki.openshock.org/"
        class="rounded bg-gray-200 px-4 py-2 font-bold text-gray-700 hover:bg-gray-300"
      >
        Documentation
      </a>
    </div>
  </div>
  <div class="placeholder h-3/4 w-1/2 rounded-none"></div>
</Container>
