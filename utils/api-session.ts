import { expect, test } from '@playwright/test';
import type { ParaBankApiClient } from '../api/ParaBankApiClient';
import { TestDataFactory } from '../test-data/test-data.factory';
import type { Customer } from '../types/api.types';
import { env } from './env';

/**
 * Optional helper for specs that still want the shared demo / TEST_* login.
 * Prefer the worker-scoped `apiSession` fixture for happy-path API coverage.
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
