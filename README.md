# enterprise-playwright

Reusable Playwright automation framework (Milestone 2.1) with shared contracts, a product-agnostic core, and independent application adapters. Two demo products — Automation Demo and Support Desk — prove that apps can onboard without changing core.

## Repository structure

| Path | Package | Responsibility |
|------|---------|----------------|
| `packages/shared-types` | `@enterprise-playwright/shared-types` | Shared contracts (`AppConfig`, adapters, auth, reporting types) |
| `packages/core` | `@enterprise-playwright/core` | Config validation, env resolution, auth, CSV/tags, BasePage, Allure wiring |
| `applications/automation-demo-app` | `@enterprise-playwright/automation-demo-app` | React demo app, adapter, pages, data, and e2e suites |
| `applications/support-desk-demo` | `@enterprise-playwright/support-desk-demo` | Vanilla Support Desk demo, adapter, pages, data, and e2e suites |

Each application owns its `app.config.ts`, adapter, page objects, test data, and Playwright projects. Core stays product-agnostic.

## Prerequisites

- Node.js `>=20.19`
- pnpm `>=9`
- Chromium (via Playwright browser install)
- Java 17+ on `PATH` / `JAVA_HOME` — only for Allure HTML generation
- Git

## First-time installation

```bash
pnpm install
pnpm --filter @enterprise-playwright/shared-types build
pnpm --filter @enterprise-playwright/core build
pnpm --filter @enterprise-playwright/automation-demo-app exec playwright install chromium
```

Chromium is shared for both demo apps. On Linux CI, use `playwright install --with-deps chromium` instead.

## Five-minute demo

Start each web app in its **own terminal** before running that product’s smoke suite. Playwright does **not** auto-start apps via `webServer`. Ports **3000** and **3100** must be free.

### Automation Demo — http://127.0.0.1:3000

```bash
# Terminal 1
pnpm demo:web:dev

# Terminal 2
pnpm demo:test:smoke
pnpm demo:allure:generate
pnpm demo:allure:open
```

### Support Desk — http://127.0.0.1:3100

```bash
# Terminal 1
pnpm support-desk:web:dev

# Terminal 2
pnpm support-desk:test:smoke
pnpm support-desk:allure:generate
pnpm support-desk:allure:open
```

## Local demo credentials

**Local-demo-only.** Hardcoded demo defaults for local runs — not production credentials. Override via environment variables documented in each app’s `.env.example`.

### Automation Demo

| User | Email | Password |
|------|-------|----------|
| user1 | `demo.user1@example.com` | `Password123!` |
| user2 | `demo.user2@example.com` | `Password123!` |

See [applications/automation-demo-app/.env.example](applications/automation-demo-app/.env.example).

### Support Desk

| User | Email | Password |
|------|-------|----------|
| agent | `agent@example.com` | `Password123!` |

See [applications/support-desk-demo/.env.example](applications/support-desk-demo/.env.example).

## Allure reporting

- Each application writes its own `allure-results/` and `allure-report/` under its app directory.
- Raw results are produced by Playwright without Java; HTML generation needs Java 17+.
- Root aliases `pnpm allure:*` target **Automation Demo only**.
- Support Desk uses `pnpm support-desk:allure:generate` / `pnpm support-desk:allure:open`.

Never commit secrets, `playwright/.auth/*.json`, or generated Allure / test artifacts.

## Product onboarding

Add a new application under `applications/<product>/` without modifying core:

1. `app.config.ts` — product name, base URL, environments, users, tags, Allure dirs
2. Product adapter — `isAuthUrl`, `waitForAppShell`, `resolveCredentials`
3. Product-specific pages and selector packs
4. Product-specific test data (`tags.csv`, env CSV folders)
5. Product-specific auth setup and e2e suites wired through `buildPlaywrightConfig`

Full checklist: [applications/automation-demo-app/ONBOARDING.md](applications/automation-demo-app/ONBOARDING.md).

## Architecture principles

- **Core** — reusable framework capabilities only (config, auth, data, tags, BasePage, Allure).
- **Application layer** — product login waits, credentials, selectors, pages, fixtures, and tests.
- **Reporting** — `allure-playwright` only; no raw storage-state files in Allure.

## Important notes

- Apps do not auto-start through Playwright `webServer`; start `*:web:dev` yourself.
- Ports `3000` (Automation Demo) and `3100` (Support Desk) must be available.
- Do not commit storage-state, credentials, secrets, or generated test artifacts.
- Java is required only for Allure HTML generation, not for running tests.
