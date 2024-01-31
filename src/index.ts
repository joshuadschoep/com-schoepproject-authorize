import { validateToken } from "oidc-access-token";
import { generateSignedCookieFromAccessToken, validateSignedCookie } from "signed-cookie";

export interface AuthorizedPayload {
    SignedCookie?: any,
    OAuthAccessToken?: any,
}

export interface AuthorizationResult {
    Authorized?: boolean,
    SignedCookie?: any,
}

export const handler = async (event: AuthorizedPayload, _: any, callback: any) => {
    try {
        console.log("New event:", event);
        if (event.SignedCookie) {
            callback(null, {
                Authorized: await validateSignedCookie(event.SignedCookie)
            })
        } else if (event.OAuthAccessToken) {
            callback(null, {
                SignedCookie: generateSignedCookieFromAccessToken(
                    validateToken(event.OAuthAccessToken)
                )
            })
        }
        callback("Request contained no authorization data");
    } catch (e) {
        callback(`User was not successfully authenticated: ${e}`)
    }
};
