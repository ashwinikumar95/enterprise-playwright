export { validateAppConfig, ConfigValidationError } from './config/validateAppConfig.js';
export {
  resolveEnvironment,
  getActiveEnvironmentId,
} from './config/resolveEnvironment.js';
export type { ResolveEnvironmentInput } from './config/resolveEnvironment.js';
export { buildPlaywrightConfig } from './config/buildPlaywrightConfig.js';

export { NormalAuthProvider, fillSecretInput } from './auth/normalLogin.js';
export type { NormalLoginSelectors } from './auth/normalLogin.js';
export { AuthManager } from './auth/authManager.js';

export {
  loadCsvFile,
  loadCsvData,
  getDataForTestCase,
} from './data/csvLoader.js';
export type { CsvRow, CsvLoaderOptions } from './data/csvLoader.js';

export {
  generateTagsJson,
  validateTagsAgainstSpecs,
} from './tags/generateTags.js';
export type {
  TagEntry,
  TagsCatalog,
  GenerateTagsOptions,
  ValidateTagsOptions,
} from './tags/generateTags.js';

export { BasePage } from './pages/BasePage.js';
export { SelectorPackRegistry } from './ui/selectorPack.js';
export { createBaseTest } from './fixtures/createBaseTest.js';
export type { FrameworkFixtures } from './fixtures/createBaseTest.js';
export { buildAllureLabels } from './allure/metadata.js';
