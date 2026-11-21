# enterprise-playwright

Reusable, application-agnostic Playwright automation framework (Milestone 1).

## Packages

| Package | Path | Role |
|---------|------|------|
| `@enterprise-playwright/shared-types` | `packages/shared-types` | Shared contracts |
| `@enterprise-playwright/core` | `packages/core` | Config, auth, CSV, tags, BasePage, Allure wiring |
| `@enterprise-playwright/automation-demo-app` | `applications/automation-demo-app` | Demo React app + adapter + e2e |

## Prerequisites

- Node `>=20.19`
- pnpm `>=9`
- Playwright browsers (`pnpm exec playwright install chromium`)
- Allure CLI via `allure-commandline@2.32.0` (pulled by scripts / npx)
- Java 17+ on `PATH` / `JAVA_HOME` for `pnpm allure:generate` (CI installs Temurin 17)

## Quick start

```bash
pnpm install
pnpm --filter @enterprise-playwright/shared-types build
pnpm --filter @enterprise-playwright/core build
pnpm exec playwright install chromium

# Terminal 1 — demo web
pnpm web:demo

# Terminal 2 — unit + smoke e2e
pnpm test:unit
pnpm validate:tags
pnpm test:demo:smoke
```

## Allure reporting (only M1 reporter)

```bash
pnpm allure:clean      # wipe allure-results + allure-report
pnpm test:demo:smoke   # writes allure-results
pnpm allure:generate   # HTML into allure-report
pnpm allure:open       # open HTML locally
```

Never commit secrets or `playwright/.auth/*.json`. Allure must not receive raw storage-state files.

## Architecture

- **Core** — framework capabilities only
- **Application adapter + config** — product login waits, credentials, envs, tags, selectors
- **Tests** — live under each application
- **Reporting** — `allure-playwright` only

See [applications/automation-demo-app/ONBOARDING.md](applications/automation-demo-app/ONBOARDING.md) to add another app without changing core.

## Demo credentials (local only)

| User | Email | Password |
|------|-------|----------|
| user1 | `demo.user1@example.com` | `Password123!` |
| user2 | `demo.user2@example.com` | `Password123!` |

Override with env vars from `.env.example`. Default `BASE_URL` is `http://127.0.0.1:3000`.

## Local Allure note

`allure-results/` are written on every Playwright run without Java. Generating HTML (`pnpm allure:generate`) requires a local Java 17+ install. GitHub Actions installs Java before report generation.
