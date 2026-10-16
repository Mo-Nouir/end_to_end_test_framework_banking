import { test, expect, TestDataFactory } from '../../../fixtures/test-fixtures';

test.describe('Find transactions', () => {
  // Uses shared demo login to reduce registration pressure on the public host.

  test('finds transactions by amount after a bill payment', async ({
    demoAuthenticated,
    billPaymentPage,
    findTransactionsPage,
  }) => {
    expect(demoAuthenticated.username).toBe('john');
    // Unique-ish amount to correlate payment → search on the shared demo.
    const amount = `${20 + (Date.now() % 70)}.${String(Date.now() % 90).padStart(2, '0')}`;
    const payee = TestDataFactory.createBillPayee({ amount });

    await billPaymentPage.goto();
    await expect(billPaymentPage.fromAccountSelect.locator('option').first()).toBeAttached({
      timeout: 30_000,
    });
    const fromAccountId = await billPaymentPage.fromAccountSelect.inputValue();
    await billPaymentPage.submitPayment(payee, fromAccountId);
    await billPaymentPage.expectPaymentComplete(payee.name, amount);

    await findTransactionsPage.goto();
    await findTransactionsPage.findByAmount(amount, fromAccountId);
    await findTransactionsPage.expectAtLeastOneResult();
    await expect(findTransactionsPage.resultsBody).toContainText(amount.split('.')[0]);
  });

  test('shows validation when searching by empty transaction id', async ({
    demoAuthenticated,
    findTransactionsPage,
  }) => {
    expect(demoAuthenticated.username).toBe('john');
    await findTransactionsPage.goto();
    await findTransactionsPage.waitForAccountsLoaded();
    await findTransactionsPage.findByIdButton.click();
    await expect(findTransactionsPage.page.locator('#transactionIdError')).toBeVisible();
  });

  test('handles invalid amount search input', async ({
    demoAuthenticated,
    findTransactionsPage,
  }) => {
    expect(demoAuthenticated.username).toBe('john');
    await findTransactionsPage.goto();
    await findTransactionsPage.findByAmount(TestDataFactory.invalidAmount());
    await findTransactionsPage.expectAmountError();
  });
});
