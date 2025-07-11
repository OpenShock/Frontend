import { usersApi } from '$lib/api';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
import type { ApiUser, ApiUserSelf } from '$lib/types/ApiUser';
import { writable } from 'svelte/store';

const { set, update, subscribe } = writable<{
  loading: boolean;
  self: ApiUserSelf | null;
  all: ApiUser[];
}>({
  loading: true,
  self: null,
  all: [],
});

function reset() {
  set({ loading: false, self: null, all: [] });
}

function updateAllFromSelf(all: ApiUser[], self: ApiUserSelf | null): ApiUser[] {
  if (!self) return all;
  return all.map((user) => {
    if (user.id === self.id) {
      return self;
    }
    return user;
  });
}

function setSelfName(name: string) {
  update((state) => {
    if (!state.self) return state;
    state.self.name = name;
    state.all = updateAllFromSelf(state.all, state.self);
    return state;
  });
}

async function refreshSelf(): Promise<boolean> {
  update((v) => ({ ...v, loading: true }));

  try {
    const { data, message } = await usersApi.usersGetSelf();

    if (!data) {
      console.error(`Failed to get user self: ${message}`);
      reset();
      return false;
    }

    const user = {
      id: data.id,
      name: data.name,
      avatar: data.image,
      roles: data.roles,
      email: data.email,
    };

    update((state) => ({
      loading: false,
      self: user,
      all: updateAllFromSelf(state.all, user),
    }));
  } catch (error) {
    reset();

    await handleApiError(
      error,
      (problem) => problem.type === 'Authentication.CookieMissingOrInvalid'
    );

    return false;
  }

  return true;
}

export const UserStore = {
  subscribe,
  set,
  update,
  setSelfName,
  refreshSelf,
  reset,
};
