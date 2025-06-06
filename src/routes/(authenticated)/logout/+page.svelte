<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { accountV1Api, usersApi } from '$lib/api';
  import { UserStore } from '$lib/stores/UserStore';

  // This will run instantly when js is loaded, call the logout endpoint, then no matter the api response, clear the user store and YEET the user to the landing page.
  if (browser) {
    accountV1Api.accountLogout().then(() => {
      UserStore.reset();
      goto('/');
    });
  }
</script>
