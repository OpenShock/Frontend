import { registerOnUnauthorized } from '$lib/errorhandling/apiErrorHandling';
import { destroySignalR, initializeSignalR } from '$lib/signalr/user.svelte';
import { userState } from './user-state.svelte';

export const AuthStatus = {
  Booting: 'booting',
  Authenticated: 'authenticated',
  Unauthenticated: 'unauthenticated',
} as const;
export type AuthStatus = (typeof AuthStatus)[keyof typeof AuthStatus];

let _booted = $state(false);
let _stopLifecycle: (() => void) | null = null;

export const authState = {
  get status(): AuthStatus {
    if (!_booted) return AuthStatus.Booting;
    return userState.self ? AuthStatus.Authenticated : AuthStatus.Unauthenticated;
  },
  get isAuthenticated() {
    return _booted && userState.self !== null;
  },
  markBooted() {
    _booted = true;
  },
};

/**
 * Wires up the reactive side-effects of auth state:
 *   - SignalR connects/disconnects as the user logs in/out.
 *   - 401 responses anywhere clear auth state (which then tears down SignalR).
 * Call once at client startup.
 */
export function startAuthLifecycle() {
  if (_stopLifecycle) return;

  registerOnUnauthorized(() => userState.reset());

  _stopLifecycle = $effect.root(() => {
    $effect(() => {
      if (userState.self) {
        void initializeSignalR();
      } else {
        void destroySignalR();
      }
    });
  });
}
