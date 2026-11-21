import { test, expect } from '../../base-test';
import { LoginPage } from '../../../pages/LoginPage.js';
import { appConfig } from '../../../app.config.js';
import tags from '../../helpers/tags.js';
import { applyAllureMeta } from '../../helpers/allure-meta.js';

test.describe('[@login-logout] Login screen', () => {
  test(
    '[@LOGIN01] Login screen reachable without storage state',
    { tag: tags.loginLogout['LOGIN01'].tags },
    async ({ page }) => {
      await applyAllureMeta({
        testId: 'LOGIN01',
        module: 'loginLogout',
        user: 'userLogin',
        tags: tags.loginLogout['LOGIN01'].tags,
      });
      const loginPage = new LoginPage(page, appConfig.baseURL);
      await loginPage.open();
      await loginPage.expectLoginFormVisible();
      await expect(page.getByTestId('app-shell')).toHaveCount(0);
    },
  );
});
