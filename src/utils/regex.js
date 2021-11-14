const charOnlyPattern = /^[a-zA-Z]+$/;
export function isCharOnly(s) {
  return charOnlyPattern.test(s);
}

const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i;
export function isURL(s) {
  return urlPattern.test(s);
}

const emailPattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
export function isEmail(s) {
  return emailPattern.test(s);
}

// A helper for use with modals/Prompt.js.
export function modalCheckEmail(val) {
  if (!isEmail(val)) {
    return `"${val}" is not a valid email address`;
  }
  return null;
}
