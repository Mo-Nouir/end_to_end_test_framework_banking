import { test, expect, TestDataFactory, NewAccountType } from '../../fixtures/test-fixtures';

test.describe('API – customers and accounts', () => {
  test('logs in via REST and returns customer details', async ({ apiClient, apiSession }) => {
    const { response, customer } = await apiClient.login(
      apiSession.credentials.username,
      apiSession.credentials.password,
    );

    expect(response.status(), 'API login for registered user should succeed').toBe(200);
    expect(response.headers()['content-type'] ?? '').toMatch(/json|xml/i);
    expect(customer.id).toBe(apiSession.customer.id);
    expect(customer.firstName).toBeTruthy();
    expect(customer.lastName).toBeTruthy();
  });

  test('rejects invalid login credentials', async ({ apiClient }) => {
    const { response } = await apiClient.login('no-such-user', 'bad-password');
    expect(response.ok(), 'Invalid login should not succeed').toBeFalsy();
    expect([400, 401, 404, 500]).toContain(response.status());
  });

  test('retrieves customer by id', async ({ apiClient, apiSession }) => {
    const { response, customer } = await apiClient.getCustomer(apiSession.customer.id);

    expect(response.status()).toBe(200);
    expect(customer.id).toBe(apiSession.customer.id);
    expect(customer.address.city).toBeTruthy();
  });

  test('lists accounts for a customer', async ({ apiClient, apiSession }) => {
    const { response, accounts } = await apiClient.getAccounts(apiSession.customer.id);

    expect(response.status()).toBe(200);
    expect(accounts.length, 'Customer should have at least one account').toBeGreaterThan(0);
    expect(accounts[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        customerId: apiSession.customer.id,
        balance: expect.any(Number),
      }),
    );
  });

  test('retrieves a single account by id', async ({ apiClient, apiSession }) => {
    const accountId = apiSession.accounts[0].id;
    const { response, account } = await apiClient.getAccount(accountId);

    expect(response.status()).toBe(200);
    expect(account.id).toBe(accountId);
    expect(account.customerId).toBe(apiSession.customer.id);
  });

  test('creates a new account when funded', async ({ apiClient, apiSession }) => {
    const funding = [...apiSession.accounts].sort((a, b) => b.balance - a.balance)[0];
    expect(funding.balance, 'Funding account should be seeded for createAccount').toBeGreaterThanOrEqual(
      100,
    );

    const { response, account } = await apiClient.createAccount(
      apiSession.customer.id,
      NewAccountType.Savings,
      funding.id,
    );

    expect(response.status(), 'createAccount should succeed').toBe(200);
    expect(account.id).toBeGreaterThan(0);
    expect(account.customerId).toBe(apiSession.customer.id);
  });

  test('shared demo login is optional when available', async ({ apiClient }) => {
    const demo = TestDataFactory.sharedDemoCredentials();
    const { response, customer } = await apiClient.login(demo.username, demo.password);
    test.skip(
      !response.ok() || !customer?.id,
      `Shared john/demo unavailable (HTTP ${response.status()}); skipped by design`,
    );

    expect(customer!.firstName).toBeTruthy();
  });
});
