<script lang="ts">
  import Container from '$lib/components/Container.svelte';
  import LoginForm from '$lib/components/login-form.svelte';
  import { asset, resolve } from '$app/paths';
</script>

<Container class="items-center-safe justify-center-safe p-4">
  <span class="flex items-center gap-2 self-center font-medium">
    <img class="ml-[0.667px] h-7.5" src={asset('/IconSpinning.svg')} alt="OpenShock Logo" />
    <img
      class="h-7.5 transition-opacity delay-100 duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:delay-0"
      src={asset('/LogoTextOnly.svg')}
      alt="OpenShock Logo"
    />
  </span>
  <LoginForm />
</Container>
