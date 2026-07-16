# Ephphatha Concepts Limited — Website

Production-ready corporate website for **Ephphatha Concepts Limited** (CAC Reg. No. 9437252) —
construction, fashion, and general supply services.

Built with Node.js/Express, EJS, MongoDB Atlas, Cloudinary, and Resend.

---

## 1. Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster
- A Cloudinary account
- A Resend account (verified sending domain recommended)
- A WhatsApp Business number

---

## 2. Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template and fill in real values
cp .env.example .env

# 3. Seed the first admin account (reads ADMIN_DEFAULT_EMAIL / ADMIN_DEFAULT_PASSWORD from .env)
npm run seed:admin

# 4. (Optional) Seed sample gallery content so the site isn't empty on first run
npm run seed:gallery

# 5. Start the dev server (auto-restarts on file changes)
npm run dev

# ...or start it in production mode
npm start
```

The site runs at `http://localhost:3000` by default.

**Admin dashboard:** `http://localhost:3000/admin/login`

> ⚠️ **First-login checklist**
> 1. Log in with the `ADMIN_DEFAULT_EMAIL` / `ADMIN_DEFAULT_PASSWORD` from your `.env`.
> 2. Immediately change the password (the account is flagged `mustChangePassword`).
> 3. Remove or rotate `ADMIN_DEFAULT_PASSWORD` in `.env` — it should not remain as a live credential.
> 4. Replace the seeded placeholder gallery images with real project photos uploaded through
>    `/admin/gallery/new` (these go through Cloudinary properly and can be deleted/managed).

---

## 3. Environment Variables

See `.env.example` for the full list. Key groups:

| Group | Variables |
|---|---|
| App | `NODE_ENV`, `PORT`, `BASE_URL` |
| Database | `MONGODB_URI` |
| Sessions | `SESSION_SECRET`, `COOKIE_SECURE` |
| Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Email (Resend) | `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` |
| WhatsApp | `WHATSAPP_NUMBER` (digits only, country code, e.g. `2348032157437`) |
| Admin seed | `ADMIN_DEFAULT_EMAIL`, `ADMIN_DEFAULT_PASSWORD` |
| Developer attribution | `DEVELOPER_NAME`, `DEVELOPER_URL`, `DEVELOPER_BRAND`, `BRAND_URL` |

`server.js` validates required env vars on boot and exits with a clear error if any are missing.

---

## 4. Project Structure

```
config/         Mongo, Cloudinary, Resend, session config, env validation
models/         GalleryItem, ContactSubmission, AdminUser (Mongoose)
controllers/    Route handlers grouped by domain
routes/         Express routers (public, contact, auth, admin)
middleware/     Security (Helmet/CSP), rate limiting, auth, sanitization, uploads, errors
utils/          Logger, WhatsApp link builder, mailer, site config, service metadata
views/          EJS templates — layouts, partials, pages, admin
public/         CSS, client-side JS (all external — CSP-compliant), images
seed/           One-off scripts to seed the admin user and sample gallery content
```

---

## 5. Security Notes

This project ships with the following hardening already wired in:

- **Content Security Policy** (Helmet) — `script-src 'self'` plus a per-request nonce for the one
  legitimate inline JSON-LD block; no other inline scripts or handlers anywhere in the codebase.
- **CSRF protection** (`csurf`) on every form (contact, quote request, admin login, gallery CRUD).
- **Rate limiting** on the contact form, quote request, and admin login routes.
- **Input sanitization** — Mongo operator injection stripped (`express-mongo-sanitize`), XSS-cleaned
  body input (`xss`), HTTP parameter pollution blocked (`hpp`).
- **Honeypot fields** on public forms as a lightweight bot filter.
- **Bcrypt-hashed admin passwords**, account lockout after repeated failed logins, session
  regeneration on login, `httpOnly`/`sameSite=strict` cookies.
- **File upload validation** — image MIME/type allowlist, size limit, routed straight to Cloudinary
  (no local disk storage of user uploads).
- **Centralized error handling** — stack traces hidden in production.

**Before going live:**
- Set `NODE_ENV=production` and `COOKIE_SECURE=true` (requires HTTPS).
- Put the app behind HTTPS (most hosts — Render, Railway, Fly.io — provide this automatically).
- Rotate `SESSION_SECRET` and the admin password from their seed defaults.
- Verify your Resend sending domain so `CONTACT_FROM_EMAIL` doesn't land in spam.

**Dependency hardening notes:**
- **Password hashing uses `bcryptjs`, not native `bcrypt`.** The native `bcrypt` package compiles C++
  bindings at install time via `@mapbox/node-pre-gyp`, which pulls in an old, vulnerable version of
  `tar` as a build-time (not runtime) dependency — that's what was showing up as a "high" severity
  finding in `npm audit`. `bcryptjs` is a pure-JavaScript, API-compatible implementation (same
  `hash()`/`compare()` calls), so it removes that entire dependency chain rather than just patching
  around it. It's marginally slower per hash than native bcrypt, which is irrelevant here since this
  app only hashes/compares on admin login — not a high-throughput path.
- **`package.json` pins `"overrides": { "cookie": "^0.7.0" }`.** `csurf`'s own dependency tree bundles
  an older `cookie` package with a minor parsing-validation issue; npm's `overrides` field forces every
  package in the tree (including `csurf`'s internals) to use the patched version instead, without
  needing to replace `csurf` or touch any application code.
- **A note on `csurf` itself:** it is functionally correct and does its job here (session-based CSRF
  token issuance/validation), but the package is archived/unmaintained upstream — `npm install` will
  still show a deprecation warning for it, separate from the two dependency-chain issues above. There's
  no single maintained drop-in successor yet across the Express ecosystem; the most common replacement
  is `csrf-csrf` (double-submit-cookie pattern), which would mean updating `server.js` (where `csurf()`
  is mounted) and the `req.csrfToken()` calls across `authController.js`, `adminRoutes.js`, and the
  contact/quote routes to match its API.
- **After pulling these changes:** delete `node_modules` and `package-lock.json` and reinstall clean
  rather than running `npm audit fix --force` — force-fixing can silently downgrade a package
  (as happened with `csurf` in earlier testing, which briefly regressed to a *more* vulnerable version
  before a plain `npm audit fix` corrected it back).

  ```bash
  rm -rf node_modules package-lock.json
  npm install
  npm audit
  ```

---

## 6. Deployment (example: Render / Railway / any Node host)

1. Push this repository to GitHub (make sure `.env` is **not** committed — check `.gitignore`).
2. Create a new Web Service pointing at the repo.
3. Set the start command to `npm start`.
4. Add all variables from `.env.example` in the host's environment variable settings, with real values.
5. After first deploy, run `npm run seed:admin` once (via the host's one-off shell/console, or locally
   against the production `MONGODB_URI`) to create the admin account.
6. Visit `/admin/login`, sign in, and change the password immediately.

---

## 7. Feature Overview

- Home, About, three Service pages (Construction/Fashion/Supply), cross-category Portfolio, Contact.
- Each gallery item: multi-image Cloudinary gallery, modal detail view, and a **WhatsApp CTA
  pre-filled with that item's title/category/description** — the visitor's message arrives ready-made.
- Quote-request wizard on the Contact page — submits to the backend (stored + emailed via Resend)
  and hands off to WhatsApp with the scope/budget pre-filled.
- Admin dashboard: stats overview, gallery CRUD with Cloudinary uploads, enquiry management with
  status tracking.
- SEO: per-page meta/OG tags, JSON-LD structured data, dynamic `sitemap.xml`, `robots.txt`.
- Legal: Privacy Policy and Terms of Service pages (NDPR-aware).
- Footer developer attribution driven entirely by environment variables — no hardcoded credit.

---

## 8. License / Attribution

Website designed and developed by **Amos Isaiah Tizhe** for **OneXportal**.
Attribution details are sourced from `.env` (`DEVELOPER_NAME`, `DEVELOPER_URL`, `DEVELOPER_BRAND`,
`BRAND_URL`) and rendered in the site footer on every page.
