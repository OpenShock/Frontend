const randChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' as const;
const randCharsLength = randChars.length;

export function randStr(length: number) {
  let result = '';

  let counter = 0;
  while (counter < length) {
    result += randChars.charAt(Math.floor(Math.random() * randCharsLength));
    counter += 1;
  }

  return result;
}
