import dotenv from 'dotenv';

dotenv.config();

function optional(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    return undefined;
  }
  return value.trim();
}

export const env = {
  baseUrl: (() => {
    const value = optional('BASE_URL') ?? 'https://parabank.parasoft.com/parabank';
    return value.endsWith('/') ? value : `${value}/`;
  })(),
  apiBaseUrl:
    optional('API_BASE_URL') ?? 'https://parabank.parasoft.com/parabank/services/bank',
  testUsername: optional('TEST_USERNAME'),
  testPassword: optional('TEST_PASSWORD'),
  isCI: !!process.env.CI,
} as const;
