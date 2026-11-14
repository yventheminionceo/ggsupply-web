import { int, longtext, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing the starter OAuth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** A single-use, short-lived emailed login code. Only an HMAC is stored. */
export const adminLoginChallenges = mysqlTable("gg_admin_login_challenges", {
  id: varchar("id", { length: 64 }).primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  codeHash: varchar("code_hash", { length: 64 }).notNull(),
  attemptCount: int("attempt_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  consumedAt: timestamp("consumed_at"),
});

/** Opaque admin session tokens are stored as SHA-256 hashes, never as raw cookies. */
export const adminSessions = mysqlTable("gg_admin_sessions", {
  tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
});

/** Persistent windows bound login attempts and emailed-code requests across instances. */
export const adminAuthRateLimits = mysqlTable("gg_admin_auth_rate_limits", {
  bucket: varchar("bucket", { length: 80 }).primaryKey(),
  windowStartedAt: timestamp("window_started_at").notNull(),
  requestCount: int("request_count").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/** Each validated public-content section is stored as a separate JSON string. */
export const siteContent = mysqlTable("gg_site_content", {
  section: varchar("section", { length: 24 }).primaryKey(),
  payload: longtext("payload").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AdminLoginChallenge = typeof adminLoginChallenges.$inferSelect;
export type AdminSession = typeof adminSessions.$inferSelect;
export type SiteContentRow = typeof siteContent.$inferSelect;
