import path from 'node:path';
import { validateTagsAgainstSpecs } from '@enterprise-playwright/core';
import { appConfig } from '../app.config.js';

validateTagsAgainstSpecs(appConfig, {
  specRoots: [path.join(appConfig.appRoot, 'tests', 'e2e')],
});
console.log('Tag validation passed');
