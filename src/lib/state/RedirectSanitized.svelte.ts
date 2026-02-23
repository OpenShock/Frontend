/** Reactive flag set when {@link sanitizeRedirectSearchParam} strips a malicious redirect param. */
let flag = $state(false);

export const redirectSanitized = {
  get value() {
    return flag;
  },
  set() {
    flag = true;
  },
  reset() {
    flag = false;
  },
};
