import * as jose from "jose";
import { Algorithm } from "jsonwebtoken";

export class JWTScopeValidationFailed extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}

interface JWTScope {
  scope: string;
}

export const validateToken = async (accessToken: any) => {
  const JWKS = jose.createRemoteJWKSet(
    new URL(`${process.env.OAUTH_ISSUER}.well-known/jwks.json`)
  );

  console.log("Verifying auth token with OIDC provider");
  const { payload } = await jose.jwtVerify<JWTScope>(accessToken, JWKS, {
    issuer: process.env.OAUTH_ISSUER ?? "unclaimable_issuer",
    audience: process.env.OAUTH_AUDIENCE ?? "unclaimable_audience",
    algorithms: [process.env.OAUTH_ALGORITHM as Algorithm],
  });

  console.log("Auth token is valid. Verifying scopes");
  if (
    payload.scope.includes(
      process.env.OAUTH_REQUIRED_CLAIM ?? "unclaimable:scope"
    )
  ) {
    console.log("Token contains required scopes");
    return payload;
  } else {
    throw new JWTScopeValidationFailed(
      "JWTScopeValidationFailed",
      "Does not contain required scope"
    );
  }
};
