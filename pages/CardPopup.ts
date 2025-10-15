import { Page, Locator } from '@playwright/test';
import { retryUntilVisible } from '../utils/helpers';

export class CardPopup {
  readonly page: Page;
  readonly popup: Locator;

  constructor(page: Page) {
    this.page = page;
    this.popup = page.locator('//div[contains(@class,"overflow-y-auto")]');
  }

  async waitForPopup() {
        console.log('[POPUP] Waiting for popup...');
        await retryUntilVisible(this.popup);
        console.log('[POPUP] Popup is visible.');
    }

  async getTitle(): Promise<string> {
    const title = (await this.popup.locator('h4').textContent())?.trim() ?? '';
    console.log('[POPUP] Title:', title);
    return title;
  }

    async completeAllSubtasks(): Promise<number> {
        const checkboxes = this.popup.locator('input[type="checkbox"]');
        
        const count = await checkboxes.count();
        console.log(`[POPUP] Found ${count} checkboxes.`);
        if (count === 0) throw new Error('[ERROR] No checkboxes found in popup');

        let completed = 0;
        for (let i = 0; i < count; i++) {
            const cb = checkboxes.nth(i);
            const checkboxId = await cb.getAttribute('id');
            if (!(await cb.isChecked())) {
            console.log(`[POPUP] Clicking checkbox ${i}`);
            await cb.click({ force: true });
            const strikeThrough = await this.page.locator(`//label[@for="${checkboxId}"]//span[contains(@class, "line-through")]`);
            await strikeThrough.waitFor({ state: 'visible', timeout: 5000 });
            console.log(`✔️ Verified strikethrough for checkbox ID: ${checkboxId}`);
            completed++;
            }
        }
        console.log(`[POPUP] Total subtasks completed: ${completed}`);
        return completed;
    }

    async completeOneSubtask(): Promise<number> {
        const checkboxes = this.popup.locator('input[type="checkbox"]');
        const count = await checkboxes.count();
        for (let i = 0; i < count; i++) {
            const cb = checkboxes.nth(i);
            const checkboxId = await cb.getAttribute('id');
            if (!(await cb.isChecked())) {
            await cb.click({ force: true });
            const strikeThrough = await this.page.locator(`//label[@for="${checkboxId}"]//span[contains(@class, "line-through")]`);
            await strikeThrough.waitFor({ state: 'visible', timeout: 5000 });
            console.log(`✔️ Verified strikethrough for checkbox ID: ${checkboxId}`);
            return 1;
            }
        }
        return 0;
    }


}
