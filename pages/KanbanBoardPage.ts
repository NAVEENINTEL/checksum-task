import { Page, Locator, expect } from '@playwright/test';
import { retryUntilVisible } from '../utils/helpers';
import { AppConfig } from '../utils/config';

export class KanbanBoardPage {
  readonly page: Page;
  readonly firstColumn: Locator;
  readonly secondColumnArticles: () => Locator;
  readonly currentStatus: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstColumn = page.locator('//section[contains(@class, "box-content")][1]');
    this.secondColumnArticles = () => page.locator('(//section[contains(@class, "box-content")])[2]//article');
    this.currentStatus = page.locator('//p[text()=" Current Status "]/following-sibling::div');
  }

  async goto() {
    console.log('[NAVIGATE] Opening Kanban board...');
    await this.page.goto(AppConfig.baseURL);
    await this.page.waitForLoadState('networkidle');
    console.log('[NAVIGATE] Page loaded:', await this.page.url());
  }

  async getFirstColumnTitle(): Promise<string> {
    const title = await this.firstColumn.locator('h2').textContent();
    const formatted = (title ?? '').replace(/[^a-zA-Z\s]/g, '').trim();
    console.log('[COLUMN] First column title:', formatted);
    return formatted;
  }

    async findFirstIncompleteCardIndex(): Promise<number> {
    const count = await this.secondColumnArticles().count();
    console.log(`[CARDS] Total cards in second column: ${count}`);
    for (let i = 0; i < count; i++) {
        const summary = await this.secondColumnArticles().nth(i).locator('p').textContent();
        const match = summary?.match(/(\d+)\s+of\s+(\d+)\s+substasks/);
        console.log(`[CARDS] Card[${i}] summary:`, summary);
        if (!match) {
        throw new Error(`[ERROR] Unexpected summary format at index ${i}: "${summary}"`);
        }
        if (parseInt(match[1]) < parseInt(match[2])) {
        console.log(`[CARDS] Incomplete card found at index ${i}`);
        return i;
        }
    }
    console.log('[CARDS] No incomplete cards found.');
    return -1;
    }

    async moveCardToColumn(title: string, columnTitle: string) {
        const normalized = columnTitle.charAt(0).toUpperCase() + columnTitle.slice(1).toLowerCase();
        console.log(`[MOVE] Moving card "${title}" to column "${normalized}"`);
        await this.currentStatus.click();
        const option = this.page.locator(`//div[contains(text(), "${normalized}")]`);
        await retryUntilVisible(option);
        await option.click({ force: true });
        await this.page.mouse.click(10, 10);
        console.log('[MOVE] Status updated.');
    }


    async verifyCardMoved(title: string, expectedCompleted: number) {
        const moved = this.page.locator(`(//section[contains(@class,"box-content")])[1]//article[.//h3[normalize-space(text())="${title}"]]`);
        await retryUntilVisible(moved);
        const summary = await moved.locator('p').textContent();
        const match = summary?.match(/(\d+)\s+of\s+(\d+)\s+substasks/);
        console.log(`[VERIFY] Moved card summary: ${summary}`);
        if (!match) throw new Error(`[ERROR] Moved card summary format invalid: "${summary}"`);
        const actualCompleted = parseInt(match[1]);
        expect(actualCompleted).toBe(expectedCompleted);
    }

}
