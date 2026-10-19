import { test, expect, TestDataFactory } from '../../fixtures/test-fixtures';

test.describe('API – transfers, bill pay, and transactions', () => {
  test('transfers funds between two accounts', async ({ apiClient, apiSession }) => {
    expect(apiSession.accounts.length, 'Need two accounts for transfer').toBeGreaterThanOrEqual(2);

    const sorted = [...apiSession.accounts].sort((a, b) => b.balance - a.balance);
    const from = sorted[0];
    const to = sorted[1];
    expect(from.balance, 'Source account should be funded').toBeGreaterThanOrEqual(1);

    const amount = 1;
    const { response, message } = await apiClient.transfer(from.id, to.id, amount);

    expect(response.status()).toBe(200);
    expect(message.toLowerCase()).toMatch(/success|transferred|complete|\$|account/);

    const { account: fromAfter } = await apiClient.getAccount(from.id);
    expect(fromAfter.balance).toBeLessThanOrEqual(from.balance);
  });

  test('lists transactions for an account', async ({ apiClient, apiSession }) => {
    const { response, transactions } = await apiClient.getTransactions(apiSession.accounts[0].id);

    expect(response.status()).toBe(200);
    expect(Array.isArray(transactions)).toBe(true);
  });

  test('filters transactions by amount', async ({ apiClient, apiSession }) => {
    const accountId = apiSession.accounts[0].id;
    await apiClient.deposit(accountId, 5);
    const { response, transactions } = await apiClient.getTransactionsByAmount(accountId, 5);

    expect(response.status()).toBe(200);
    expect(Array.isArray(transactions)).toBe(true);
  });

  test('pays a bill via REST', async ({ apiClient, apiSession }) => {
    const funding = [...apiSession.accounts].sort((a, b) => b.balance - a.balance)[0];
    expect(funding.balance, 'Funding account should cover bill pay').toBeGreaterThanOrEqual(10);

    const payeeData = TestDataFactory.createBillPayee({ amount: '5.00' });
    const { response, result } = await apiClient.billPay(funding.id, 5, {
      name: payeeData.name,
      address: {
        street: payeeData.street,
        city: payeeData.city,
        state: payeeData.state,
        zipCode: payeeData.zipCode,
      },
      phoneNumber: payeeData.phoneNumber,
      accountNumber: Number(payeeData.accountNumber),
    });

    expect(response.status()).toBe(200);
    expect(result.payeeName).toBe(payeeData.name);
    expect(result.accountId).toBe(funding.id);
    expect(Number(result.amount)).toBe(5);
  });

  test('transfer with missing params fails', async ({ request }) => {
    const apiBase =
      process.env.API_BASE_URL ?? 'https://parabank.parasoft.com/parabank/services/bank';
    const response = await request.post(`${apiBase}/transfer`, {
      headers: { Accept: 'application/json' },
    });
    expect(response.ok()).toBeFalsy();
  });
});
