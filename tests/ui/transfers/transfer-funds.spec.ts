import { test, expect } from '../../../fixtures/test-fixtures';

test.describe('Transfer funds', () => {
  test('transfers money between eligible accounts', async ({
    authenticatedUser,
    transferFundsPage,
  }) => {
    expect(authenticatedUser.credentials.username).toBeTruthy();
    await transferFundsPage.goto();
    const accounts = await transferFundsPage.getAccountOptionValues();
    test.skip(accounts.length < 2, 'Need at least two accounts to transfer between');

    const fromAccountId = accounts[0];
    const toAccountId = accounts[1];
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
    // ParaBank shows either a field error or does not complete the transfer.
    await expect(transferFundsPage.page.getByRole('heading', { name: 'Transfer Complete!' })).toHaveCount(
      0,
    );
  });

  test('does not complete transfer for a non-numeric amount', async ({
    authenticatedUser,
    transferFundsPage,
  }) => {
    expect(authenticatedUser.credentials.username).toBeTruthy();
    await transferFundsPage.goto();
    const accounts = await transferFundsPage.getAccountOptionValues();
    test.skip(accounts.length < 2, 'Need at least two accounts to exercise amount validation');

    await transferFundsPage.transfer('abc', accounts[0], accounts[1]);
    await expect(transferFundsPage.page.getByRole('heading', { name: 'Transfer Complete!' })).toHaveCount(
      0,
    );
  });
});
