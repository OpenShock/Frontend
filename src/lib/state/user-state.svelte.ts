import { usersApi } from '$lib/api';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
import type { ApiUser, ApiUserSelf } from '$lib/types/ApiUser';

let loading = $state(true);
let self = $state<ApiUserSelf | null>(null);
let all = $state<ApiUser[]>([]);

function updateAllFromSelf(allUsers: ApiUser[], selfUser: ApiUserSelf | null): ApiUser[] {
  if (!selfUser) return allUsers;
  return allUsers.map((user) => {
    if (user.id === selfUser.id) {
      return selfUser;
    }
    return user;
  });
}

export const userState = {
  get loading() {
    return loading;
  },
  get self() {
    return self;
  },
  get all() {
    return all;
  },

  reset() {
    loading = false;
    self = null;
    all = [];
  },

  setSelfName(name: string) {
    if (!self) return;
    self.name = name;
    all = updateAllFromSelf(all, self);
  },

  setSelfEmail(email: string) {
    if (!self) return;
    self.email = email;
    all = updateAllFromSelf(all, self);
  },

  setSelf(user: ApiUserSelf) {
    self = user;
    all = updateAllFromSelf(all, user);
  },

  async refreshSelf(): Promise<boolean> {
    loading = true;

    try {
      const { data, message } = await usersApi.usersGetSelf();

      if (!data) {
        console.error(`Failed to get user self: ${message}`);
        userState.reset();
        return false;
      }

      const user = {
        id: data.id,
        name: data.name,
        avatar: data.image,
        roles: data.roles,
        email: data.email,
      };

      loading = false;
      self = user;
      all = updateAllFromSelf(all, user);
    } catch (error) {
      userState.reset();

      await handleApiError(
        error,
        (problem) => problem.type === 'Authentication.CookieMissingOrInvalid'
      );

      return false;
    }

    return true;
  },
};
