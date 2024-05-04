import { browser } from "$app/environment";
import { usersApi } from "$lib/api";
import type { ApiUser, ApiUserSelf } from "$lib/types/ApiUser";
import { writable } from "svelte/store";

export const UserSelfStore = writable<ApiUserSelf | null>(null);
export const UsersStore = writable<ApiUser[]>([]);

export function refreshUserSelf() {
  if (!browser) return;

  usersApi.usersGetSelf().then(({ data, message }) => {
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

    UserSelfStore.set(user);
    UsersStore.set([user]);
  }).catch((error) => {
    console.error(error);
  });
}

refreshUserSelf();
