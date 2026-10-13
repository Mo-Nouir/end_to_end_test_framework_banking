import { test, expect, TestDataFactory } from '../../../fixtures/test-fixtures';

test.describe('Find transactions', () => {
  test('finds transactions by amount after a bill payment', async ({
    registeredUser,
    billPaymentPage,
    findTransactionsPage,
  }) => {
    expect(registeredUser.username).toBeTruthy();
    const amount = '18.50';
    const payee = TestDataFactory.createBillPayee({ amount });

    await billPaymentPage.goto();
    await billPaymentPage.submitPayment(payee);
    await billPaymentPage.expectPaymentComplete(payee.name, amount);

    await findTransactionsPage.goto();
    await findTransactionsPage.findByAmount(amount);
    await findTransactionsPage.expectAtLeastOneResult();
    await expect(findTransactionsPage.resultsBody).toContainText(amount.replace(/\.00$/, ''));
  });

  test('shows validation when searching by empty transaction id', async ({
    registeredUser,
    findTransactionsPage,
  }) => {
    expect(registeredUser.username).toBeTruthy();
    await findTransactionsPage.goto();
    await findTransactionsPage.waitForAccountsLoaded();
    await findTransactionsPage.findByIdButton.click();
    await expect(findTransactionsPage.page.locator('#transactionIdError')).toBeVisible();
  });

  test('handles invalid amount search input', async ({
    registeredUser,
    findTransactionsPage,
  }) => {
    expect(registeredUser.username).toBeTruthy();
    await findTransactionsPage.goto();
    await findTransactionsPage.findByAmount(TestDataFactory.invalidAmount());
    await findTransactionsPage.expectAmountError();
  });
});
