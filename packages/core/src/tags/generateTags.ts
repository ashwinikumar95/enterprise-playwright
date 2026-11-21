import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import type { AppConfig } from '@enterprise-playwright/shared-types';
import { resolveEnvironment } from '../config/resolveEnvironment.js';

export type TagEntry = { title: string; tags: string[] };
export type TagsCatalog = Record<string, Record<string, TagEntry>>;

export interface GenerateTagsOptions {
  force?: boolean;
}

function toAliases(moduleKey: string): string[] {
  const camel = moduleKey;
  const kebab = moduleKey.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  const snake = moduleKey.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  return Array.from(new Set([camel, kebab, snake, moduleKey.toLowerCase()]));
}

function isDefectTag(value: string): boolean {
  return /^@?MFC?-\d+$/i.test(value.trim());
}

export function generateTagsJson(
  config: AppConfig,
  options: GenerateTagsOptions = {},
): TagsCatalog {
  const env = resolveEnvironment(config);
  const csvPath = path.isAbsolute(config.tags.csvPath)
    ? config.tags.csvPath
    : path.join(config.appRoot, config.tags.csvPath);
  const jsonPath = path.isAbsolute(config.tags.jsonPath)
    ? config.tags.jsonPath
    : path.join(config.appRoot, config.tags.jsonPath);

  if (!fs.existsSync(csvPath)) {
    throw new Error(`tags.csv not found at ${csvPath}`);
  }

  const raw = fs.readFileSync(csvPath, 'utf8');
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as Record<string, string>[];

  const suiteCol =
    config.tags.envColumnMap[env.id] ?? env.tagSuiteColumn ?? env.id;
  const userCol =
    config.tags.userColumns[env.id] ??
    env.tagUserColumn ??
    config.tags.fallbackUserColumn ??
    'users';

  const catalog: TagsCatalog = {};
  const seenIds = new Set<string>();

  for (const row of rows) {
    const moduleKey = row.module?.trim();
    const testId = row.test_id?.trim();
    const title = row.title?.trim() ?? '';
    if (!moduleKey || !testId) {
      throw new Error('tags.csv row missing module or test_id');
    }
    if (seenIds.has(testId)) {
      throw new Error(`Duplicate test_id in tags.csv: ${testId}`);
    }
    seenIds.add(testId);

    const userTag = (row[userCol] || row.users || '').trim();
    let suiteTag = (row[suiteCol] || '').trim();
    if (suiteTag && (suiteTag === '@exclude' || isDefectTag(suiteTag))) {
      suiteTag = '';
    }

    const regressionRaw = (row[config.tags.regressionColumn] || '').trim();
    const tags: string[] = [];
    if (userTag) tags.push(userTag.startsWith('@') ? userTag : `@${userTag}`);
    if (suiteTag) tags.push(suiteTag.startsWith('@') ? suiteTag : `@${suiteTag}`);
    if (regressionRaw) {
      tags.push(regressionRaw.startsWith('@') ? regressionRaw : `@${regressionRaw}`);
    }

    const entry: TagEntry = { title, tags };
    for (const alias of toAliases(moduleKey)) {
      catalog[alias] ??= {};
      catalog[alias][testId] = entry;
    }
  }

  const cachePath = path.join(path.dirname(jsonPath), '.tags-generation.json');
  const csvMtime = fs.statSync(csvPath).mtimeMs;
  if (!options.force && fs.existsSync(jsonPath) && fs.existsSync(cachePath)) {
    try {
      const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as {
        env: string;
        csvMtimeMs: number;
      };
      if (cache.env === env.id && cache.csvMtimeMs === csvMtime) {
        return JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as TagsCatalog;
      }
    } catch {
      // regenerate
    }
  }

  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(catalog, null, 2), 'utf8');
  fs.writeFileSync(
    cachePath,
    JSON.stringify({ env: env.id, csvMtimeMs: csvMtime }, null, 2),
    'utf8',
  );
  return catalog;
}

export interface ValidateTagsOptions {
  specRoots: string[];
}

/**
 * Ensures every test('[@id]' in e2e specs has a tags.csv entry and uses tags.<module>['id'].tags.
 */
export function validateTagsAgainstSpecs(
  config: AppConfig,
  options: ValidateTagsOptions,
): void {
  const catalog = generateTagsJson(config, { force: true });
  const testIdPattern = /test\(\s*'\[@([^\]]+)\]/g;
  const tagUsagePattern =
    /\{\s*tag:\s*tags\.([A-Za-z0-9_]+)\[['\"]([^'\"]+)['\"]\]\.tags\s*\}/g;

  const errors: string[] = [];
  for (const root of options.specRoots) {
    if (!fs.existsSync(root)) continue;
    const files = walkSpecs(root);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const ids = [...content.matchAll(testIdPattern)].map((m) => m[1]);
      const usages = [...content.matchAll(tagUsagePattern)].map((m) => ({
        module: m[1],
        id: m[2],
      }));

      for (const id of ids) {
        const found = Object.values(catalog).some((mod) => mod[id]);
        if (!found) {
          errors.push(`${file}: test id [@${id}] missing from tags.csv`);
        }
        const usage = usages.find((u) => u.id === id);
        if (!usage) {
          errors.push(
            `${file}: [@${id}] must pass { tag: tags.<module>['${id}'].tags }`,
          );
        } else if (!catalog[usage.module]?.[id]) {
          errors.push(
            `${file}: tags.${usage.module}['${id}'] not found in generated catalog`,
          );
        }
      }
    }
  }

  if (errors.length) {
    throw new Error(`Tag validation failed:\n${errors.join('\n')}`);
  }
}

function walkSpecs(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkSpecs(full));
    else if (entry.name.endsWith('.spec.ts')) out.push(full);
  }
  return out;
}
