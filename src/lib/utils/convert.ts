export const NumberToHexPadded = (num: number, pad: number) =>
  (num >>> 0).toString(16).padStart(pad, '0').toUpperCase();

export const u8arrToBinstr = (array: Uint8Array) => new TextDecoder('latin1').decode(array);
export const binstrToU8arr = (bstr: string) => {
  const u8Array = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8Array[i] = bstr.charCodeAt(i);
  }
  return u8Array;
};
