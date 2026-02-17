export const NumberToHexPadded = (num: number, pad: number) =>
  (num >>> 0).toString(16).padStart(pad, '0').toUpperCase();

// Convert a Uint8Array to a binary string (1 byte → 1 char)
export const u8arrToBinstr = (array: Uint8Array): string => {
  let result = '';
  const chunkSize = 0x8000; // avoid "call stack too large" for huge arrays
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.subarray(i, i + chunkSize);
    result += String.fromCharCode(...chunk);
  }
  return result;
};

// Convert a binary string back to a Uint8Array
export const binstrToU8arr = (bstr: string): Uint8Array => {
  const u8Array = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8Array[i] = bstr.charCodeAt(i);
  }
  return u8Array;
};
