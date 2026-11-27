# 08 — Go live

## Goal

Put the site on the internet at a domain of its own, for no running cost
beyond the domain, and check it for security problems before anyone links to
it. The owner bought `yavuzeymensimracing.com` at Natro on 27 November 2026;
everything else runs on free plans.

## Reasoning

### Where it is hosted, and why there

The site is static: `pnpm build` writes HTML, JS, CSS, fonts, images and video
into `dist/` and nothing runs on a server. Any static host would do; the
choice was about cost and limits.

- **Cloudflare Pages** (chosen): free with no bandwidth cap, commercial use
  allowed, 25 MB per file (the largest file here is a 1.6 MB reel). It builds
  from the GitHub repository on every push to `main`, so deploying is merging.
- **GitHub Pages** would also be free, but the `VITE_` values would have to go
  through an Actions workflow, and response headers cannot be set at all.
- **Vercel's free plan** forbids commercial use, and the page carries a
  "Business enquiries" button.

DNS moved to Cloudflare too (Natro's nameservers were replaced with
Cloudflare's): Pages can only serve an apex domain from a zone Cloudflare
runs, and Cloudflare's DNS is free. Natro's paid "Profesyonel DNS" is not
needed and stays off. The domain itself stays registered at Natro.

### How it is configured

None of this is in the repository, so it is written down here.

| Setting        | Value                                                       |
| -------------- | ----------------------------------------------------------- |
| Pages project  | `yavuzeymen-portfolio`, production branch `main`            |
| Build          | `pnpm build`, output `dist`                                 |
| Variables      | the five filled `VITE_` values from `.env.local`            |
|                | `NODE_VERSION` 22, `PNPM_VERSION` 11.21.0                   |
| Custom domains | `yavuzeymensimracing.com` and `www.yavuzeymensimracing.com` |
| GitHub access  | the Cloudflare app, installed on this one repository only   |
| Nameservers    | `everton.ns.cloudflare.com`, `rafe.ns.cloudflare.com`       |

The `VITE_` values are public: they are inlined into the bundle, which is why
setting them in the Cloudflare dashboard is fine. A new one added to
`.env.example` must also be added there, or production renders without it.
`VITE_CONTACT_PHONE` is left unset, as it is in `.env.local`.

The two records Cloudflare imported from Natro (an A record on the apex and a
`www` CNAME, both pointing at Natro's parking page) were deleted before the
domains were attached to Pages.

### `*.pages.dev` may not load from Turkey

From the owner's own connection, the terminal could not reach
`yavuzeymen-portfolio.pages.dev` (nor `pages.dev` itself), while Chrome, which
resolves through secure DNS, could. The custom domain loads either way. So
share the domain, never the `pages.dev` address, and do not use the
`pages.dev` address to judge whether a deploy worked.

### Head, robots and sitemap

With a final domain, `index.html` gets `og:url`, a canonical link, and absolute
URLs for both social images; plan 02 left these waiting for exactly this.
The canonical is also what keeps `www` and `pages.dev` from counting as
separate copies of the page. `robots.txt` allows everything and points at a
one-URL `sitemap.xml`.

### Security review

The site has no server, no forms, no accounts and no cookies, so most web
vulnerabilities have nothing to attach to. What was checked:

- **The bundle and the repository.** No `dangerouslySetInnerHTML`, `eval` or
  `innerHTML` writes; no secrets in `dist/`; no source maps shipped; only
  `.env.example` is tracked; CI already runs gitleaks. Every `target="_blank"`
  link carries `rel="noopener noreferrer"`.
- **Dependencies.** `pnpm audit --prod` was clean. The full audit found 12
  advisories (7 high), all in build and test tooling (eslint, typescript-eslint,
  tailwind's build plugin, vitest), none of it shipped. `pnpm update -D` within
  the existing ranges cleared all twelve. The runtime packages (React, motion)
  were left alone on purpose: a plain `pnpm update` moved them too and the
  bundle grew 11 KB gzipped, which security did not call for.
- **Response headers.** Pages sent only `nosniff` and a referrer policy.
  `public/_headers` adds a Content-Security-Policy, HSTS, frame denial,
  `Cross-Origin-Opener-Policy` and a Permissions-Policy, and caches the
  hashed `/assets/` files forever. Every CSP source is justified in the file.
  CSP was checked on this branch's Pages preview deployment, since
  `vite preview` does not read `_headers`: no violations while scrolling the
  whole page, and the helmet mask, fonts and videos all loaded.
- **E-mail spoofing.** The domain sends no mail, but the SPF record imported
  from Natro authorised Natro's mail servers to send as it, and there was no
  DMARC record. With the owner's go-ahead the apex TXT is now `v=spf1 -all`
  and `_dmarc` holds `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s`, so no
  mail can pass as coming from the domain. **If the domain is ever given a
  mailbox, both records must change first**, or its own mail is rejected.
- **Cloudflare's own analytics.** New zones inject Cloudflare's Web Analytics
  beacon (Real User Measurements) into every HTML response sent to a browser.
  The CSP blocked it, so it measured nothing and logged an error on every
  visit, and the privacy note says there are no analytics. It is switched off
  under Speed, Real user monitoring, "Disable completely". If it is ever
  wanted, the CSP and the privacy note have to change with it.
- **Plain HTTP** redirects to HTTPS (Cloudflare, 301), and `www` redirects to
  the apex with path and query kept (a Cloudflare Redirect Rule from the
  "WWW to root" template, 301).
- **Private vulnerability reporting** is now on in the repository, so the flow
  in `SECURITY.md` works.

### Privacy note

The footer's `Gizlilik` and `Şartlar` pointed at `#`. A portfolio with nothing
to sign up for or buy has no terms to state, so `Şartlar` went. `Gizlilik` now
opens a short Turkish note (`sections/Contact/PrivacyNote.tsx`): no cookies,
analytics or forms; Cloudflare handles connection data to serve the page; the
Kick live-status check goes from the visitor's browser to Kick; e-mail is used
only to reply. The note describes the site's actual behaviour, so it has to
change if the site ever gains analytics, a form, or another third party.

### Google Search Console

A **Domain** property for `yavuzeymensimracing.com` (it covers `www` and every
protocol), in the owner's Google account. Verified with a
`google-site-verification` TXT record on the apex, added by hand rather than
through Search Console's offer to connect to Cloudflare, which would have given
Google write access to the zone's DNS. **Do not delete that TXT record**:
Search Console re-checks it and drops the verification if it goes. The sitemap
is submitted and indexing of the home page was requested.

### What a finished site carries

Added once the site was live, so nothing a visitor, a crawler or a phone
looks for comes back empty:

- **A 404 page.** `404.html` is a second Vite entry, built with the site's own
  stylesheet. Without it Pages treated the site as a single-page app and
  answered every mistyped address with the home page and a 200, which search
  engines read as endless copies of it. The site has no client-side routes
  (its links are `#` anchors), so nothing relied on that fallback.
- **Structured data.** `vite.config.ts` writes a schema.org WebSite and Person
  into the built `index.html`: the site name Google shows above a result, and
  `sameAs` links to his profiles, taken from the same `VITE_` values as the
  page, so they are never in git.
- **A web manifest** (`site.webmanifest`) with the 192 and 512 icons, for a
  phone's home screen.
- **`/.well-known/security.txt`**, pointing at the repository's private
  vulnerability reporting. **Its `Expires` date is 27 November 2027**: move it
  on a year before then, or the file reads as abandoned.

## Steps

1. Domain onto Cloudflare: zone on the free plan, Natro nameservers replaced.
2. Pages project from the GitHub repository, variables set, first deploy.
3. Natro parking records removed; apex and `www` attached to Pages.
4. `og:url`, canonical, absolute image URLs; `robots.txt`, `sitemap.xml`.
5. Security review; `_headers`; dev dependencies updated.
6. With the owner's go-ahead: SPF and DMARC, the `www` → apex redirect,
   private vulnerability reporting.
7. Privacy note in the footer; Google Search Console.

## Done when

- `https://yavuzeymensimracing.com` serves the build of `main`, over HTTPS,
  with the headers in `public/_headers` and no CSP violations in the console.
- `www` and plain HTTP both end up on `https://yavuzeymensimracing.com/`.
- `pnpm audit` reports nothing.

## Progress

- [x] 1 — domain on Cloudflare
- [x] 2 — Pages project and first deploy
- [x] 3 — domains attached
- [x] 4 — head, robots, sitemap
- [x] 5 — security review
- [x] 6 — SPF/DMARC, `www` redirect, private vulnerability reporting
- [x] 7 — privacy note; Search Console
