## Post-Update Checklist for shadcn Components

After running the shadcn CLI to update your components, follow these steps to ensure everything integrates correctly.
This process helps you isolate and address any changes the CLI made, then reapply your custom modifications.

### Steps to Follow

To start off, we want to eliminate the bulk of the changes that the CLI made, this will make it easier to see what actual changes were made by inspecting the git diff.

To do this we will first migrate all the tailwindcss classes to tailwindcss v4, then format all the code to our code style.

```bash
pnpm run format
```

Now it should be easier to see what the CLI actually changed, and we can now proceed with the following steps:

1. **Update `sidebar` component if modified**

   If the `sidebar` component was modified by the CLI, it most likely went back to using `ease-linear` and `duration-200`.
   * Change `ease-linear` for the sidebar to `ease-in-out`.
   * Increase the duration from `duration-200` to `duration-300`.
   * If the `sidebar-menu-sub` component was modified, ensure that the `ml-*` classes were not reverted back to `mx-*` classes.

2. **Update `sonner` component if modified**

   If the `sonner` component was modified by the CLI, it most likely went back to using the `svelte-sonner` package.
   * Update it to use our own `ColorSchemeStore` implementation instead of the one from the `svelte-sonner` package.
   * Remove `svelte-sonner` from `package.json`

3. **Update `slider` component if modified**

   If the `slider` component was modified by the CLI, it most likely removed the `cursor-w-resize` tailwind class.
   * Revert the change before committing.

3. **Run code formatting again**

   Now we need to run the code formatting again to ensure everything is consistent after the changes made in steps 1 and 2.

   ```bash
   pnpm run format
   ```

4. **Check code for any issues**

   * Run the following commands to check for any issues:

     ```bash
     pnpm run check
     ```
