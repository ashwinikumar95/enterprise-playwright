
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve the application root from this script's location.
const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

for (const dir of ['allure-results', 'allure-report']) {
  const full = path.join(appRoot, dir);

  fs.rmSync(full, { recursive: true, force: true });
  fs.mkdirSync(full, { recursive: true });

  console.log(`Cleaned ${full}`);
}
