import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(new URL('.', import.meta.url)));
const appRoot = path.join(root, '..');
for (const dir of ['allure-results', 'allure-report']) {
  const full = path.join(appRoot, dir);
  fs.rmSync(full, { recursive: true, force: true });
  fs.mkdirSync(full, { recursive: true });
  console.log(`Cleaned ${dir}`);
}
