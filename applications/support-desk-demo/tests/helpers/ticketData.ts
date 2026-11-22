import path from 'node:path';
import { getDataForTestCase, resolveEnvironment } from '@enterprise-playwright/core';
import type { AppConfig } from '@enterprise-playwright/shared-types';
import type { TicketCategory } from '../../pages/NewTicketPage.js';

const VALID_CATEGORIES = new Set<TicketCategory>([
  'Account',
  'Billing',
  'Network',
  'Software',
  'Other',
]);

export interface TicketCsvRow {
  testId: string;
  subject: string;
  category: TicketCategory;
  description: string;
}

function isTicketCategory(value: string): value is TicketCategory {
  return VALID_CATEGORIES.has(value as TicketCategory);
}

/**
 * Load and validate ticket-creation CSV rows. Throws on missing/invalid fields —
 * malformed records are never skipped silently.
 */
export function loadTicketCsvRows(
  config: AppConfig,
  filename: string,
  testCaseId: string,
): TicketCsvRow[] {
  const env = resolveEnvironment(config);
  const dataRoot = path.join(config.appRoot, env.dataDir);
  const rows = getDataForTestCase(filename, testCaseId, { dataRoot });

  return rows.map((row, index) => {
    const testId = (row.testId ?? row.test_id ?? '').trim();
    const subject = (row.subject ?? '').trim();
    const category = (row.category ?? '').trim();
    const description = (row.description ?? '').trim();
    const label = `${filename} row ${index + 1}`;

    if (!testId) {
      throw new Error(`${label}: missing testId`);
    }
    if (testId !== testCaseId) {
      throw new Error(
        `${label}: expected testId "${testCaseId}" but found "${testId}"`,
      );
    }
    if (!subject) {
      throw new Error(`${label}: missing subject`);
    }
    if (!description) {
      throw new Error(`${label}: missing description`);
    }
    if (!isTicketCategory(category)) {
      throw new Error(
        `${label}: invalid category "${category}". Expected one of: ${[...VALID_CATEGORIES].join(', ')}`,
      );
    }

    return { testId, subject, category, description };
  });
}

/** Build a unique subject so parallel/repeated runs do not collide. */
export function uniqueTicketSubject(baseSubject: string, index: number): string {
  return `${baseSubject} [${Date.now()}-${index}]`;
}
