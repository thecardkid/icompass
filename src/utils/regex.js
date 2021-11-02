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
