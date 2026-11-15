# GG SUPPLY Admin Setup

The admin page is `/admin`. Anyone can open the sign-in page, but only the exact allowlisted account `yemannhein26@gmail.com` can obtain a server session or access admin data and mutations.

## Current sign-in flow

For now, sign in with the approved Gmail address and the site admin password only. Email one-time codes are disabled, and the active application does not call Gmail SMTP. The server requires the configured admin password to be at least 16 characters; the login is rate-limited to 10 attempts per 15-minute window. Successful sessions expire after 12 hours. Session tokens are stored as hashes, HTTPS cookies use the required cross-site Preview attributes, and content mutations require a CSRF token.

`GG_SUPPLY_ADMIN_PASSWORD` is the only required credential. Set or replace it through the protected project input card; choose **All environments** so Preview and the published website use the same value. Never paste the password in chat or put it in source files, `.env.example`, Git, screenshots, or logs. The previously shared chat password must not be reused.

`GG_SUPPLY_GMAIL_APP_PASSWORD` is not required while email-code login is off. It is not read by the active login route. The OTP challenge tables remain in the database but are unused; no database migration is needed to disable or restore the UI step.

## Content and storage

The admin studio supports site settings, news, artwork, Gaming Market listings, tournaments, coaching offers, coach profiles, and guides. PNG, JPEG, WebP, and GIF artwork up to 5 MB is validated on the server and stored at a stable Manus Storage address. Saved section content is persisted in managed MySQL and appears on the public site after refresh.

The managed MySQL database is shared between Preview and production. Avoid destructive database tests and do not write disposable content into it.

## Development commands

```sh
pnpm check
pnpm build
pnpm dev
```

The existing migrations have already been applied. Do not run `pnpm db:push` unless the schema changes; inspect any generated additive migration before applying it.
