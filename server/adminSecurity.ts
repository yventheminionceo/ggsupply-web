import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { CookieOptions } from "express";

export const ADMIN_EMAIL = "yemannhein26@gmail.com";
export const ADMIN_SESSION_COOKIE = "gg_supply_admin_session";
export const ADMIN_CSRF_COOKIE = "gg_supply_admin_csrf";
export const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const ADMIN_OTP_TTL_MS = 10 * 60 * 1000;
export const ADMIN_OTP_MAX_ATTEMPTS = 5;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function constantTimeSecretEqual(candidate: string, expected: string): boolean {
  if (!candidate || !expected) return false;
  const candidateDigest = createHash("sha256").update(candidate, "utf8").digest();
  const expectedDigest = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(candidateDigest, expectedDigest);
}

export function hashOneTimeCode(challengeId: string, code: string, pepper: string): string {
  return createHmac("sha256", pepper).update(`${challengeId}:${code}`, "utf8").digest("hex");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function constantTimeHexEqual(candidate: string, expected: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(candidate) || !/^[a-f0-9]{64}$/i.test(expected)) return false;
  return timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(expected, "hex"));
}

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "your approved email";
  const visiblePrefix = localPart.slice(0, 1);
  const visibleSuffix = localPart.length > 3 ? localPart.slice(-2) : "";
  const hiddenCount = Math.max(4, Math.min(10, localPart.length - visiblePrefix.length - visibleSuffix.length));
  return `${visiblePrefix}${"*".repeat(hiddenCount)}${visibleSuffix}@${domain}`;
}

export function adminCsrfCookieOptions(origin?: string): CookieOptions {
  return { ...adminCookieOptions(origin), httpOnly: false };
}

export function adminCookieOptions(origin?: string): CookieOptions {
  let localPlainHttp = false;
  if (origin) {
    try {
      const parsed = new URL(origin);
      localPlainHttp = parsed.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
    } catch {
      localPlainHttp = false;
    }
  }

  return {
    httpOnly: true,
    path: "/",
    secure: !localPlainHttp,
    sameSite: localPlainHttp ? "lax" : "none",
    maxAge: ADMIN_SESSION_TTL_MS,
  };
}
