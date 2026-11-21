#!/usr/bin/env node
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);

// Ensure `test` subcommand exists (Windows-friendly wrapper).
if (args.length === 0 || args[0]?.startsWith('-')) {
  args.unshift('test');
}

const playwrightCli = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  '..',
  'node_modules',
  '@playwright',
  'test',
  'cli.js',
);

// Prefer resolving from the app's local dependency tree via cwd.
let cliPath = playwrightCli;
try {
  cliPath = require.resolve('@playwright/test/cli.js', {
    paths: [process.cwd(), path.dirname(fileURLToPath(import.meta.url))],
  });
} catch {
  // fall back to workspace-relative guess
}

process.argv = [process.argv[0], cliPath, ...args];
await import(cliPath);
