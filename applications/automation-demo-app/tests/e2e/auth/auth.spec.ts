import { test, expect } from '../../base-test';
import { LoginPage } from '../../../pages/LoginPage.js';
import { appConfig } from '../../../app.config.js';
import { demoAdapter } from '../../../adapter/index.js';
import tags from '../../helpers/tags.js';
import { applyAllureMeta } from '../../helpers/allure-meta.js';

test.describe('[@auth] Authentication', () => {
  test(
    '[@AUTH01] Successful login',
    { tag: tags.auth['AUTH01'].tags },
    async ({ page }) => {
      await applyAllureMeta({
        testId: 'AUTH01',
        module: 'auth',
        user: 'userLogin',
        tags: tags.auth['AUTH01'].tags,
      });
      const loginPage = new LoginPage(page, appConfig.baseURL);
      const user = appConfig.users.find((u) => u.id === 'user1')!;
      const credentials = demoAdapter.resolveCredentials(user);

      await loginPage.open();
      await loginPage.loginAndExpectApp(credentials.email, credentials.password);
      await expect(page).toHaveURL(/\/items/);
    },
  );

  test(
    '[@AUTH02] Invalid credentials',
    { tag: tags.auth['AUTH02'].tags },
    async ({ page }) => {
      await applyAllureMeta({
        testId: 'AUTH02',
        module: 'auth',
        user: 'userLogin',
        tags: tags.auth['AUTH02'].tags,
      });
      const loginPage = new LoginPage(page, appConfig.baseURL);
      await loginPage.open();
      await loginPage.login('bad@example.com', 'wrong-password');
      await loginPage.expectLoginError();
      await expect(page).toHaveURL(/\/login/);
    },
  );

  test(
    '[@AUTH03] Unauthenticated access redirect',
    { tag: tags.auth['AUTH03'].tags },
    async ({ page }) => {
      await applyAllureMeta({
        testId: 'AUTH03',
        module: 'auth',
        user: 'userLogin',
        tags: tags.auth['AUTH03'].tags,
      });
      await page.goto(`${appConfig.baseURL}/items`);
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByTestId('login-form')).toBeVisible();
    },
  );

  test(
    '[@AUTH04] Session persistence with storage state',
    { tag: tags.auth['AUTH04'].tags },
    async ({ page }) => {
      await applyAllureMeta({
        testId: 'AUTH04',
        module: 'auth',
        user: 'user1',
        tags: tags.auth['AUTH04'].tags,
      });
      await page.goto(`${appConfig.baseURL}/items`);
      await expect(page.getByTestId('app-shell')).toBeVisible();
      await page.reload();
      await expect(page.getByTestId('app-shell')).toBeVisible();
      await expect(page).toHaveURL(/\/items/);
    },
  );

  test(
    '[@AUTH05] Expired session redirects to login',
    { tag: tags.auth['AUTH05'].tags },
    async ({ page }) => {
      await applyAllureMeta({
        testId: 'AUTH05',
        module: 'auth',
        user: 'user1',
        tags: tags.auth['AUTH05'].tags,
      });
      await page.goto(`${appConfig.baseURL}/items`);
      await expect(page.getByTestId('app-shell')).toBeVisible();
      await page.getByTestId('expire-session').click();
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByTestId('login-form')).toBeVisible();
    },
  );
});
