import { test, expect, TestDataFactory, NewAccountType } from '../../fixtures/test-fixtures';
import { expectSuccessfulApiLogin, requireApiCustomer } from '../../utils/api-session';

test.describe('API – customers and accounts', () => {
  test('logs in via REST and returns customer details', async ({ apiClient }) => {
    const demo = TestDataFactory.sharedDemoCredentials();
    const { response, customer } = await apiClient.login(demo.username, demo.password);
    const loggedIn = await expectSuccessfulApiLogin(response, customer);

    expect(response.headers()['content-type'] ?? '').toMatch(/json|xml/i);
    expect(loggedIn.firstName).toBeTruthy();
    expect(loggedIn.lastName).toBeTruthy();
  });

  test('rejects invalid login credentials', async ({ apiClient }) => {
    const { response } = await apiClient.login('no-such-user', 'bad-password');
    expect(response.ok(), 'Invalid login should not succeed').toBeFalsy();
    expect([400, 401, 404, 500]).toContain(response.status());
  });

  test('retrieves customer by id', async ({ apiClient }) => {
    const loggedIn = await requireApiCustomer(apiClient);
    const { response, customer } = await apiClient.getCustomer(loggedIn.id);

    expect(response.status()).toBe(200);
    expect(customer.id).toBe(loggedIn.id);
    expect(customer.address.city).toBeTruthy();
  });

  test('lists accounts for a customer', async ({ apiClient }) => {
    const customer = await requireApiCustomer(apiClient);
    const { response, accounts } = await apiClient.getAccounts(customer.id);

    expect(response.status()).toBe(200);
    expect(accounts.length, 'Customer should have at least one account').toBeGreaterThan(0);
    expect(accounts[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        customerId: customer.id,
        balance: expect.any(Number),
      }),
    );
  });

  test('retrieves a single account by id', async ({ apiClient }) => {
    const customer = await requireApiCustomer(apiClient);
    const { accounts } = await apiClient.getAccounts(customer.id);
    test.skip(accounts.length === 0, 'No accounts available for customer');

    const { response, account } = await apiClient.getAccount(accounts[0].id);

    expect(response.status()).toBe(200);
    expect(account.id).toBe(accounts[0].id);
    expect(account.customerId).toBe(customer.id);
  });

  test('creates a new account for the demo customer when funded', async ({ apiClient }) => {
    const customer = await requireApiCustomer(apiClient);
    const { accounts } = await apiClient.getAccounts(customer.id);
    test.skip(accounts.length === 0, 'No funding account available');

    const funding = [...accounts].sort((a, b) => b.balance - a.balance)[0];
    test.skip(funding.balance < 100, 'Insufficient balance for createAccount');

    const { response, account } = await apiClient.createAccount(
      customer.id,
      NewAccountType.Savings,
      funding.id,
    );

    expect(response.status(), 'createAccount should succeed').toBe(200);
    expect(account.id).toBeGreaterThan(0);
    expect(account.customerId).toBe(customer.id);
  });
});
