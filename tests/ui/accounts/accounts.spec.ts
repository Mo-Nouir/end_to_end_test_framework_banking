import { test, expect } from '../../../fixtures/test-fixtures';

test.describe('Accounts', () => {
  test('shows account overview for a registered user', async ({
    registeredUser,
    accountsPage,
  }) => {
    expect(registeredUser.username).toBeTruthy();
    await accountsPage.gotoOverview();
    await accountsPage.expectAccountTableVisible();
  });

  test('opens account details from the overview', async ({ registeredUser, accountsPage }) => {
    expect(registeredUser.username).toBeTruthy();
    await accountsPage.gotoOverview();
    const accountId = await accountsPage.openFirstAccountDetails();
    await expect(accountsPage.page.locator('#accountId')).toContainText(accountId);
  });

  test('opens a new account and lists it in the overview', async ({
    registeredUser,
    accountsPage,
  }) => {
    expect(registeredUser.username).toBeTruthy();
    const newAccountId = await accountsPage.openNewAccount('SAVINGS');
    await accountsPage.expectAccountListed(newAccountId);
  });
});
