import Cookie from "cookie";
import {
  type Secret,
  type VerifyOptions,
  verify,
  sign,
  Algorithm,
} from "jsonwebtoken";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { JWTPayload } from "jose";
import { KeyObject, createPrivateKey, createPublicKey } from "crypto";

export interface KeyPairSecret {
  PUBLIC_KEY: string;
  PRIVATE_KEY: string;
}

// at global scope so we can cache between near runs, saving time
var PUBLIC_KEY: KeyObject;
var PRIVATE_KEY: KeyObject;
async function fetchKeysFromSecretsManager() {
  if (PUBLIC_KEY && PRIVATE_KEY) {
    return;
  }
  const client = new SecretsManagerClient({
    apiVersion: process.env.SECRETS_MANAGER_API_VERSION,
    region: process.env.SECRETS_MANAGER_REGION,
  });
  const secret = await client.send(
    new GetSecretValueCommand({ SecretId: process.env.SECRETS_MANAGER_SECRET })
  );
  const value: KeyPairSecret = JSON.parse(secret.SecretString ?? "");
  console.log(value.PRIVATE_KEY);
  PUBLIC_KEY = createPublicKey(value.PUBLIC_KEY);
  PRIVATE_KEY = createPrivateKey(value.PRIVATE_KEY);
}

export const validateSignedCookie = async (cookie: any) => {
  await verifyJwt(Cookie.parse(cookie).TOKEN, PUBLIC_KEY, {
    algorithms: [process.env.COOKIE_ALGORITHM as Algorithm],
  });
  return true;
};

const verifyJwt = async (
  token: string,
  pem: Secret,
  options: VerifyOptions
) => {
  return new Promise<any>((resolve, reject) => {
    verify(token, pem, options, (err, decoded) => {
      if (err != null) {
        reject(err);
      }
      resolve(decoded);
    });
  });
};

export const generateSignedCookieFromAccessToken = (
  payload?: JWTPayload
): any => {
  console.log("Returning signed cookie for future authorization");
  return Cookie.serialize(
    process.env.COOKIE_NAME ?? "TOKEN",
    sign({}, PRIVATE_KEY, {
      audience: payload?.aud,
      subject: payload?.sub,
      expiresIn: 3000,
      algorithm: process.env.COOKIE_ALGORITHM as Algorithm,
    }),
    {
      path: "/",
      httpOnly: true,
      maxAge: 3000,
    }
  );
};

fetchKeysFromSecretsManager();
