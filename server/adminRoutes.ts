import { randomBytes } from "node:crypto";
import type { Express, NextFunction, Request, Response } from "express";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { adminAuthRateLimits, adminSessions, siteContent as siteContentTable } from "../drizzle/schema";
import { editableSections, defaultSiteContent, type EditableSection, type SiteContent } from "../shared/siteContent";
import { getDb } from "./db";
import { storagePut } from "./storage";
import { ENV } from "./_core/env";
import {
  ADMIN_EMAIL,
  ADMIN_CSRF_COOKIE,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_MS,
  adminCsrfCookieOptions,
  adminCookieOptions,
  constantTimeSecretEqual,
  hashSessionToken,
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
const uploadSchema = z.object({
  contentType: z.enum(["image/png", "image/jpeg", "image/webp", "image/gif"]),
  base64: z.string().min(1).max(7_000_000),
});
const MAX_ARTWORK_BYTES = 5 * 1024 * 1024;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS_PER_WINDOW = 10;

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

  app.post("/api/admin/auth/request-code", requireJson, (_req, res) => {
    res.status(410).json({ error: "Email-code sign-in is disabled. Use the approved email and admin password." });
  });

  app.post("/api/admin/auth/verify-code", requireJson, (_req, res) => {
    res.status(410).json({ error: "Email-code sign-in is disabled. Use the approved email and admin password." });
  });

  app.post("/api/admin/auth/login", requireJson, async (req, res) => {
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
    if (ENV.adminPassword.length < 16) {
      res.status(503).json({ error: "Admin sign-in is not configured. Set a unique password of at least 16 characters through the secure project input card." });
      return;
    }

    try {
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "The admin database is unavailable." });
        return;
      }
      if (await hitRateLimit(db, "admin-login-password-only", MAX_LOGIN_ATTEMPTS_PER_WINDOW)) {
        res.status(429).json({ error: "Too many sign-in attempts. Wait 15 minutes and try again." });
        return;
      }
      if (!constantTimeSecretEqual(body.data.password, ENV.adminPassword)) {
        res.status(401).json({ error: "Check the approved email and admin password." });
        return;
      }

      const now = new Date();
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
      console.error("[Admin] Password sign-in failed:", error instanceof Error ? error.name : "UnknownError");
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
