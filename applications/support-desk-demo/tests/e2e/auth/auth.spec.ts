import { test, expect } from '../../base-test.js';
import { appConfig } from '../../../app.config.js';
import { supportDeskAdapter } from '../../../adapter/index.js';
import tags from '../../helpers/tags.js';
import { applyAllureMeta } from '../../helpers/allure-meta.js';

test.describe('[@auth] Authentication', () => {
  test(
    '[@AUTH01] Valid login succeeds',
    { tag: tags.auth['AUTH01'].tags },
    async ({ signInPage, page }) => {
      await applyAllureMeta({
        testId: 'AUTH01',
        module: 'auth',
        user: 'login',
        tags: tags.auth['AUTH01'].tags,
      });

      const agent = appConfig.users.find((u) => u.id === 'agent')!;
      const credentials = supportDeskAdapter.resolveCredentials(agent);

      await signInPage.open();
      await signInPage.expectSignInFormVisible();
      await signInPage.loginAndExpectSuccess(credentials.email, credentials.password);
      await expect(page).toHaveURL(/\/tickets(\/|\?|$)/);
    },
  );

  test(
    '[@AUTH02] Invalid login displays error',
    { tag: tags.auth['AUTH02'].tags },
    async ({ signInPage, page }) => {
      await applyAllureMeta({
        testId: 'AUTH02',
        module: 'auth',
        user: 'login',
        tags: tags.auth['AUTH02'].tags,
      });

      await signInPage.open();
      await signInPage.login('bad@example.com', 'wrong-password');
      await signInPage.expectLoginError(/invalid username or password/i);
      await expect(page).toHaveURL(/\/signin(\/|\?|$)/);
      await signInPage.expectSignInFormVisible();
    },
  );

  test(
    '[@AUTH03] Authenticated storage state opens tickets',
    { tag: tags.auth['AUTH03'].tags },
    async ({ ticketsPage, page }) => {
      await applyAllureMeta({
        testId: 'AUTH03',
        module: 'auth',
        user: 'agent',
        tags: tags.auth['AUTH03'].tags,
      });

      await ticketsPage.open();
      await expect(page.getByTestId('desk-shell')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Tickets' })).toBeVisible();
      await expect(page).not.toHaveURL(/\/signin/);
    },
  );

  test(
    '[@AUTH04] Session survives page reload',
    { tag: tags.auth['AUTH04'].tags },
    async ({ ticketsPage, page }) => {
      await applyAllureMeta({
        testId: 'AUTH04',
        module: 'auth',
        user: 'agent',
        tags: tags.auth['AUTH04'].tags,
      });

      await ticketsPage.open();
      await page.reload();
      await ticketsPage.expectTicketsScreen();
      await expect(page.getByTestId('desk-shell')).toBeVisible();
      await expect(page).not.toHaveURL(/\/signin/);
    },
  );
});
