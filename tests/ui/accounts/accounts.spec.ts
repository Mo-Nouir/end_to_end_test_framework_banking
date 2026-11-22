import { test, expect } from '../../../fixtures/test-fixtures';

test.describe('Accounts', () => {
  test('shows account overview for a registered user', async ({
    registeredUser: _registeredUser,
    accountsPage,
  }) => {
    await accountsPage.gotoOverview();
    await accountsPage.expectAccountTableVisible();
  });

  test('opens account details from the overview', async ({
    registeredUser: _registeredUser,
    accountsPage,
  }) => {
    await accountsPage.gotoOverview();
    const accountId = await accountsPage.openFirstAccountDetails();
    await expect(accountsPage.page.locator('#accountId')).toContainText(accountId);
  });

  test('opens a new account and lists it in the overview', async ({
    registeredUser: _registeredUser,
    accountsPage,
  }) => {
    const newAccountId = await accountsPage.openNewAccount('SAVINGS');
    await accountsPage.expectAccountListed(newAccountId);
  });
});
