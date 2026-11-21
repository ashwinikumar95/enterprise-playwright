/**
 * Allure metadata for M1 uses:
 * - Playwright `{ tag: ... }` (picked up by allure-playwright)
 * - reporter `environmentInfo` from buildPlaywrightConfig (application, environment, baseURL)
 * - automatic screenshot/trace attachments from Playwright artifact settings
 *
 * Custom allure-js-commons label calls are deferred until a compatible runtime
 * bridge is required (keeps M1 reporting simple).
 */
export async function applyAllureMeta(_input: {
  testId: string;
  module: string;
  suite?: string;
  feature?: string;
  user?: string;
  tags?: string[];
}): Promise<void> {
  // intentional no-op in M1
}
