import type { AppConfig } from '@enterprise-playwright/shared-types';

export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

export function validateAppConfig(config: AppConfig): void {
  if (!config.productName?.trim()) {
    throw new ConfigValidationError('productName is required');
  }
  if (!config.baseURL?.trim()) {
    throw new ConfigValidationError('baseURL is required');
  }
  if (!config.environments?.length) {
    throw new ConfigValidationError('at least one environment is required');
  }
  if (!config.environments.some((e) => e.id === config.defaultEnvironment)) {
    throw new ConfigValidationError(
      `defaultEnvironment "${config.defaultEnvironment}" is not in environments registry`,
    );
  }

  const envIds = new Set<string>();
  for (const env of config.environments) {
    if (envIds.has(env.id)) {
      throw new ConfigValidationError(`duplicate environment id: ${env.id}`);
    }
    envIds.add(env.id);
    if (!env.dataDir?.trim()) {
      throw new ConfigValidationError(`environment ${env.id} is missing dataDir`);
    }
  }

  if (!config.users?.length) {
    throw new ConfigValidationError('at least one user project is required');
  }

  const storagePaths = new Set<string>();
  const projectNames = new Set<string>();
  for (const user of config.users) {
    if (projectNames.has(user.projectName)) {
      throw new ConfigValidationError(`duplicate projectName: ${user.projectName}`);
    }
    projectNames.add(user.projectName);

    if (user.workers < 1) {
      throw new ConfigValidationError(`user ${user.id} workers must be >= 1`);
    }

    if (user.loginOnly) {
      if (user.storageStatePath !== null) {
        throw new ConfigValidationError(
          `login-only user ${user.id} must have storageStatePath: null`,
        );
      }
    } else {
      if (!user.storageStatePath?.trim()) {
        throw new ConfigValidationError(
          `authenticated user ${user.id} requires storageStatePath`,
        );
      }
      if (storagePaths.has(user.storageStatePath)) {
        throw new ConfigValidationError(
          `storageStatePath must be unique; duplicate: ${user.storageStatePath}`,
        );
      }
      storagePaths.add(user.storageStatePath);
      if (!user.setupFile?.trim()) {
        throw new ConfigValidationError(
          `authenticated user ${user.id} requires setupFile`,
        );
      }
    }

    if (!user.tag.startsWith('@')) {
      throw new ConfigValidationError(`user ${user.id} tag must start with @`);
    }
  }

  if (config.execution.local.workers < 1 || config.execution.local.retries < 0) {
    throw new ConfigValidationError('invalid local execution workers/retries');
  }
  if (config.execution.ci.workersDefault < 1 || config.execution.ci.retries < 0) {
    throw new ConfigValidationError('invalid ci execution workers/retries');
  }

  if (!config.reporting?.allure?.resultsDir || !config.reporting?.allure?.reportDir) {
    throw new ConfigValidationError('reporting.allure.resultsDir and reportDir are required');
  }
}
