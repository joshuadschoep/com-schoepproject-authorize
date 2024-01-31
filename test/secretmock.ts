import { readFileSync } from "fs";
import { KeyPairSecret } from "signed-cookie";

export const SECRET_DATA: KeyPairSecret = {
  PUBLIC_KEY: readFileSync("test/keys/key.pub").toString(),
  PRIVATE_KEY: readFileSync("test/keys/key.pem").toString(),
};

export const FAKE_KEY = readFileSync("test/keys/fake.pem").toString();

const mockResponse = JSON.stringify(SECRET_DATA);

jest.mock("@aws-sdk/client-secrets-manager", () => ({
  SecretsManagerClient: jest.fn().mockImplementation(() => ({
    send: jest
      .fn()
      .mockReturnValue(Promise.resolve({ SecretString: mockResponse })),
  })),
  GetSecretValueCommand: jest.fn().mockImplementation((SecretId: string) => ({
    SecretId,
  })),
}));
