# Onboarding a new application

Add a new app under `applications/<product>/` without modifying `@enterprise-playwright/core`.

## Steps

1. Copy `applications/automation-demo-app` as a starting point (or create an empty package).
2. Fill `app.config.ts`:
   - `productName`, `baseURL`
   - `environments` (ids, `dataDir`, host markers, tag columns)
   - `users` (tags, workers, explicit `storageStatePath`, setup files, login-only flag)
   - `tags` paths and column maps
   - `reporting.allure.resultsDir` / `reportDir`
3. Implement an `AppAdapter`:
   - `isAuthUrl`
   - `waitForAppShell`
   - `resolveCredentials`
4. Register a selector pack (`default` is enough).
5. Add page objects under `pages/` for your product screens.
6. Add `tests/data/tags.csv`, env CSV data folders, auth setup specs, and e2e specs.
7. Point `playwright.config.ts` at `buildPlaywrightConfig(appConfig, adapter)`.
8. Wire package scripts for test, validate:tags, and Allure.

## Do not change core for a normal onboard

Core already provides config validation, env resolution, normal auth + storageState, CSV loading, tags, BasePage, selector-pack registry, and Allure wiring.
