export const create401Error = (msg: string) => ({
  Authorized: false,
  Error: {
    Code: 401,
    Message: msg,
  },
});
