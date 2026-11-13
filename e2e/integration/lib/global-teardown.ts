// The integration stack is started by the Playwright webServer command
// (scripts/dev-integration.mjs) using Testcontainers, and is torn down when
// that process exits. Testcontainers' Ryuk reaper also removes any orphaned
// containers/networks as a backstop, so there is nothing to do here.
export default function globalTeardown() {
  // intentionally empty
}
