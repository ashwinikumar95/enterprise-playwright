import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { defineConfig } from '@playwright/test';
import { buildPlaywrightConfig, generateTagsJson } from '@enterprise-playwright/core';
import { appConfig } from './app.config.js';
import { demoAdapter } from './adapter/index.js';

const appRoot = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(appRoot, '.env') });

// Regenerate tags before specs import tags.json
generateTagsJson(appConfig, { force: true });

const built = buildPlaywrightConfig(appConfig, demoAdapter);

export default defineConfig(built);
