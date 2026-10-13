import { test, expect, TestDataFactory, NewAccountType } from '../../fixtures/test-fixtures';

test.describe('API – customers and accounts', () => {
  test('logs in via REST and returns customer details', async ({ apiClient }) => {
    // Verified endpoint: GET /login/{username}/{password}
    const demo = TestDataFactory.sharedDemoCredentials();
    const { response, customer } = await apiClient.login(demo.username, demo.password);

    expect(response.status(), 'Login should return HTTP 200').toBe(200);
    expect(response.headers()['content-type'] ?? '').toMatch(/json|xml/i);
    expect(customer.id).toBeGreaterThan(0);
    expect(customer.firstName).toBeTruthy();
    expect(customer.lastName).toBeTruthy();
  });

  test('rejects invalid login credentials', async ({ apiClient }) => {
    const { response } = await apiClient.login('no-such-user', 'bad-password');
    expect(response.ok(), 'Invalid login should not succeed').toBeFalsy();
    expect([400, 401, 404, 500]).toContain(response.status());
  });

  test('retrieves customer by id', async ({ apiClient }) => {
    const demo = TestDataFactory.sharedDemoCredentials();
    const { customer: loggedIn } = await apiClient.login(demo.username, demo.password);
    const { response, customer } = await apiClient.getCustomer(loggedIn.id);

    expect(response.status()).toBe(200);
    expect(customer.id).toBe(loggedIn.id);
    expect(customer.address.city).toBeTruthy();
  });

  test('lists accounts for a customer', async ({ apiClient }) => {
    const demo = TestDataFactory.sharedDemoCredentials();
    const { customer } = await apiClient.login(demo.username, demo.password);
    const { response, accounts } = await apiClient.getAccounts(customer.id);

    expect(response.status()).toBe(200);
    expect(accounts.length, 'Demo customer should have at least one account').toBeGreaterThan(0);
    expect(accounts[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        customerId: customer.id,
        balance: expect.any(Number),
      }),
    );
  });

  test('retrieves a single account by id', async ({ apiClient }) => {
    const demo = TestDataFactory.sharedDemoCredentials();
    const { customer } = await apiClient.login(demo.username, demo.password);
    const { accounts } = await apiClient.getAccounts(customer.id);
    const { response, account } = await apiClient.getAccount(accounts[0].id);

    expect(response.status()).toBe(200);
    expect(account.id).toBe(accounts[0].id);
    expect(account.customerId).toBe(customer.id);
  });

  test('creates a new account for the demo customer when funded', async ({ apiClient }) => {
    // Mutates shared demo state — keep amount of such tests low.
    const demo = TestDataFactory.sharedDemoCredentials();
    const { customer } = await apiClient.login(demo.username, demo.password);
    const { accounts } = await apiClient.getAccounts(customer.id);
    test.skip(accounts.length === 0, 'No funding account available');

    const funding = accounts.sort((a, b) => b.balance - a.balance)[0];
    test.skip(funding.balance < 100, 'Insufficient balance on shared demo account for createAccount');

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
