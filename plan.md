# GG SUPPLY Website and Admin Panel — Plan

## Scope and accepted requirements

Continue the existing GG SUPPLY React/TypeScript website and add a private content studio. Preserve the brand tagline **“Game Smart. Play Hard.”** and the existing black, white, misty dark visual style with cyan, coral, and violet accents. Keep the current public Home, Gaming Market, and Tournaments pages and make their editable content database-backed.

Only `yemannhein26@gmail.com` may authenticate to `/admin`. Each new sign-in requires the approved Gmail address, a site admin password, and a fresh six-digit code emailed through Gmail SMTP. The code expires, is single-use, and is rate-limited. The password and Gmail App Password must be provided through protected project input; do not use the previously shared chat password and do not put credentials in source, logs, or documentation.

The administrator must be able to edit site settings, news posts, artwork, market listings, tournament posts, coaching offers, coach profiles, and guides, including adding coaches. Authorized image uploads should be validated server-side and stored under durable Manus Storage addresses. Public pages should display persisted edits after save.

## Implementation approach

Reuse the existing WebDev React/TypeScript, Express, Drizzle ORM, and managed MySQL project. Keep authentication and content mutation in server routes under `/api/admin`; verify allowlisted identity, password, and OTP server-side. Persist only hashed OTPs and session tokens. Use a short-lived application session cookie with secure cross-site Preview attributes and a CSRF token for content changes. Keep admin session data, OTP challenges, and rate-limit windows in the managed database so they work across server instances.

Store each validated site-content section as JSON in a separate database row. Serve public content through a read-only API with no-store caching, and let the public React pages hydrate from it while retaining safe built-in defaults. Keep artwork bytes in Manus Storage and persist their stable project asset paths through the existing content editor.

Use additive Drizzle migrations only. The managed database is shared by development and the published website, so do not perform destructive schema/data operations or write test content into production data.

## Project structure

- `client/src/pages/` — Home, Gaming Market, Tournaments, and `/admin` route surfaces.
- `client/src/components/admin/` — login form and section-specific content editors.
- `client/src/admin.css` — responsive admin login and content-studio styling.
- `client/src/hooks/useSiteContent.tsx` — public-content fetching and shared React state.
- `client/src/lib/adminApi.ts` — JSON API and CSRF header handling.
- `shared/siteContent.ts` — editable content types and safe defaults shared by client/server.
- `server/adminRoutes.ts` and `server/adminSecurity.ts` — allowlisted sign-in, OTP delivery, sessions, rate limiting, CSRF, content validation, and upload routes.
- `drizzle/schema.ts` and `drizzle/` — admin challenge/session/rate-limit/content tables and committed migrations.
- `client/public/manus-routes.json` — route declarations kept synchronized with the React router.
- `docs/hosting-and-domain.md` — current website-hosting and custom-domain findings.

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

Keep the currently published public visibility and the existing `manus.space` address unchanged unless the user separately confirms a visibility or domain change. Do not purchase or connect a domain without the user's direction. Autoscale/on-demand remains the default; do not enable always-on hosting without the user's explicit choice and the platform's own confirmation flow.
