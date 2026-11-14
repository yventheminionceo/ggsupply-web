# GG SUPPLY Admin Setup

The Admin page is served at `/admin`. Its API checks the exact allowlisted account `yemannhein26@gmail.com`; the login page can be opened by anyone, but admin content and mutation endpoints require a valid server session.

## Required private settings

The server needs these protected project values before it can send a login code:

- `GG_SUPPLY_ADMIN_PASSWORD` — choose a new, unique password with at least 16 characters. Do not reuse a password previously shared in chat.
- `GG_SUPPLY_GMAIL_APP_PASSWORD` — an App Password generated for the approved Gmail account. This is not the normal Gmail sign-in password.

Use the secure project input card to set both values. Choose the **All environments** option so both Preview and the published site can use them. After saving, the card will clear the plaintext fields; that is expected. The configuration view should show the variable names as configured, with their values redacted. Never paste either value into chat, source files, `.env.example`, or Git.

The Gmail App Password is used only by the server-side Nodemailer transport over Gmail SMTP. The browser never receives it. A fresh six-digit email code is required at each sign-in; codes expire after 10 minutes and are single-use. The application rate-limits sign-in and code requests.

## Database and development

The managed MySQL database stores OTP challenge hashes, admin session hashes, rate-limit windows, and edited site content. It is shared between Preview and the published app. Use only additive migrations and do not run destructive test writes against it.

Development commands:

```sh
pnpm check
pnpm db:push
pnpm dev
```

`pnpm db:push` generates and applies Drizzle migrations. Inspect newly generated SQL before applying schema changes. The admin UI supports site settings, news, artwork, Gaming Market listings, tournaments, coaching offers, coach profiles, and guides. Artwork accepts PNG, JPEG, WebP, or GIF files up to 5 MB and is stored under a stable `/manus-storage/` address.
