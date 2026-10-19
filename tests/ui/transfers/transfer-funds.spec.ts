import { test, expect } from '../../../fixtures/test-fixtures';

test.describe('Transfer funds', () => {
  test('transfers money between eligible accounts', async ({
    authenticatedUser,
    transferFundsPage,
  }) => {
    expect(authenticatedUser.accountIds.length).toBeGreaterThanOrEqual(2);

    await transferFundsPage.goto();
    const accounts = await transferFundsPage.getAccountOptionValues();
    expect(accounts.length, 'Transfer page should list at least two accounts').toBeGreaterThanOrEqual(
      2,
    );

    const fromAccountId = authenticatedUser.accountIds[0];
    const toAccountId =
      authenticatedUser.accountIds.find((id) => id !== fromAccountId) ?? accounts[1];
    const amount = '10';

    await transferFundsPage.transfer(amount, fromAccountId, toAccountId);
    await transferFundsPage.expectTransferComplete(amount, fromAccountId, toAccountId);
  });

  test('requires an amount before transferring', async ({
    authenticatedUser,
    transferFundsPage,
  }) => {
    expect(authenticatedUser.credentials.username).toBeTruthy();
    await transferFundsPage.goto();
    await transferFundsPage.waitForAccountsLoaded();
    await transferFundsPage.transferButton.click();
    await expect(
      transferFundsPage.page.getByRole('heading', { name: 'Transfer Complete!' }),
    ).toHaveCount(0);
  });

  test('does not complete transfer for a non-numeric amount', async ({
    authenticatedUser,
    transferFundsPage,
  }) => {
    expect(authenticatedUser.accountIds.length).toBeGreaterThanOrEqual(2);
    await transferFundsPage.goto();
    await transferFundsPage.transfer(
      'abc',
      authenticatedUser.accountIds[0],
      authenticatedUser.accountIds[1],
    );
    await expect(
      transferFundsPage.page.getByRole('heading', { name: 'Transfer Complete!' }),
    ).toHaveCount(0);
  });
});
