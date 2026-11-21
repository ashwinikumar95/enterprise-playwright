import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

export type CsvRow = Record<string, string>;

export interface CsvLoaderOptions {
  /** Absolute directory that contains env data folders / files. */
  dataRoot: string;
}

function stripBomKey(key: string): string {
  return key.replace(/^\uFEFF/, '');
}

export function loadCsvFile(filePath: string): CsvRow[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as Record<string, string>[];

  return rows.map((row) => {
    const next: CsvRow = {};
    for (const [k, v] of Object.entries(row)) {
      next[stripBomKey(k)] = v ?? '';
    }
    return next;
  });
}

/**
 * Resolve a data file under dataRoot. Tries dataRoot/filename first.
 */
export function loadCsvData(filename: string, options: CsvLoaderOptions): CsvRow[] {
  const filePath = path.isAbsolute(filename)
    ? filename
    : path.join(options.dataRoot, filename);
  return loadCsvFile(filePath);
}

/**
 * Load a test-case CSV. If filename has no extension, appends `.csv`.
 * Returns all rows in the file (file stem is the case).
 */
export function getDataForTestCase(
  filename: string,
  _testCaseId: string,
  options: CsvLoaderOptions,
): CsvRow[] {
  const withExt = filename.includes('.') ? filename : `${filename}.csv`;
  const rows = loadCsvData(withExt, options);
  if (rows.length === 0) {
    throw new Error(
      `No CSV data found for ${withExt} under ${options.dataRoot}`,
    );
  }
  return rows;
}
