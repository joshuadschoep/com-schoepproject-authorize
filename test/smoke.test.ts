import 'dotenv/config';
import "./secretmock";
import { FAKE_KEY, PRIVATE_KEY } from "./secretmock";
import { getOAuthToken } from "./getOAuthToken";
import {
  callHandlerWithAccessToken,
  callHandlerWithCookie,
  generateExpiredCookie,
  generateSignedCookie,
} from "./helpers";

describe("Authorization Lambda", () => {
  describe("Authorization With Cookies", () => {
    it("should handle a valid cookie", async () => {
      const callback = jest.fn();
      await callHandlerWithCookie(
        generateSignedCookie(PRIVATE_KEY.trim()),
        callback
      );
      expect(callback).toHaveBeenCalledWith(null, {
        Authorized: true,
      });
    });

    it("should reject a cookie with an invalid signature", async () => {
      const callback = jest.fn();
      await callHandlerWithCookie(
        generateSignedCookie(FAKE_KEY.trim()),
        callback
      );
      expect(callback).toHaveBeenCalledWith(null, {
        Authorized: false,
        Error: expect.objectContaining({
          Code: 401,
        }),
      });
    });

    it("should reject an expired cookie", async () => {
      const callback = jest.fn();
      await callHandlerWithCookie(
        generateExpiredCookie(PRIVATE_KEY.trim()),
        callback
      );
      expect(callback).toHaveBeenCalledWith(null, {
        Authorized: false,
        Error: expect.objectContaining({
          Code: 401,
        }),
      });
    });
  });

  describe("Authorization with Access Tokens", () => {
    let accessToken: string;
    let invalidAccessToken: string;
    beforeAll(async () => {
      accessToken = await getOAuthToken();
      invalidAccessToken = accessToken.concat("arbitrary===");
    });

    it("should handle a valid access token", async () => {
      const callback = jest.fn();
      await callHandlerWithAccessToken(accessToken, callback);
      expect(callback).toHaveBeenCalledWith(null, {
        Authorized: true,
        SignedCookie: expect.stringContaining("TOKEN="),
      });
    });

    it("should handle an invalid access token", async () => {
      const callback = jest.fn();
      await callHandlerWithAccessToken(invalidAccessToken, callback);
      expect(callback).toHaveBeenCalledWith(null, {
        Authorized: false,
        Error: expect.objectContaining({
          Code: 401,
        }),
      });
    });
  });
});
