// The integration docker stack is brought up by `scripts/dev-integration.mjs`
// (the webServer command) because Playwright starts the webServer before
// globalSetup, so Vite's SSR fetches would race the API container coming up.
// Keep this hook in place for future cross-test setup work.
export default function globalSetup() {
  // intentionally empty
}
