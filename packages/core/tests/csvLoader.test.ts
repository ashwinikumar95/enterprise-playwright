import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { getDataForTestCase, loadCsvData } from '../src/data/csvLoader.js';

const tmpDirs: string[] = [];

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('csvLoader', () => {
  it('loads CSV rows with headers', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'epw-csv-'));
    tmpDirs.push(dir);
    fs.writeFileSync(
      path.join(dir, 'TC01.csv'),
      'testId,name,description,status,tags\nTC01,Alpha,Desc,Active,smoke\n',
      'utf8',
    );
    const rows = loadCsvData('TC01.csv', { dataRoot: dir });
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('Alpha');
  });

  it('getDataForTestCase throws when missing', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'epw-csv-'));
    tmpDirs.push(dir);
    expect(() => getDataForTestCase('missing.csv', 'TC01', { dataRoot: dir })).toThrow(
      /No CSV data/,
    );
  });
});
