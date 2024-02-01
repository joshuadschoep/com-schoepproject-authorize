import { KeyPairSecret } from "signed-cookie";

export const PUBLIC_KEY = process.env.TESTING_PUBLIC_KEY ?? "";
export const PRIVATE_KEY = process.env.TESTING_PRIVATE_KEY ?? "";
export const FAKE_KEY = process.env.TESTING_INVALID_PRIVATE_KEY ?? "";

export const SECRET_DATA: KeyPairSecret = {
  PUBLIC_KEY,
  PRIVATE_KEY
};

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
