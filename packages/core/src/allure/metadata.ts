import type { AllureMetadata } from '@enterprise-playwright/shared-types';

/**
 * Lightweight helpers for Allure labels. Prefer automatic allure-playwright
 * attachments; use these only to stamp metadata.
 *
 * Callers should import `allure` from 'allure-js-commons' in the app package
 * when available; this module stays free of hard runtime coupling beyond types.
 */
export function buildAllureLabels(meta: AllureMetadata): Array<{ name: string; value: string }> {
  const labels: Array<{ name: string; value: string }> = [
    { name: 'application', value: meta.application },
    { name: 'environment', value: meta.environment },
  ];
  if (meta.testId) labels.push({ name: 'AS_ID', value: meta.testId });
  if (meta.module) labels.push({ name: 'module', value: meta.module });
  if (meta.suite) labels.push({ name: 'suite', value: meta.suite });
  if (meta.feature) labels.push({ name: 'feature', value: meta.feature });
  if (meta.user) labels.push({ name: 'user', value: meta.user });
  for (const tag of meta.tags ?? []) {
    labels.push({ name: 'tag', value: tag });
  }
  return labels;
}
