import type { Page } from '@playwright/test';

const RATE_LIMIT_PATTERN = /1015|rate limited|banned you temporarily/i;

/**
 * Fails fast when ParaBank's Cloudflare edge returns Error 1015,
 * instead of timing out on missing app locators.
 */
export async function assertNotRateLimited(page: Page): Promise<void> {
  const title = await page.title().catch(() => '');
  if (RATE_LIMIT_PATTERN.test(title)) {
    throw new Error(
      'ParaBank Cloudflare rate limit detected (Error 1015). Wait a few minutes and retry with WORKERS=1.',
    );
  }

  const body = page.locator('body');
  if ((await body.count()) === 0) {
    return;
  }

  const text = await body.innerText().catch(() => '');
  if (RATE_LIMIT_PATTERN.test(text)) {
    throw new Error(
      'ParaBank Cloudflare rate limit detected (Error 1015). Wait a few minutes and retry with WORKERS=1.',
    );
  }
}

/** Wraps page.goto so every navigation is checked for Cloudflare rate limiting. */
export function withRateLimitGuard(page: Page): Page {
  const originalGoto = page.goto.bind(page);
  page.goto = async (url, options) => {
    const response = await originalGoto(url, options);
    await assertNotRateLimited(page);
    return response;
  };
  return page;
}
