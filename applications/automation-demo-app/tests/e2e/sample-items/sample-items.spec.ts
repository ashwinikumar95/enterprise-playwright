import path from 'node:path';
import { getDataForTestCase, resolveEnvironment } from '@enterprise-playwright/core';
import { test, expect } from '../../base-test';
import { ItemsPage } from '../../../pages/ItemsPage.js';
import { appConfig } from '../../../app.config.js';
import tags from '../../helpers/tags.js';
import { applyAllureMeta } from '../../helpers/allure-meta.js';

test.describe('[@sample-items] Items Tests - Parallel', () => {
  test(
    '[@TC01] Items create and edit workflow',
    { tag: tags.sampleItems['TC01'].tags },
    async ({ page }) => {
      await applyAllureMeta({
        testId: 'TC01',
        module: 'sampleItems',
        feature: 'Items',
        user: 'user1',
        tags: tags.sampleItems['TC01'].tags,
      });

      const env = resolveEnvironment(appConfig);
      const dataRoot = path.join(appConfig.appRoot, env.dataDir);
      const itemsPage = new ItemsPage(page, appConfig.baseURL);
      const rows = getDataForTestCase('TC01.csv', 'TC01', { dataRoot });

      for (let i = 0; i < rows.length; i++) {
        const testData = rows[i];
        const uniqueName = `${testData.name}-${Date.now()}-${i}`;
        const updatedDescription = `${testData.description} (updated)`;
        console.log(`TC01: Processing ${uniqueName}`);

        await itemsPage.navigate('/items');
        await itemsPage.expectItemsScreen();
        await itemsPage.openViaSidebar();
        await itemsPage.expectItemsScreen();

        await itemsPage.clickCreateItem();
        await itemsPage.fillItemForm(uniqueName, testData.description);
        await itemsPage.saveItem();
        await itemsPage.expectSuccessToast(/Item created/i);
        await itemsPage.expectRow(uniqueName, testData.status || 'Active');

        await itemsPage.openEditForRow(uniqueName);
        await itemsPage.updateDescription(updatedDescription);
        await itemsPage.expectSuccessToast(/Item updated/i);
        await itemsPage.expectDescription(uniqueName, updatedDescription);
        console.log(`TC01: Completed ${uniqueName}`);
      }

      expect(rows.length).toBeGreaterThan(0);
    },
  );
});
