import { Locator } from '@playwright/test';

export async function retryUntilVisible(locator: Locator, retries = 3, timeout = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return;
    } catch (e) {
      console.warn(`[RETRY] Attempt ${i + 1} failed for locator: ${locator}`);
    }
  }
  throw new Error('[ERROR] Locator not visible after retries');
}
