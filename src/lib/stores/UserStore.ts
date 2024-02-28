import { browser } from "$app/environment";
import { usersApi } from "$lib/api";
import type { ApiUser, ApiUserSelf } from "$lib/types/ApiUser";
import { writable } from "svelte/store";


export const UserSelfStore = writable<ApiUserSelf | null>(null);
export const UsersStore = writable<ApiUser[]>([]);

if (browser) {
  usersApi.usersGetSelf().then(({ data, message }) => {
    if (!data) return;

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
