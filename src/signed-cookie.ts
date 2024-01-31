import { JWTPayload } from "express-oauth2-jwt-bearer"
import Cookie from "cookie"
import { type Secret, type VerifyOptions, verify, sign } from "jsonwebtoken"
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

// at global scope so we can cache between near runs, saving time
var PUBLIC_KEY: string;
var PRIVATE_KEY: string;
async function fetchKeysFromSecretsManager() {
    if (PUBLIC_KEY && PRIVATE_KEY) {
        return;
    }
    const client = new SecretsManagerClient({ apiVersion: "2017-10-17", region: "us-east-1" })
    const secret = await client.send(new GetSecretValueCommand({ SecretId: "DevAccessKeyPair" }));
    const value = JSON.parse(secret.SecretString ?? "");
    PUBLIC_KEY = value.PUBLIC_KEY.trim();
    PRIVATE_KEY = value.PRIVATE_KEY.trim();
}

export const validateSignedCookie = async (cookie: any) => {
    await verifyJwt(Cookie.parse(cookie).TOKEN, PUBLIC_KEY, {
        algorithms: ["RS256"]
    });
    return true;
}

const verifyJwt = async (token: string, pem: Secret, options: VerifyOptions) => {
    return await new Promise<any>((resolve, reject) => {
        verify(token, pem, options, (err, decoded) => {
            if (err != null) {
                reject(err);
            }
            resolve(decoded);
        })
    })
}

export const generateSignedCookieFromAccessToken = (payload?: JWTPayload): any => {
    return Cookie.serialize("TOKEN", sign({}, PRIVATE_KEY, {
        audience: payload?.aud,
        subject: payload?.sub,
        expiresIn: 3000,
        algorithm: "RS256"
    }),
        {
            path: "/",
            maxAge: 3000
        })
}

fetchKeysFromSecretsManager();