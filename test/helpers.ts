import { AuthorizationResult, handler } from "../src/index";
import Cookie from "cookie";
import { sign } from "jsonwebtoken";

export const generateSignedCookie = (key: string) =>
  Cookie.serialize(
    "TOKEN",
    sign({}, key, {
      audience: "https://localhost:5000/",
      subject: "user@example.com",
      expiresIn: 3000,
      algorithm: "RS256",
    })
  );

export const generateExpiredCookie = (key: string) =>
  Cookie.serialize(
    "TOKEN",
    sign({}, key, {
      audience: "https://localhost:5000/",
      subject: "user@example.com",
      expiresIn: 0,
      algorithm: "RS256",
    })
  );

export const callHandlerWithCookie = async (cookie: string, cb: Function) => {
  await handler(
    {
      SignedCookie: cookie,
    },
    {},
    cb
  );
};

export const callHandlerWithAccessToken = async (
  token: string,
  cb: Function
) => {
  await handler(
    {
      OAuthAccessToken: token,
    },
    {},
    cb
  );
};
