import { createHash, randomBytes, randomInt } from "node:crypto";
import type { Express, NextFunction, Request, Response } from "express";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import nodemailer from "nodemailer";
import { z } from "zod";
import { adminAuthRateLimits, adminLoginChallenges, adminSessions, siteContent as siteContentTable } from "../drizzle/schema";
import { editableSections, defaultSiteContent, type EditableSection, type SiteContent } from "../shared/siteContent";
import { getDb } from "./db";
import { storagePut } from "./storage";
import { ENV } from "./_core/env";
import {
  ADMIN_EMAIL,
  ADMIN_CSRF_COOKIE,
  ADMIN_OTP_MAX_ATTEMPTS,
  ADMIN_OTP_TTL_MS,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_MS,
  adminCsrfCookieOptions,
  adminCookieOptions,
  constantTimeHexEqual,
  constantTimeSecretEqual,
  hashOneTimeCode,
  hashSessionToken,
  maskEmail,
  normalizeEmail,
} from "./adminSecurity";

const imageUrlSchema = z.string().trim().max(2048).refine(isSafeImageUrl, "Use an HTTPS or /manus-storage/ image URL.");
const idSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/);
const externalUrlSchema = z.string().trim().max(2048).refine((value) => !value || (value.startsWith("https://") && !/[\u0000-\u001f"'<>]/.test(value)), "Use an HTTPS link.");
const settingsSchema = z.object({
  tagline: z.string().trim().min(1).max(100),
  heroDescription: z.string().trim().max(400),
  communityMessage: z.string().trim().max(400),
  communityUrl: externalUrlSchema,
});
const newsSchema = z.array(z.object({
  id: idSchema,
  category: z.string().trim().min(1).max(48),
  title: z.string().trim().min(1).max(180),
  summary: z.string().trim().max(400),
  imageUrl: imageUrlSchema,
})).max(24);
const artworkSchema = z.object({
  homeHeroUrl: imageUrlSchema,
  newsFeatureUrl: imageUrlSchema,
  tournamentPosterUrl: imageUrlSchema,
});
const marketSchema = z.array(z.object({
  id: idSchema,
  game: z.string().trim().min(1).max(80),
  offer: z.string().trim().min(1).max(100),
  category: z.enum(["CURRENCY", "PASSES", "GIFT CARDS", "COACHING"]),
  detail: z.string().trim().max(400),
  note: z.string().trim().max(100),
  priceLabel: z.string().trim().max(48),
  color: z.enum(["cyan", "violet", "coral"]),
  icon: z.enum(["crosshair", "sparkles", "flame", "calendar", "gift", "target"]),
})).max(40);
const tournamentSchema = z.array(z.object({
  id: idSchema,
  game: z.string().trim().min(1).max(64),
  title: z.string().trim().min(1).max(120),
  format: z.string().trim().min(1).max(64),
  description: z.string().trim().max(800),
  scheduleLabel: z.string().trim().max(80),
  status: z.string().trim().max(48),
  playerCap: z.number().int().refine((value) => [2, 4, 8, 16, 32, 64, 128].includes(value), "Choose a supported bracket size."),
  registrationFeeMmk: z.number().int().min(0).max(100_000_000),
  championPrizeMmk: z.number().int().min(0).max(100_000_000),
  posterUrl: imageUrlSchema,
})).max(12);
const coachingSchema = z.array(z.object({
  id: idSchema,
  name: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(100),
  description: z.string().trim().max(400),
  note: z.string().trim().max(48),
  game: z.string().trim().max(80),
  specialty: z.string().trim().max(120),
  availability: z.string().trim().max(120),
  icon: z.enum(["target", "search", "users"]),
})).max(24);
const coachesSchema = z.array(z.object({
  id: idSchema,
  name: z.string().trim().min(1).max(100),
  game: z.string().trim().min(1).max(64),
  specialty: z.string().trim().min(1).max(120),
  availability: z.string().trim().max(120),
  bio: z.string().trim().max(500),
  avatarUrl: imageUrlSchema,
})).max(32);
const guidesSchema = z.array(z.object({
  id: idSchema,
  category: z.string().trim().min(1).max(48),
  title: z.string().trim().min(1).max(140),
})).max(24);
const sectionSchemas = {
  settings: settingsSchema,
  news: newsSchema,
  artwork: artworkSchema,
  market: marketSchema,
  tournaments: tournamentSchema,
  coaching: coachingSchema,
  coaches: coachesSchema,
  guides: guidesSchema,
};

const loginSchema = z.object({ email: z.string().trim().email().max(320), password: z.string().min(1).max(256) });
const verifyCodeSchema = z.object({ challengeId: z.string().regex(/^[a-f0-9]{64}$/i), code: z.string().regex(/^\d{6}$/) });
const uploadSchema = z.object({
  contentType: z.enum(["image/png", "image/jpeg", "image/webp", "image/gif"]),
  base64: z.string().min(1).max(7_000_000),
});
const MAX_ARTWORK_BYTES = 5 * 1024 * 1024;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS_PER_WINDOW = 10;
const MAX_OTP_EMAILS_PER_WINDOW = 3;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

function isSafeImageUrl(value: string): boolean {
  if (!value) return true;
  if (value.startsWith("/manus-storage/") && !value.includes("..") && !/[\u0000-\u001f"'<>]/.test(value)) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password && !/[\u0000-\u001f"'<>]/.test(value);
  } catch {
    return false;
  }
}

function isEditableSection(value: string): value is EditableSection {
  return (editableSections as readonly string[]).includes(value);
}

function cloneDefaults(): SiteContent {
  return {
    settings: { ...defaultSiteContent.settings },
    news: defaultSiteContent.news.map((item) => ({ ...item })),
    artwork: { ...defaultSiteContent.artwork },
    market: defaultSiteContent.market.map((item) => ({ ...item })),
    tournaments: defaultSiteContent.tournaments.map((item) => ({ ...item })),
    coaching: defaultSiteContent.coaching.map((item) => ({ ...item })),
    coaches: defaultSiteContent.coaches.map((item) => ({ ...item })),
    guides: defaultSiteContent.guides.map((item) => ({ ...item })),
  };
}

function applySection(content: SiteContent, section: EditableSection, value: unknown): void {
  const checked = sectionSchemas[section].safeParse(value);
  if (!checked.success) return;
  switch (section) {
    case "settings": content.settings = checked.data as SiteContent["settings"]; break;
    case "news": content.news = checked.data as SiteContent["news"]; break;
    case "artwork": content.artwork = checked.data as SiteContent["artwork"]; break;
    case "market": content.market = checked.data as SiteContent["market"]; break;
    case "tournaments": content.tournaments = checked.data as SiteContent["tournaments"]; break;
    case "coaching": content.coaching = checked.data as SiteContent["coaching"]; break;
    case "coaches": content.coaches = checked.data as SiteContent["coaches"]; break;
    case "guides": content.guides = checked.data as SiteContent["guides"]; break;
  }
}

async function readSiteContent(dbOverride?: Awaited<ReturnType<typeof getDb>>): Promise<SiteContent> {
  const content = cloneDefaults();
  const db = dbOverride ?? await getDb();
  if (!db) return content;
  const rows = await db.select().from(siteContentTable);
  for (const row of rows) {
    if (!isEditableSection(row.section)) continue;
    try {
      applySection(content, row.section, JSON.parse(row.payload));
    } catch {
      // Ignore malformed rows and preserve the safe built-in defaults.
    }
  }
  return content;
}

function noStore(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader("Cache-Control", "no-store, private");
  next();
}

function requireJson(req: Request, res: Response, next: NextFunction): void {
  if (!req.is("application/json")) {
    res.status(415).json({ error: "Send this request as JSON." });
    return;
  }
  next();
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie ?? "";
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

function clearAdminCookie(req: Request, res: Response): void {
  const { maxAge: _maxAge, ...options } = adminCookieOptions(req.get("origin"));
  res.clearCookie(ADMIN_SESSION_COOKIE, options);
  const { maxAge: _csrfMaxAge, ...csrfOptions } = adminCsrfCookieOptions(req.get("origin"));
  res.clearCookie(ADMIN_CSRF_COOKIE, csrfOptions);
}

async function findAdminSession(req: Request) {
  const token = readCookie(req, ADMIN_SESSION_COOKIE);
  if (!token || !/^[a-f0-9]{64}$/i.test(token)) return null;
  const db = await getDb();
  if (!db) return null;
  const now = new Date();
  const [session] = await db.select().from(adminSessions).where(and(
    eq(adminSessions.tokenHash, hashSessionToken(token)),
    eq(adminSessions.email, ADMIN_EMAIL),
    isNull(adminSessions.revokedAt),
    gt(adminSessions.expiresAt, now),
  )).limit(1);
  return session ?? null;
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  void (async () => {
    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "The admin database is unavailable." });
      return;
    }
    const session = await findAdminSession(req);
    if (!session) {
      clearAdminCookie(req, res);
      res.status(401).json({ error: "Sign in to continue." });
      return;
    }
    res.locals.adminEmail = session.email;
    next();
  })().catch((error) => {
    console.error("[Admin] Session check failed:", error instanceof Error ? error.name : "UnknownError");
    res.status(500).json({ error: "Could not verify the admin session." });
  });
}

function requireAdminCsrf(req: Request, res: Response, next: NextFunction): void {
  const cookieToken = readCookie(req, ADMIN_CSRF_COOKIE);
  const headerToken = req.get("x-gg-supply-csrf") ?? "";
  if (!cookieToken || !constantTimeSecretEqual(headerToken, cookieToken)) {
    res.status(403).json({ error: "Refresh the admin page and try again." });
    return;
  }
  next();
}

async function hitRateLimit(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, bucket: string, maximum: number): Promise<boolean> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - LOGIN_WINDOW_MS);
  await db.insert(adminAuthRateLimits).values({ bucket, windowStartedAt: now, requestCount: 1, updatedAt: now }).onDuplicateKeyUpdate({
    set: {
      windowStartedAt: sql`CASE WHEN ${adminAuthRateLimits.windowStartedAt} <= ${cutoff} THEN ${now} ELSE ${adminAuthRateLimits.windowStartedAt} END`,
      requestCount: sql`CASE WHEN ${adminAuthRateLimits.windowStartedAt} <= ${cutoff} THEN 1 ELSE ${adminAuthRateLimits.requestCount} + 1 END`,
      updatedAt: now,
    },
  });
  const [row] = await db.select({ requestCount: adminAuthRateLimits.requestCount }).from(adminAuthRateLimits).where(eq(adminAuthRateLimits.bucket, bucket)).limit(1);
  return Boolean(row && row.requestCount > maximum);
}

function normalizedGmailAppPassword(): string {
  return ENV.gmailAppPassword.replace(/\s+/g, "");
}

function createMailer() {
  const appPassword = normalizedGmailAppPassword();
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: ADMIN_EMAIL, pass: appPassword },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

function imageExtension(contentType: string): string {
  switch (contentType) {
    case "image/png": return "png";
    case "image/jpeg": return "jpg";
    case "image/webp": return "webp";
    case "image/gif": return "gif";
    default: return "bin";
  }
}

function imageBytesMatch(buffer: Buffer, contentType: string): boolean {
  if (contentType === "image/png") return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (contentType === "image/jpeg") return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (contentType === "image/webp") return buffer.length > 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  if (contentType === "image/gif") return buffer.length > 6 && ["GIF87a", "GIF89a"].includes(buffer.toString("ascii", 0, 6));
  return false;
}

export function registerAdminRoutes(app: Express): void {
  app.get("/api/site-content", noStore, async (_req, res) => {
    try {
      res.json(await readSiteContent());
    } catch (error) {
      console.error("[Content] Public read failed:", error instanceof Error ? error.name : "UnknownError");
      res.json(cloneDefaults());
    }
  });

  app.use("/api/admin", noStore);

  app.get("/api/admin/session", async (req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "The admin database is unavailable." });
        return;
      }
      const session = await findAdminSession(req);
      res.json({ authenticated: Boolean(session), email: session?.email ?? null });
    } catch (error) {
      console.error("[Admin] Session status failed:", error instanceof Error ? error.name : "UnknownError");
      res.status(500).json({ error: "Could not check the admin session." });
    }
  });

  app.post("/api/admin/auth/request-code", requireJson, async (req, res) => {
    const body = loginSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Enter the approved Gmail address and admin password." });
      return;
    }
    const email = normalizeEmail(body.data.email);
    if (email !== ADMIN_EMAIL) {
      res.status(401).json({ error: "Check the approved email and admin password." });
      return;
    }
    const gmailAppPassword = normalizedGmailAppPassword();
    if (ENV.adminPassword.length < 16 || gmailAppPassword.length !== 16) {
      res.status(503).json({ error: "Secure admin sign-in is not ready. The Gmail App Password must be a 16-character Google App Password saved through the secure input card." });
      return;
    }

    try {
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "The admin database is unavailable." });
        return;
      }
      if (await hitRateLimit(db, "admin-login-password", MAX_LOGIN_ATTEMPTS_PER_WINDOW)) {
        res.status(429).json({ error: "Too many sign-in attempts. Wait 15 minutes and try again." });
        return;
      }
      if (!constantTimeSecretEqual(body.data.password, ENV.adminPassword)) {
        res.status(401).json({ error: "Check the approved email and admin password." });
        return;
      }
      if (await hitRateLimit(db, "admin-otp-email", MAX_OTP_EMAILS_PER_WINDOW)) {
        res.status(429).json({ error: "Too many code requests. Wait 15 minutes before requesting another." });
        return;
      }

      const now = new Date();
      const [recentChallenge] = await db.select({ createdAt: adminLoginChallenges.createdAt }).from(adminLoginChallenges).where(and(
        eq(adminLoginChallenges.email, ADMIN_EMAIL),
        isNull(adminLoginChallenges.consumedAt),
        gt(adminLoginChallenges.expiresAt, now),
      )).limit(1);
      if (recentChallenge && now.getTime() - recentChallenge.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
        res.status(429).json({ error: "A code was just sent. Check your Gmail inbox before requesting another." });
        return;
      }

      await db.update(adminLoginChallenges).set({ consumedAt: now }).where(and(
        eq(adminLoginChallenges.email, ADMIN_EMAIL),
        isNull(adminLoginChallenges.consumedAt),
      ));
      const challengeId = randomBytes(32).toString("hex");
      const code = String(randomInt(100_000, 1_000_000));
      await db.insert(adminLoginChallenges).values({
        id: challengeId,
        email: ADMIN_EMAIL,
        codeHash: hashOneTimeCode(challengeId, code, ENV.adminPassword),
        attemptCount: 0,
        createdAt: now,
        expiresAt: new Date(now.getTime() + ADMIN_OTP_TTL_MS),
        consumedAt: null,
      });

      const mailer = createMailer();
      try {
        await mailer.sendMail({
          from: `GG SUPPLY Admin <${ADMIN_EMAIL}>`,
          to: ADMIN_EMAIL,
          subject: "Your GG SUPPLY admin sign-in code",
          text: `Your one-time GG SUPPLY admin sign-in code is ${code}. It expires in 10 minutes and can only be used once. If you did not request it, ignore this message.`,
          html: `<div style="font-family:Arial,sans-serif;background:#0b0d12;color:#f4f5f7;padding:28px"><p style="letter-spacing:2px;color:#58e4ee;font-weight:bold">GG SUPPLY / ADMIN</p><h1 style="font-size:20px">Your sign-in code</h1><p style="color:#b8bec8">Enter this one-time code to finish signing in. It expires in 10 minutes and works once.</p><div style="font-size:34px;font-weight:bold;letter-spacing:9px;color:#ffffff;padding:16px 0">${code}</div><p style="font-size:12px;color:#8b929e">If you did not request this code, ignore this email.</p></div>`,
        });
      } catch (error) {
        await db.update(adminLoginChallenges).set({ consumedAt: new Date() }).where(eq(adminLoginChallenges.id, challengeId));
        const smtpError = error as { name?: unknown; code?: unknown; responseCode?: unknown };
        const name = typeof smtpError.name === "string" ? smtpError.name : "UnknownError";
        const code = typeof smtpError.code === "string" ? smtpError.code : "unknown";
        const responseCode = typeof smtpError.responseCode === "number" ? smtpError.responseCode : null;
        console.error("[Admin] OTP delivery failed:", { name, code, responseCode });
        const authenticationRejected = code === "EAUTH" || responseCode === 535;
        res.status(503).json({ error: authenticationRejected
          ? "Gmail rejected the saved App Password. Replace it with a fresh 16-character Google App Password for the approved Gmail account using the secure input card."
          : "The sign-in code could not be delivered. Check the Gmail SMTP settings and try again." });
        return;
      } finally {
        mailer.close();
      }
      res.json({ ok: true, challengeId, maskedEmail: maskEmail(ADMIN_EMAIL), expiresInSeconds: ADMIN_OTP_TTL_MS / 1000 });
    } catch (error) {
      console.error("[Admin] Code request failed:", error instanceof Error ? error.name : "UnknownError");
      res.status(500).json({ error: "Could not start admin sign-in." });
    }
  });

  app.post("/api/admin/auth/verify-code", requireJson, async (req, res) => {
    const body = verifyCodeSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Enter the six-digit code from your Gmail." });
      return;
    }
    try {
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "The admin database is unavailable." });
        return;
      }
      const now = new Date();
      const [challenge] = await db.select().from(adminLoginChallenges).where(eq(adminLoginChallenges.id, body.data.challengeId)).limit(1);
      if (!challenge || challenge.email !== ADMIN_EMAIL || challenge.consumedAt || challenge.expiresAt.getTime() <= now.getTime() || challenge.attemptCount >= ADMIN_OTP_MAX_ATTEMPTS) {
        res.status(401).json({ error: "That code is invalid or expired. Request a fresh code." });
        return;
      }

      const candidateHash = hashOneTimeCode(challenge.id, body.data.code, ENV.adminPassword);
      if (!constantTimeHexEqual(candidateHash, challenge.codeHash)) {
        const nextAttempt = challenge.attemptCount + 1;
        await db.update(adminLoginChallenges).set({
          attemptCount: nextAttempt,
          ...(nextAttempt >= ADMIN_OTP_MAX_ATTEMPTS ? { consumedAt: now } : {}),
        }).where(and(
          eq(adminLoginChallenges.id, challenge.id),
          eq(adminLoginChallenges.attemptCount, challenge.attemptCount),
          isNull(adminLoginChallenges.consumedAt),
        ));
        res.status(401).json({ error: "That code is invalid or expired. Request a fresh code." });
        return;
      }

      const [consumeResult] = await db.update(adminLoginChallenges).set({ consumedAt: now }).where(and(
        eq(adminLoginChallenges.id, challenge.id),
        eq(adminLoginChallenges.email, ADMIN_EMAIL),
        eq(adminLoginChallenges.codeHash, challenge.codeHash),
        eq(adminLoginChallenges.attemptCount, challenge.attemptCount),
        isNull(adminLoginChallenges.consumedAt),
        gt(adminLoginChallenges.expiresAt, now),
      ));
      if ((consumeResult as { affectedRows?: number }).affectedRows !== 1) {
        res.status(401).json({ error: "That code is invalid or expired. Request a fresh code." });
        return;
      }

      const sessionToken = randomBytes(32).toString("hex");
      await db.insert(adminSessions).values({
        tokenHash: hashSessionToken(sessionToken),
        email: ADMIN_EMAIL,
        createdAt: now,
        expiresAt: new Date(now.getTime() + ADMIN_SESSION_TTL_MS),
        revokedAt: null,
      });
      res.cookie(ADMIN_SESSION_COOKIE, sessionToken, adminCookieOptions(req.get("origin")));
      res.cookie(ADMIN_CSRF_COOKIE, randomBytes(32).toString("hex"), adminCsrfCookieOptions(req.get("origin")));
      res.json({ ok: true, expiresInSeconds: ADMIN_SESSION_TTL_MS / 1000 });
    } catch (error) {
      console.error("[Admin] Code verification failed:", error instanceof Error ? error.name : "UnknownError");
      res.status(500).json({ error: "Could not complete admin sign-in." });
    }
  });

  app.post("/api/admin/auth/logout", requireJson, requireAdminCsrf, async (req, res) => {
    try {
      const db = await getDb();
      const token = readCookie(req, ADMIN_SESSION_COOKIE);
      if (db && token && /^[a-f0-9]{64}$/i.test(token)) {
        await db.update(adminSessions).set({ revokedAt: new Date() }).where(and(
          eq(adminSessions.tokenHash, hashSessionToken(token)),
          eq(adminSessions.email, ADMIN_EMAIL),
          isNull(adminSessions.revokedAt),
        ));
      }
      clearAdminCookie(req, res);
      res.json({ ok: true });
    } catch (error) {
      console.error("[Admin] Logout failed:", error instanceof Error ? error.name : "UnknownError");
      clearAdminCookie(req, res);
      res.json({ ok: true });
    }
  });

  app.get("/api/admin/content", requireAdmin, async (_req, res) => {
    try {
      const db = await getDb();
      res.json(await readSiteContent(db));
    } catch (error) {
      console.error("[Admin] Content read failed:", error instanceof Error ? error.name : "UnknownError");
      res.status(500).json({ error: "Could not load editable content." });
    }
  });

  app.put("/api/admin/content/:section", requireJson, requireAdmin, requireAdminCsrf, async (req, res) => {
    const section = req.params.section;
    if (!isEditableSection(section)) {
      res.status(404).json({ error: "That content section does not exist." });
      return;
    }
    const checked = sectionSchemas[section].safeParse(req.body?.value);
    if (!checked.success) {
      res.status(400).json({ error: "Check the fields in this section and try saving again.", fields: checked.error.issues.map((issue) => issue.path.join(".")) });
      return;
    }
    try {
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "The content database is unavailable." });
        return;
      }
      const now = new Date();
      await db.insert(siteContentTable).values({ section, payload: JSON.stringify(checked.data), updatedAt: now }).onDuplicateKeyUpdate({
        set: { payload: JSON.stringify(checked.data), updatedAt: now },
      });
      res.json({ ok: true, content: await readSiteContent(db) });
    } catch (error) {
      console.error("[Admin] Content save failed:", error instanceof Error ? error.name : "UnknownError");
      res.status(500).json({ error: "Could not save this section." });
    }
  });

  app.post("/api/admin/artwork/upload", requireJson, requireAdmin, requireAdminCsrf, async (req, res) => {
    const body = uploadSchema.safeParse(req.body);
    if (!body.success || !/^[A-Za-z0-9+/]*={0,2}$/.test(body.success ? body.data.base64 : "")) {
      res.status(400).json({ error: "Choose a PNG, JPEG, WebP, or GIF image up to 5 MB." });
      return;
    }
    try {
      const buffer = Buffer.from(body.data.base64, "base64");
      if (buffer.length === 0 || buffer.length > MAX_ARTWORK_BYTES || !imageBytesMatch(buffer, body.data.contentType)) {
        res.status(400).json({ error: "That image is invalid or larger than 5 MB." });
        return;
      }
      const key = `ggsupply/admin-artwork/${randomBytes(16).toString("hex")}.${imageExtension(body.data.contentType)}`;
      const stored = await storagePut(key, buffer, body.data.contentType);
      res.json({ ok: true, imageUrl: stored.url });
    } catch (error) {
      console.error("[Admin] Artwork upload failed:", error instanceof Error ? error.name : "UnknownError");
      res.status(502).json({ error: "Artwork upload failed. Check storage availability and try again." });
    }
  });
}
