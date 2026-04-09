import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "futurelink_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  expiresAt: number;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET (required for signed sessions)");
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function encode(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(body);
  return `${body}.${signature}`;
}

function decode(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expectedSignature = sign(body);
  if (
    Buffer.byteLength(signature) !== Buffer.byteLength(expectedSignature) ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || payload.expiresAt < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const cookieStore = cookies();
  const payload: SessionPayload = {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  cookieStore.set(SESSION_COOKIE, encode(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(payload.expiresAt),
  });
}

export async function destroySession() {
  cookies().delete(SESSION_COOKIE);
}

export async function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return decode(token);
}
