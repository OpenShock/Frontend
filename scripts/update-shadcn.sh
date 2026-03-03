#!/usr/bin/env bash
set -euo pipefail

UI_DIR="src/lib/components/ui"
HOOKS_DIR="src/lib/hooks"

# Non-shadcn directories to keep
EXCLUDE=("multi-select-combobox")

is_excluded() {
	local name="$1"
	for exc in "${EXCLUDE[@]}"; do
		if [[ "$name" == "$exc" ]]; then
			return 0
		fi
	done
	return 1
}

# Collect shadcn component names
components=()
for dir in "$UI_DIR"/*/; do
	name="$(basename "$dir")"
	if ! is_excluded "$name"; then
		components+=("$name")
	fi
done

if [[ ${#components[@]} -eq 0 ]]; then
	echo "No shadcn components found to update."
	exit 1
fi

echo "Found ${#components[@]} shadcn components: ${components[*]}"

# Unwanted dependencies that the CLI tends to add
UNWANTED_DEPS=("mode-watcher")

# Delete all shadcn component directories
echo "Deleting shadcn components..."
for name in "${components[@]}"; do
	rm -rf "${UI_DIR:?}/$name"
done
rm -rf "$HOOKS_DIR/is-mobile"

# Re-add all components
echo "Re-adding components via shadcn CLI..."
echo "y" | pnpx shadcn-svelte@latest add --overwrite "${components[@]}"

# Remove unwanted dependencies and upgrade the rest to latest
echo "Cleaning up dependencies..."
for dep in "${UNWANTED_DEPS[@]}"; do
	if grep -q "\"$dep\"" package.json; then
		echo "  Removing unwanted dependency: $dep"
		pnpm remove "$dep"
	fi
done
pnpm up --latest

# Format to reduce diff noise
echo "Formatting..."
pnpm run format

# Apply custom modifications
echo "Applying custom modifications..."

# Sidebar: ease-in-out and duration-300
sed -i 's/duration-200 ease-linear/duration-300 ease-in-out/g' "$UI_DIR/sidebar/sidebar.svelte"

# Sidebar submenu: ml-* instead of mx-*
sed -i 's/mx-3\.5\(.*\)px-2\.5/ml-3.5\1pl-2.5/g' "$UI_DIR/sidebar/sidebar-menu-sub.svelte"

# Sonner: use ColorSchemeStore instead of mode-watcher
sed -i "s|import { mode } from \"mode-watcher\";|import { colorScheme } from '\$lib/stores/ColorSchemeStore.svelte';|" "$UI_DIR/sonner/sonner.svelte"
sed -i 's|theme={mode\.current}|theme={colorScheme.Value}|' "$UI_DIR/sonner/sonner.svelte"

# Slider: add cursor-w-resize to thumb
sed -i 's/focus-visible:outline-hidden disabled:pointer/focus-visible:outline-hidden cursor-w-resize disabled:pointer/' "$UI_DIR/slider/slider.svelte"

# Toggle group: suppress state_referenced_locally warnings
sed -i 's/\tsetToggleGroupCtx/\t\/\/ svelte-ignore state_referenced_locally\n\tsetToggleGroupCtx/' "$UI_DIR/toggle-group/toggle-group.svelte"

# Final format and check
echo "Final format..."
pnpm run format

echo "Running checks..."
pnpm run check

echo "Done! Review the git diff before committing."
