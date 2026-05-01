import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

const OWNER_COOKIE = "w2c_owner";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function getOrCreateOwnerCookie(): Promise<string> {
  const store = await cookies();
  const existing = store.get(OWNER_COOKIE);
  if (existing?.value) return existing.value;
  const id = randomUUID();
  store.set(OWNER_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
    path: "/",
  });
  return id;
}

export async function getOwnerCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(OWNER_COOKIE)?.value ?? null;
}
