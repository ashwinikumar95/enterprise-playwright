import type { Page } from '@playwright/test';

/** Opaque layout / selector-pack mode name (demo uses "default"). */
export type LayoutMode = string;

export interface SelectorPack {
  name: LayoutMode;
  selectors: Record<string, string>;
}

export interface EnvironmentDefinition {
  id: string;
  dataDir: string;
  hostMarkers: string[];
  tagUserColumn: string;
  tagSuiteColumn: string;
}

export interface UserProjectDefinition {
  id: string;
  projectName: string;
  tag: string;
  workers: number;
  /** Absolute or repo-relative path; null for login-only projects. */
  storageStatePath: string | null;
  loginOnly: boolean;
  setupFile?: string;
  emailEnvKeys?: string[];
  passwordEnvKeys?: string[];
}

export interface AuthCredentials {
  email: string;
  password: string;
  userId: string;
  baseUrl: string;
}

export interface AuthConfig {
  provider: 'normal';
  credentials: AuthCredentials;
  storageStatePath: string;
}

export interface AuthResult {
  success: boolean;
  storageStatePath?: string;
  error?: string;
}

export interface AuthProvider {
  readonly name: string;
  login(page: Page, credentials: AuthCredentials): Promise<void>;
}

export interface AllureReportingConfig {
  resultsDir: string;
  reportDir: string;
}

export interface ArtifactsConfig {
  trace: 'on' | 'off' | 'retain-on-failure' | 'retain-on-first-failure' | 'on-first-retry';
  screenshot: 'on' | 'off' | 'only-on-failure';
  video: 'on' | 'off' | 'retain-on-failure';
}

export interface ExecutionProfile {
  workers: number;
  retries: number;
}

export interface ExecutionConfig {
  local: ExecutionProfile;
  ci: {
    workersFrom: string;
    workersDefault: number;
    retries: number;
  };
}

export interface TagsConfig {
  csvPath: string;
  jsonPath: string;
  /** Maps resolved env id → suite column name in tags.csv */
  envColumnMap: Record<string, string>;
  /** Separate regression suite column (e.g. "regression"). */
  regressionColumn: string;
  /** Maps env id → user column name (e.g. local → local_user). */
  userColumns: Record<string, string>;
  fallbackUserColumn?: string;
}

export interface UiConfig {
  packs: LayoutMode[];
  defaultLayout: LayoutMode;
}

export interface AllureMetadata {
  testId?: string;
  application: string;
  environment: string;
  module?: string;
  suite?: string;
  feature?: string;
  user?: string;
  tags?: string[];
}

/**
 * Application adapter hooks — keep product-specific wait/session logic here, not in core.
 */
export interface AppAdapter {
  isAuthUrl(url: string): boolean;
  waitForAppShell(page: Page, timeoutMs?: number): Promise<void>;
  resolveCredentials(user: UserProjectDefinition): AuthCredentials;
}

export interface AppConfig {
  productName: string;
  baseURL: string;
  defaultEnvironment: string;
  environments: EnvironmentDefinition[];
  users: UserProjectDefinition[];
  auth: {
    defaultProvider: 'normal';
  };
  tags: TagsConfig;
  ui: UiConfig;
  execution: ExecutionConfig;
  artifacts: ArtifactsConfig;
  reporting: {
    allure: AllureReportingConfig;
  };
  /** Root used to resolve relative storageState and data paths. */
  appRoot: string;
  testDir: string;
}
