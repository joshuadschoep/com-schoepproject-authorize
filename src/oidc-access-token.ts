import * as jose from "jose";
import { Algorithm } from "jsonwebtoken";

export class JWTScopeValidationFailed extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}

export const validateToken = async (accessToken: any) => {
  const JWKS = jose.createRemoteJWKSet(
    new URL(`${process.env.OAUTH_ISSUER}.well-known/jwks.json`)
  );

  const { payload } = await jose.jwtVerify(accessToken, JWKS, {
    issuer: process.env.OAUTH_ISSUER ?? "unclaimable_issuer",
    audience: process.env.OAUTH_AUDIENCE ?? "unclaimable_audience",
    algorithms: [process.env.OAUTH_ALGORITHM as Algorithm],
  });

  if (
    payload.scope === (process.env.OAUTH_REQUIRED_CLAIM ?? "unclaimable:scope")
  ) {
    return payload;
  } else {
    throw new JWTScopeValidationFailed(
      "JWTScopeValidationFailed",
      "Does not contain required scope"
    );
  }
};
