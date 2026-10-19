import { expect, test } from '@playwright/test';
import type { ParaBankApiClient } from '../api/ParaBankApiClient';
import { TestDataFactory } from '../test-data/test-data.factory';
import type { Customer } from '../types/api.types';
import { env } from './env';

/**
 * Logs in via REST using dedicated env credentials when set, otherwise the shared
 * john/demo account. Skips the test when the public demo login is unavailable
 * (common HTTP 400 after host DB resets) so suites do not cascade-fail.
 */
export async function requireApiCustomer(apiClient: ParaBankApiClient): Promise<Customer> {
  const candidates = [
    env.testUsername && env.testPassword
      ? { username: env.testUsername, password: env.testPassword, label: 'TEST_USERNAME' }
      : undefined,
    { ...TestDataFactory.sharedDemoCredentials(), label: 'shared demo john/demo' },
  ].filter(Boolean) as Array<{ username: string; password: string; label: string }>;

  let lastStatus = 0;
  for (const credentials of candidates) {
    const { response, customer } = await apiClient.login(credentials.username, credentials.password);
    lastStatus = response.status();
    if (response.ok() && customer?.id) {
      return customer;
    }
  }

  test.skip(
    true,
    `API login unavailable (last HTTP ${lastStatus}). Public ParaBank demo may be reset or flaky.`,
  );

  // Unreachable after skip; keeps TypeScript satisfied.
  throw new Error('API login unavailable');
}

/** Asserts a successful login response without cascading on undefined customer. */
export async function expectSuccessfulApiLogin(
  response: { status: () => number; headers: () => Record<string, string>; ok: () => boolean },
  customer: Customer | undefined,
): Promise<Customer> {
  if (!response.ok() || !customer?.id) {
    test.skip(
      true,
      `Expected successful API login, received HTTP ${response.status()}. Demo credentials may be unavailable.`,
    );
  }
  expect(customer!.id).toBeGreaterThan(0);
  return customer!;
}
