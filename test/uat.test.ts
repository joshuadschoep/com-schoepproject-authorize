import "./secretmock";
import { AuthorizationResult, handler } from "../src/index";
import Cookie from "cookie";
import { sign } from "jsonwebtoken";
import { FAKE_KEY, SECRET_DATA } from "./secretmock";

describe("Authorization Lambda", () => {
  describe("Authorization With Cookies", () => {
    it("should handle a valid cookie", async () => {
      const asdf = jest.fn();
      await callHandlerWithCookie(
        generateSignedCookie(SECRET_DATA.PRIVATE_KEY.trim()),
        asdf
      );
      expect(asdf).toHaveBeenCalledWith(null, {
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
        generateExpiredCookie(SECRET_DATA.PRIVATE_KEY.trim()),
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
});

const generateSignedCookie = (key: string) =>
  Cookie.serialize(
    "TOKEN",
    sign({}, key, {
      audience: "https://localhost:5000/",
      subject: "user@example.com",
      expiresIn: 3000,
      algorithm: "RS256",
    })
  );

const generateExpiredCookie = (key: string) =>
  Cookie.serialize(
    "TOKEN",
    sign({}, key, {
      audience: "https://localhost:5000/",
      subject: "user@example.com",
      expiresIn: 0,
      algorithm: "RS256",
    })
  );

const callHandlerWithCookie = async (cookie: string, cb: Function) => {
  await handler(
    {
      SignedCookie: cookie,
    },
    {},
    cb
  );
};
