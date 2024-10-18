import { browser } from "$app/environment";
import { usersApi } from "$lib/api";
import type { ApiUser, ApiUserSelf } from "$lib/types/ApiUser";
import { writable } from "svelte/store";

const { set, update, subscribe } = writable<{ self: ApiUserSelf | null, all: ApiUser[] }>({ self: null, all: [] });

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

async function refreshSelf() {
  if (!browser) return;

  try {
    const { data, message } = await usersApi.usersGetSelf();

    if (!data) {
      console.error(`Failed to get user self: ${message}`);
      return;
    }

    const user = {
      id: data.id!,
      name: data.name!,
      avatar: data.image!,
      rank: data.rank!,
      email: data.email!,
    };

    update((state) => {
      state.self = user;
      state.all = updateAllFromSelf(state.all, user);
      return state;
    });
  } catch (error) {
    console.error(error);
  }
}

function reset() {
  set({ self: null, all: [] });
}

refreshSelf();

export const UserStore = {
  subscribe,
  set,
  update,
  setSelfName,
  refreshSelf,
  reset,
};
