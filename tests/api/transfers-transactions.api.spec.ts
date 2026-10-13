import { test, expect, TestDataFactory } from '../../fixtures/test-fixtures';

test.describe('API – transfers, bill pay, and transactions', () => {
  test('transfers funds between two accounts', async ({ apiClient }) => {
    const demo = TestDataFactory.sharedDemoCredentials();
    const { customer } = await apiClient.login(demo.username, demo.password);
    const { accounts } = await apiClient.getAccounts(customer.id);
    test.skip(accounts.length < 2, 'Need two accounts for transfer');

    const sorted = [...accounts].sort((a, b) => b.balance - a.balance);
    const from = sorted[0];
    const to = sorted[1];
    test.skip(from.balance < 1, 'Insufficient funds on source account');

    const amount = 1;
    const { response, message } = await apiClient.transfer(from.id, to.id, amount);

    expect(response.status()).toBe(200);
    expect(message.toLowerCase()).toMatch(/success|transferred|complete|\$|account/);

    const { account: fromAfter } = await apiClient.getAccount(from.id);
    expect(fromAfter.balance).toBeLessThanOrEqual(from.balance);
  });

  test('lists transactions for an account', async ({ apiClient }) => {
    const demo = TestDataFactory.sharedDemoCredentials();
    const { customer } = await apiClient.login(demo.username, demo.password);
    const { accounts } = await apiClient.getAccounts(customer.id);
    const { response, transactions } = await apiClient.getTransactions(accounts[0].id);

    expect(response.status()).toBe(200);
    expect(Array.isArray(transactions)).toBe(true);
  });

  test('filters transactions by amount', async ({ apiClient }) => {
    const demo = TestDataFactory.sharedDemoCredentials();
    const { customer } = await apiClient.login(demo.username, demo.password);
    const { accounts } = await apiClient.getAccounts(customer.id);
    const accountId = accounts[0].id;

    await apiClient.deposit(accountId, 5);
    const { response, transactions } = await apiClient.getTransactionsByAmount(accountId, 5);

    expect(response.status()).toBe(200);
    expect(Array.isArray(transactions)).toBe(true);
  });

  test('pays a bill via REST', async ({ apiClient }) => {
    const demo = TestDataFactory.sharedDemoCredentials();
    const { customer } = await apiClient.login(demo.username, demo.password);
    const { accounts } = await apiClient.getAccounts(customer.id);
    const funding = [...accounts].sort((a, b) => b.balance - a.balance)[0];
    test.skip(funding.balance < 10, 'Insufficient funds for bill pay');

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
