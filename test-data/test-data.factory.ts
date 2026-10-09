import { randomBytes } from 'crypto';
import type { BillPayeeData, Credentials, UserRegistrationData } from '../types/user.types';

function uniqueSuffix(): string {
  const time = Date.now().toString(36);
  const entropy = randomBytes(3).toString('hex');
  return `${time}${entropy}`;
}

/**
 * Generates unique, synthetic test data for ParaBank.
 * Designed for a shared demo DB with no reliable cleanup API usage from tests.
 */
export const TestDataFactory = {
  createCredentials(prefix = 'qa'): Credentials {
    const suffix = uniqueSuffix();
    return {
      username: `${prefix}_${suffix}`.slice(0, 30),
      password: `Pwd!${suffix}`,
    };
  },

  createUser(overrides: Partial<UserRegistrationData> = {}): UserRegistrationData {
    const credentials = this.createCredentials(overrides.username ? undefined : 'qa');
    return {
      firstName: 'Test',
      lastName: 'User',
      street: '123 Automation Lane',
      city: 'Demo City',
      state: 'CA',
      zipCode: '90210',
      phoneNumber: '555-010-9999',
      ssn: '123-45-6789',
      username: credentials.username,
      password: credentials.password,
      ...overrides,
    };
  },

  createBillPayee(overrides: Partial<BillPayeeData> = {}): BillPayeeData {
    return {
      name: 'Electric Utility Co',
      street: '100 Utility Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      phoneNumber: '555-020-1234',
      accountNumber: '123456789',
      amount: '25.00',
      ...overrides,
    };
  },

  invalidAmount(): string {
    return 'not-a-number';
  },

  /** Public demo credentials — shared with all users; avoid mutating when possible. */
  sharedDemoCredentials(): Credentials {
    return {
      username: 'john',
      password: 'demo',
    };
  },
};
