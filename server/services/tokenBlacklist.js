const blacklist = new Map();

export function add(token, expMs) {
  const expiry = Date.now() + expMs;
  blacklist.set(token, expiry);
}

export function has(token) {
  const exp = blacklist.get(token);
  if (!exp) return false;
  if (Date.now() > exp) {
    blacklist.delete(token);
    return false;
  }
  return true;
}

export default { add, has };
