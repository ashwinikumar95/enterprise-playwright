/**
 * Allure metadata follows the automation-demo-app M1 pattern:
 * - Playwright `{ tag: ... }` (picked up by allure-playwright)
 * - reporter `environmentInfo` from buildPlaywrightConfig
 * - automatic screenshot/trace attachments from Playwright artifact settings
 */
export async function applyAllureMeta(_input: {
  testId: string;
  module: string;
  suite?: string;
  feature?: string;
  user?: string;
  tags?: string[];
}): Promise<void> {
  // intentional no-op — same contract as the React demo
}
