import { test, expect, TestDataFactory } from '../../../fixtures/test-fixtures';

test.describe('Find transactions', () => {
  test('finds transactions by amount after a bill payment', async ({
    authenticatedUser,
    billPaymentPage,
    findTransactionsPage,
  }) => {
    expect(authenticatedUser.credentials.username).toBeTruthy();
    const amount = `${20 + (Date.now() % 70)}.${String(Date.now() % 90).padStart(2, '0')}`;
    const payee = TestDataFactory.createBillPayee({ amount });
    const fromAccountId = authenticatedUser.accountIds[0];

    await billPaymentPage.goto();
    await expect(billPaymentPage.fromAccountSelect.locator('option').first()).toBeAttached({
      timeout: 30_000,
    });
    await billPaymentPage.submitPayment(payee, fromAccountId);
    await billPaymentPage.expectPaymentComplete(payee.name, amount);

    await findTransactionsPage.goto();
    await findTransactionsPage.findByAmount(amount, fromAccountId);
    await findTransactionsPage.expectAtLeastOneResult();
    // ParaBank sometimes renders broken date cells (NaN-NaN-NaN); assert results UI, not cell formatting.
    await expect(findTransactionsPage.resultsTable).toBeVisible();
  });

  test('shows validation when searching by empty transaction id', async ({
    authenticatedUser,
    findTransactionsPage,
  }) => {
    expect(authenticatedUser.credentials.username).toBeTruthy();
    await findTransactionsPage.goto();
    await findTransactionsPage.waitForAccountsLoaded();
    await findTransactionsPage.findByIdButton.click();
    await expect(findTransactionsPage.page.locator('#transactionIdError')).toBeVisible();
  });

  test('handles invalid amount search input', async ({
    authenticatedUser,
    findTransactionsPage,
  }) => {
    expect(authenticatedUser.credentials.username).toBeTruthy();
    await findTransactionsPage.goto();
    await findTransactionsPage.findByAmount(TestDataFactory.invalidAmount());
    await findTransactionsPage.expectAmountError();
  });
});
