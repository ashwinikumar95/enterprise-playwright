import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const appRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const resultsDir = path.join(appRoot, 'allure-results');
const reportDir = path.join(appRoot, 'allure-report');

if (!fs.existsSync(resultsDir) || fs.readdirSync(resultsDir).length === 0) {
  console.error(
    `Allure results missing or empty at ${resultsDir}. Skipping HTML generation.`,
  );
  process.exit(0);
}

const javaCheck = spawnSync('java', ['-version'], { shell: true });
if (javaCheck.error || javaCheck.status !== 0) {
  console.error(
    'Java is required for Allure HTML generation. Install Java 17+ and set JAVA_HOME, or rely on CI (setup-java).',
  );
  console.error(`Allure results are available at ${resultsDir}`);
  process.exit(1);
}

const result = spawnSync(
  'npx',
  ['--yes', 'allure-commandline@2.32.0', 'generate', resultsDir, '-o', reportDir, '--clean'],
  { cwd: appRoot, stdio: 'inherit', shell: true },
);

if (result.status !== 0) {
  console.error('Allure generate failed');
  process.exit(result.status ?? 1);
}

console.log(`Allure HTML report written to ${reportDir}`);
