## Post-Update Checklist for shadcn Components

After updating your `shadcn` components with the CLI, complete the following steps to ensure everything integrates correctly:

### Modifications

##### `sidebar.svelte`
Change `ease-linear` for the sidebar to `ease-in-out` and increase the duration from 200ms to 300ms (`duration-300`)

1. **Update `sonner` component if modified**

   If the `sonner` component was modified by the CLI, it most likely went back to using the `svelte-sonner` package.
   * Update it to use our own `ColorSchemeStore` implementation instead of the one from the `svelte-sonner` package.
   * Remove `svelte-sonner` from `package.json`

2. **Redirect utility imports**

   * Replace every instance of

     ```js
     import ... from '$lib/utils.js'
     ```

     with:

     ```js
     import ... from '$lib/utils/shadcn'
     ```

     This can be done easily with a search and replace tool in your code editor.

3. **Replace `shadcn` utils file if CLI generated one**

   * If the CLI created `src/lib/utils.ts`, overwrite your existing `src/lib/utils/shadcn.ts` with it.

4. **Run tailwindcss migration utility**

   * Shadcn-svelte still hasnt migrated to tailwindcss v4, so we need to run the migration utility to ensure everything is up to date.

     ```bash
     pnpx @tailwindcss/upgrade --force
     ```

5. **Apply consistent styling**

   * Run the following command to apply consistent styling:

     ```bash
     pnpm run format
     ```

6. **Check code for any issues**

   * Run the following commands to check for any issues:

     ```bash
     pnpm run lint
     pnpm run check
     ```
