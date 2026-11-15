# GG SUPPLY Website and Admin Panel — Plan

## Scope and accepted requirements

Continue the existing GG SUPPLY React/TypeScript website and its private content studio. Preserve the tagline **“Game Smart. Play Hard.”**, the black/white misty dark aesthetic with cyan, coral, and violet accents, and the Home, Gaming Market, and Tournaments pages. Public content remains database-backed.

The user has now requested that emailed one-time codes be removed **for now** so they can enter the admin panel. Only `yemannhein26@gmail.com` may authenticate to `/admin` or access admin data/mutations. For now, sign-in requires the exact allowlisted email and the site admin password; do not require or send an OTP and do not call Gmail SMTP. Keep the password server-only, provided via protected project input, and require at least 16 characters. Preserve server-side rate limiting, hashed random sessions, secure cookies, and CSRF checks for mutations. The previously saved Gmail App Password is no longer part of the active sign-in flow.

The administrator must be able to edit site settings, news, artwork, market listings, tournament posts, coaching offers, coach profiles, and guides, including adding coaches. Validate uploads server-side and store them under durable Manus Storage addresses. Public pages must display persisted edits after save.

## Implementation approach

Reuse the existing WebDev React/TypeScript, Express, Drizzle ORM, and managed MySQL project. Keep login and content mutation in server routes under `/api/admin`; compare the allowlisted email and password server-side, and store only a hash of each generated session token. Maintain 12-hour server sessions, the existing `SameSite=None; Secure` cookie behavior for public HTTPS Preview, and CSRF validation for mutations. Retain the existing password attempt limiter. Do not send OTP email or call Gmail SMTP. Leave the existing OTP tables in place for now; no schema migration or destructive data change is needed to disable the code step.

Store each validated site-content section as JSON in a separate database row. Serve public content through a read-only API with no-store caching, and let public React pages hydrate from it while retaining safe built-in defaults. Keep artwork bytes in Manus Storage and persist their stable project asset paths through the existing content editor.

The managed database is shared by Preview and the published website. Do not perform destructive schema/data operations or write disposable content into production data.

## Project structure

- `client/src/pages/` — Home, Gaming Market, Tournaments, and `/admin` route surfaces.
- `client/src/components/admin/` — password-only login form and section-specific content editors.
- `client/src/admin.css` — responsive admin login and content-studio styling.
- `client/src/hooks/useSiteContent.tsx` — public-content fetching and shared React state.
- `client/src/lib/adminApi.ts` — JSON API and CSRF header handling.
- `shared/siteContent.ts` — editable content types and safe defaults shared by client/server.
- `server/adminRoutes.ts` and `server/adminSecurity.ts` — allowlisted email/password login, sessions, rate limiting, CSRF, content validation, and upload routes. OTP email code is inactive for now.
- `drizzle/schema.ts` and `drizzle/` — admin session/rate-limit/content tables and committed migrations; existing OTP tables are retained but unused.
- `client/public/manus-routes.json` — route declarations kept synchronized with the React router.
- `docs/hosting-and-domain.md` — current website-hosting and custom-domain findings.
- `ADMIN_SETUP.md` — secure admin setup and temporary password-only login guidance.

## Design direction

**Design movement:** Misty esports editorial combined with a restrained command-center dashboard.

**Core principles:** strong type hierarchy; a dark, low-glare canvas; uncluttered spacing; precise, responsive controls.

**Color philosophy:** charcoal and soft white establish a calm high-contrast base. Cyan signals the GG SUPPLY brand and primary action; coral marks warnings or unsaved states; violet is reserved for secondary tooling and uploads.

**Layout paradigm:** public pages keep their editorial hero-and-section composition. The admin uses a compact top bar and left control rail beside a wide editing workspace, collapsing into touch-friendly navigation on small screens.

**Signature elements:** fine tactical grid lines; subtle mist-like radial gradients; clipped GG glyph frames with cyan edge-light.

**Interaction philosophy:** edits remain in the active working copy until explicitly saved; per-section dirty indicators make unsaved work visible; errors are explicit and destructive removal asks for confirmation.

**Animation:** short 150–220 ms transitions for focus, hover, and state changes. Avoid flashing/glowing loops or motion that distracts from content work; honor reduced-motion preferences from the browser.

**Typography system:** Inter for interface copy and controls; the existing Impact/Arial Narrow condensed display treatment for oversized editorial headlines. Use compact uppercase labels for metadata and regular sentence case for forms.

**Brand essence:** a Myanmar-first gaming destination that combines practical gaming services with esports news and community; direct, competitive, welcoming.

**Brand voice:** concise, confident, player-first. Examples: “GAME SMART. PLAY HARD.” and “Your site. Your signal.”

**Wordmark and logo:** retain the existing custom GG glyph and GG SUPPLY wordmark already used across the public site; do not replace it with a default text-only logo.

**Signature brand color:** cyan `#58E4EE`.

## Delivery boundaries

Keep the current public visibility, Manus hosting, and `manus.space` address. The user explicitly requested republishing this updated version. Do not change the domain or hosting mode as part of this request. Autoscale/on-demand remains the current mode; do not enable always-on hosting without the user's explicit choice and the platform's confirmation flow.
