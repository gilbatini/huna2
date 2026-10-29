# Huna for Huna

Nairobi residential rental website.

## Current state (Vercel)

The repo root is a standard Next.js app that deploys to Vercel as-is:

- `/` — public homepage (listings, filters, shortlist, neighbourhoods, FAQs)
- `/dashboard` — placeholder until the management dashboard is ported

```sh
npm install
npm run dev     # http://localhost:3000
npm run build
```

## `legacy-cloudflare/`

The original export from ChatGPT site hosting: management dashboard, tenant portal,
API routes, D1/Drizzle database, R2 document storage and "Sign in with ChatGPT" auth.
It targets Cloudflare Workers and is **not** part of the Vercel build. It is kept as the
reference for porting the dashboard to Vercel + Supabase (Postgres, Storage, Auth).

---

## Original export notes


Nairobi residential rental website and property-management workspace.

This is the complete source export of the latest homepage and dashboard built in this conversation, based on commit `1d7013af7e88fbac67e98d17c1cc82405cceae65`. It includes application code, styles, image assets, API routes, database migrations, and the framework/build tooling. The package name has been changed to `huna-for-huna`, and the original hosted Site ID has been removed from the export.

## Included features

- Visitor homepage with apartment filters, detail dialogs, device-local shortlist, neighbourhood sections, and FAQs.
- Management dashboard for properties, tenant rent records, manual payment receipts, maintenance, expenses, and CSV financial exports.
- Tenant portal and messages, with data refreshed every 15 seconds.
- Document uploads and permission-checked downloads using an R2 binding.
- Owner, manager, accountant, and tenant roles with server-side permission checks.
- Offline property-visit snapshots. Tenant and financial records are not included in the offline snapshot.

Listings and photographs are illustrative, not verified inventory. SMS, email delivery, and M-Pesa processing are **not connected**. This ZIP contains no production database records, uploaded tenant documents, credentials, Git history, `node_modules`, or build artifacts.

## Technology

React + TypeScript, Vinext/Vite, Cloudflare Workers, D1, R2, Drizzle migrations, and Lucide icons. This is a full-stack application, not a standalone HTML file or a GitHub Pages site.

## Run locally

Use Node.js 22.13.0 or newer and npm. Run commands from the extracted `huna-for-huna` folder.

```sh
npm run install:ci
npm run build
```

For a new local database, apply the included migrations once, in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_worried_omega_flight.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_kind_monster_badoon.sql
npm run dev
```

Open the URL printed by the development server (normally `http://localhost:5173`). The clean export defaults to the portable development profile.

- `/` — visitor homepage.
- `/dashboard` — management dashboard, sign-in required.
- `/dashboard?portal=tenant` — tenant view.
- `/offline.html` — device-local property visit list.

The portable development server provides a **local-only simulated sign-in** at `/signin-with-chatgpt?return_to=/dashboard`, using the starter's local test account. It is not production authentication. Open the dashboard and choose **Start with sample data** if you want the illustrative records saved in your local database. Preview-only changes made before that are not saved.

`npm start` previews a built Worker locally; it does not simulate sign-in or deploy the app.

## Put this project on GitHub

Extract this ZIP first. Create an empty repository in your GitHub account, then either add the extracted folder using GitHub Desktop or run:

```sh
git init
git add .
git commit -m "Initial Huna for Huna website and dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/huna-for-huna.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. Upload the project files, not the ZIP itself, so GitHub can display and track the source. The included `.gitignore` excludes dependencies, local databases, build output, and environment secrets.

## Hosting outside the original Sites environment

Pushing to GitHub stores the code; it does not deploy the application.

The existing backend is designed for Cloudflare Worker bindings named `DB` (D1) and `BUCKET` (R2). A deployment elsewhere needs provisioned storage, the included migrations applied to that environment, and appropriate runtime configuration. The generated local Wrangler configuration contains placeholder storage identities; do not use those as production resource IDs.

Production authentication currently depends on the original Sites gateway: it validates sign-in and injects trusted identity headers read by `app/chatgpt-auth.ts`. Before deploying independently, replace that integration with verified server-side authentication and adapt the sign-in/sign-out routes. Never trust public requests that merely supply those headers. The initial workspace owner is assigned on the first authenticated workspace request; replace this with explicit owner provisioning for any public independent deployment.

Review `app/chatgpt-auth.ts`, `lib/server.ts`, `app/api/`, `vite.config.ts`, `worker/index.ts`, and `.openai/hosting.json` when configuring a different host. The original deployed website is unaffected by this export.

## Main files

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Visitor-facing homepage and sample apartment collection |
| `app/home.css` | Homepage styling and mobile layouts |
| `app/dashboard/` | Protected dashboard route and interactive workspace |
| `app/globals.css` | Shared and dashboard styles |
| `app/api/workspace/route.ts` | Workspace read/write API |
| `app/api/documents/route.ts` | Private document API |
| `lib/server.ts` | Workspace identity, database, and permission helpers |
| `lib/seed.ts` | Illustrative property/tenant data and default permissions |
| `db/schema.ts`, `drizzle/` | Database schema and migrations |
| `public/` | Photos, offline page, and service worker |
| `docs/STARTER-REFERENCE.md` | Original framework/runtime reference |
| `docs/ASSETS.md` | Image source references |

## Validation

The application passed TypeScript and production build checks before export. The export archive was checked for integrity and excluded local runtime/private files. Visual browser QA and a fresh dependency installation on a separate user's machine were not performed.
