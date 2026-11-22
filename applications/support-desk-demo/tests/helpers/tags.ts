import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TagsCatalog } from '@enterprise-playwright/core';

const jsonPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'data',
  'tags.json',
);

const tags = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as TagsCatalog;
export default tags;
