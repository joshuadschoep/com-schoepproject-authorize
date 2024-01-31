import { create401Error } from "./helpers";
import { validateToken } from "./oidc-access-token";
import {
  generateSignedCookieFromAccessToken,
  validateSignedCookie,
} from "./signed-cookie";

export interface AuthorizedPayload {
  SignedCookie?: any;
  OAuthAccessToken?: any;
}

export interface AuthorizationResult {
  Authorized?: boolean;
  SignedCookie?: any;
  Error?: {
    Code: number;
    Message: string;
  };
}

export const handler = async (
  event: AuthorizedPayload,
  _: any,
  callback: any
) => {
  try {
    console.log("New event:", event);
    if (event.SignedCookie) {
      callback(null, {
        Authorized: await validateSignedCookie(event.SignedCookie),
      });
    } else if (event.OAuthAccessToken) {
      callback(null, {
        SignedCookie: generateSignedCookieFromAccessToken(
          validateToken(event.OAuthAccessToken)
        ),
      });
    }
    callback(null, create401Error("No authentication methods received"));
  } catch (e: any) {
    switch (e.name) {
      case "JsonWebTokenError":
        callback(null, create401Error("Cookie signature is not valid"));
        break;
      case "TokenExpiredError":
        callback(null, create401Error("Cookie is expired"));
        break;
      default:
        console.dir(e);
        callback(null, create401Error(`Unknown issue: ${e}`));
        break;
    }
  }
};
