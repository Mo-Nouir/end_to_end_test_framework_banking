import { test, expect } from '../../../fixtures/test-fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('Transfer funds', () => {
  // Uses the shared demo account which already has multiple accounts.
  // Avoids heavy registration under Cloudflare rate limits.

  test('transfers money between eligible accounts', async ({
    demoAuthenticated,
    transferFundsPage,
  }) => {
    expect(demoAuthenticated.username).toBe('john');
    await transferFundsPage.goto();
    const accounts = await transferFundsPage.getAccountOptionValues();
    test.skip(accounts.length < 2, 'Need at least two accounts to transfer between');

    const fromAccountId = accounts[0];
    const toAccountId = accounts.find((id) => id !== fromAccountId) ?? accounts[1];
    const amount = '10';

    await transferFundsPage.transfer(amount, fromAccountId, toAccountId);
    await transferFundsPage.expectTransferComplete(amount, fromAccountId, toAccountId);
  });

  test('requires an amount before transferring', async ({
    demoAuthenticated,
    transferFundsPage,
  }) => {
    expect(demoAuthenticated.username).toBe('john');
    await transferFundsPage.goto();
    await transferFundsPage.waitForAccountsLoaded();
    await transferFundsPage.transferButton.click();
    await expect(
      transferFundsPage.page.getByRole('heading', { name: 'Transfer Complete!' }),
    ).toHaveCount(0);
  });

  test('does not complete transfer for a non-numeric amount', async ({
    demoAuthenticated,
    transferFundsPage,
  }) => {
    expect(demoAuthenticated.username).toBe('john');
    await transferFundsPage.goto();
    const accounts = await transferFundsPage.getAccountOptionValues();
    test.skip(accounts.length < 2, 'Need at least two accounts to exercise amount validation');

    await transferFundsPage.transfer('abc', accounts[0], accounts[1]);
    await expect(
      transferFundsPage.page.getByRole('heading', { name: 'Transfer Complete!' }),
    ).toHaveCount(0);
  });
});
