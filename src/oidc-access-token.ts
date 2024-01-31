const { auth } = require("express-oauth2-jwt-bearer");
import { JWTPayload, requiredScopes } from "express-oauth2-jwt-bearer";

const jwtCheck = auth({
  audience: "https://authorize.schoepproject.com",
  issuerBaseURL: "https://schoep.us.auth0.com/",
  tokenSigningAlg: "RS256",
});

const validateAndGetTokenPayload = (
  accessToken: any
): JWTPayload | undefined => {
  // this is the hackiest thing I've ever written, why does everyone
  // write their oauth2 verifier as express middleware
  let req = {
    query: {
      access_token: accessToken,
    },
  } as any;
  jwtCheck(req, {}, () => {});
  return req?.auth?.payload;
};

const validateRequiredPayloadScopes = (
  payload?: JWTPayload
): JWTPayload | undefined => {
  requiredScopes("read:dev")(payload);
  return payload;
};

export const validateToken = (accessToken: any): JWTPayload | undefined =>
  validateRequiredPayloadScopes(validateAndGetTokenPayload(accessToken));
