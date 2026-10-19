import { test, expect, TestDataFactory } from '../../fixtures/test-fixtures';

/**
 * Lean smoke suite for CI: home page, registration, login, overview, and API check.
 * Selected via the `@smoke` tag / smoke project.
 * Avoids shared john/demo for API smoke — uses a freshly registered user instead.
 */
test.describe('Smoke', () => {
  test('home page loads with login form', { tag: '@smoke' }, async ({ page, loginPage }) => {
    await loginPage.goto();
    await expect(page).toHaveTitle(/ParaBank/i);
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test(
    'register, view accounts, and logout',
    { tag: '@smoke' },
    async ({ registrationPage, accountsPage, loginPage }) => {
      const user = TestDataFactory.createUser();
      await registrationPage.goto();
      await registrationPage.register(user);
      await registrationPage.expectSuccessfulRegistration(user.username);
      await accountsPage.gotoOverview();
      await accountsPage.expectAccountTableVisible();
      await loginPage.logout();
    },
  );

  test(
    'API login and account list for a registered user',
    { tag: '@smoke' },
    async ({ registrationPage, apiClient }) => {
      const user = TestDataFactory.createUser();
      await registrationPage.goto();
      await registrationPage.register(user);
      await registrationPage.expectSuccessfulRegistration(user.username);

      const { response, customer } = await apiClient.login(user.username, user.password);
      expect(response.status(), 'API login for newly registered user should succeed').toBe(200);
      expect(customer.id).toBeGreaterThan(0);

      const accounts = await apiClient.getAccounts(customer.id);
      expect(accounts.response.status()).toBe(200);
      expect(accounts.accounts.length).toBeGreaterThan(0);
    },
  );
});
