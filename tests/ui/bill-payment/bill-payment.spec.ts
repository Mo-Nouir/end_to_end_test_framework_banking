import { test, expect, TestDataFactory } from '../../../fixtures/test-fixtures';

test.describe('Bill payment', () => {
  test('submits a bill payment with valid data', async ({
    registeredUser,
    billPaymentPage,
  }) => {
    expect(registeredUser.username).toBeTruthy();
    const payee = TestDataFactory.createBillPayee({ amount: '15.00' });
    await billPaymentPage.goto();
    await billPaymentPage.submitPayment(payee);
    await billPaymentPage.expectPaymentComplete(payee.name, payee.amount);
  });

  test('validates required bill payment fields', async ({ registeredUser, billPaymentPage }) => {
    expect(registeredUser.username).toBeTruthy();
    await billPaymentPage.goto();
    await billPaymentPage.sendPaymentButton.click();
    await billPaymentPage.expectValidationVisible();
  });

  test('flags mismatched verify account numbers', async ({
    registeredUser,
    billPaymentPage,
  }) => {
    expect(registeredUser.username).toBeTruthy();
    const payee = TestDataFactory.createBillPayee();
    await billPaymentPage.goto();
    await billPaymentPage.fillPayee(payee);
    await billPaymentPage.verifyAccount.fill('999999999');
    await billPaymentPage.sendPaymentButton.click();
    await expect(billPaymentPage.page.locator('#validationModel-verifyAccount-mismatch')).toBeVisible();
  });
});
