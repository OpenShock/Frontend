import { defineParams } from '@sveltejs/kit/params';

function matchGuid(param: string) {
  return /^[\dA-F]{8}-[\dA-F]{4}-[47][\dA-F]{3}-[89AB][\dA-F]{3}-[\dA-F]{12}$/i.test(param);
}

function matchInteger(param: string) {
  return /^\d+$/.test(param);
}

export const params = defineParams({
  guid: (param) => (matchGuid(param) ? param : undefined),
  integer: (param) => (matchInteger(param) ? param : undefined),
});
