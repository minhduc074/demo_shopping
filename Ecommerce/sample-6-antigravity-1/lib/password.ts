import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function createSalt() {
  return randomBytes(16).toString("hex");
}

export function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

export function verifyPassword(password: string, salt: string, expectedHash: string) {
  const actualHash = Buffer.from(hashPassword(password, salt), "hex");
  const expected = Buffer.from(expectedHash, "hex");

  if (actualHash.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actualHash, expected);
}
