

/*
 * Convert an Uint8Array into a string.
 */
export function decodeToUTF8(data: Uint8Array) {
  return new TextDecoder('utf-8').decode(data);
}

/*
 * Convert a string into a Uint8Array.
 */
export function encodeToUint8(data: string) {
  return new TextEncoder().encode(data);
}
