export function genId(len = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  const bytes = crypto.getRandomValues(new Uint8Array(len));

  for (let i = 0; i < len; i++) {
    result += chars[bytes[i]! % chars.length];
  }

  return result;
}
