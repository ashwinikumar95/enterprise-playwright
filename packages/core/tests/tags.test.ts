import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { AppConfig } from '@enterprise-playwright/shared-types';
import { generateTagsJson } from '../src/tags/generateTags.js';

const tmpDirs: string[] = [];

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('generateTagsJson', () => {
  it('emits user and suite tags for active env', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'epw-tags-'));
    tmpDirs.push(root);
    const dataDir = path.join(root, 'tests', 'data');
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(
      path.join(dataDir, 'tags.csv'),
      [
        'module,test_id,title,users,local_user,dev_user,qa_user,local,dev,qa,regression,data_dependent',
        'sampleItems,TC01,Items create,@user1,@user1,@user1,@user1,@smoke,@smoke,@smoke,@regression,No',
      ].join('\n'),
      'utf8',
    );

    const config: AppConfig = {
      productName: 'demo',
      baseURL: 'http://localhost:3000',
      defaultEnvironment: 'local',
      environments: [
        {
          id: 'local',
          dataDir: 'data/local',
          hostMarkers: ['localhost'],
          tagUserColumn: 'local_user',
          tagSuiteColumn: 'local',
        },
      ],
      users: [],
      auth: { defaultProvider: 'normal' },
      tags: {
        csvPath: 'tests/data/tags.csv',
        jsonPath: 'tests/data/tags.json',
        envColumnMap: { local: 'local' },
        regressionColumn: 'regression',
        userColumns: { local: 'local_user' },
      },
      ui: { packs: ['default'], defaultLayout: 'default' },
      execution: {
        local: { workers: 2, retries: 0 },
        ci: { workersFrom: 'CI_WORKERS', workersDefault: 2, retries: 2 },
      },
      artifacts: {
        trace: 'retain-on-first-failure',
        screenshot: 'only-on-failure',
        video: 'off',
      },
      reporting: {
        allure: { resultsDir: 'allure-results', reportDir: 'allure-report' },
      },
      appRoot: root,
      testDir: path.join(root, 'tests'),
    };

    const catalog = generateTagsJson(config, { force: true });
    expect(catalog.sampleItems.TC01.tags).toEqual(
      expect.arrayContaining(['@user1', '@smoke', '@regression']),
    );
  });
});
