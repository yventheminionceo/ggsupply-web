# GG SUPPLY hosting and domain notes

Checked 14 November 2026 against the bound project's WebDev configuration and official Manus/PublicVM documentation.

## Current project state

- Published: yes.
- Current public address: `https://ggsupply-vnpybpfl.manus.space`.
- Visibility: public; leave unchanged unless Yven requests a different setting.
- Effective hosting mode: `on_demand` (Autoscale). It can sleep after inactivity and a later visit can cold-start; it remains request-accessible but is not a guarantee of a continuously warm process.
- No custom domain is connected.
- No DNS or domain change has been performed; the current request is to connect `ggsupply.publicvm.com`.

## Domain options

The general Manus custom-domain guide says a user can connect an owned domain or subdomain, gives A/CNAME records as typical DNS options, and says Manus provisions free TLS after connection [1]. The more specific Manus Help Center says comprehensive custom-domain connections are for paid users; it describes the Free-user alternative as requesting a source-code package for self-deployment [4]. For this Free-plan account, treat Manus-managed custom-domain connection as unavailable unless the account’s eligibility changes. No upgrade or external DNS change is authorized.

PublicVM describes `publicvm.com` as a shared free-domain service where each customer controls content and DNS records beneath their assigned subdomain [5]. Therefore `ggsupply.publicvm.com` is a delegated subdomain, not a separately registered root domain. The user says they have it for one year. The actual Manus DNS records are not available until a domain connection can be initiated, so none have been guessed or changed.

A Free user can request the Manus source-code package for self-deployment, but that path would still need a compatible host for this project’s Node backend and MySQL database. Domain/DNS service alone does not host the application.

## Hosting and usage

The official usage documentation lists a monthly $10 Cloud allowance for hosting costs, with usage-based billing beyond the free allowance. If usage exceeds the available balance and no funds are available, the site may become temporarily unavailable. This is not a promise of unlimited free hosting. Autoscale/on-demand is billed for active request duration and can cold-start after idle time; a regular content website generally fits this mode [2] [3].

The WebDev hosting reference describes Reserved as always-on, but it is not a free always-on guarantee. It requires owner membership and can incur usage charges. Do not enable it without explicit user choice and the platform's built-in confirmation.

## References

[1]: https://manus.im/docs/website-builder/custom-domains "Custom Domains"
[2]: https://manus.im/docs/website-builder/getting-started/usage-and-pricing "Usage and Pricing"
[3]: https://manus.im/blog/manus-hosting-web-builder "Introducing Hosting Modes"
[4]: https://help.manus.im/en/articles/11711203-how-can-i-connect-manage-the-website-created-by-manus-to-my-custom-domain "Manus Help Center domain eligibility and management"
[5]: https://publicvm.com "PublicVM shared-domain service"
