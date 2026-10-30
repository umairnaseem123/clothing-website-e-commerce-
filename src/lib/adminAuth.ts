import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "kalite_admin";

const token = (pw: string) =>
  createHash("sha256").update("kalite-admin:" + pw).digest("hex");

const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const adminConfigured = () => !!process.env.ADMIN_PASSWORD;

export function passwordOk(input: string) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  return same(token(input), token(real));
}

export const adminToken = () => token(process.env.ADMIN_PASSWORD || "");

export async function isAdmin() {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  const c = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!c && same(c, token(real));
}