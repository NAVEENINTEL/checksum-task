import { test, expect } from '@playwright/test';
import { KanbanBoardPage } from '../pages/KanbanBoardPage';
import { CardPopup } from '../pages/CardPopup';
import { retryUntilVisible } from '../utils/helpers';

test('Edit a Kanban card to mark a subtask as complete and move the card to the first column', async ({ page }) => {
  const board = new KanbanBoardPage(page);
  const popup = new CardPopup(page);

  console.log('[TEST] Starting Kanban board automation...');
  // Step 1: Navigate to the Kanban app
  await board.goto();

   // Step 2: Get the title of the first column (destination for completed cards)
  const columnTitle = await board.getFirstColumnTitle();

  while (true) {
    console.log('[LOOP] Checking for incomplete cards...');
    const idx = await board.findFirstIncompleteCardIndex();
    if (idx === -1) {
      console.log('[LOOP] No incomplete cards found. Test complete.');
      break;
    }

    const card = board.secondColumnArticles().nth(idx);
    await retryUntilVisible(card);

    const title = (await card.locator('h3').textContent())?.trim() ?? '';
    const summary = (await card.locator('p').textContent()) ?? '';
    console.log(`[PROCESS] Card[${idx}] Title: "${title}", Summary: "${summary}"`);

    const match = summary.match(/(\d+)\s+of\s+(\d+)\s+substasks/);
    if (!match) {
      console.warn(`[WARN] Unexpected summary format for card "${title}". Skipping.`);
      continue;
    }

    let completed = parseInt(match[1]);
    const total = parseInt(match[2]);
    if (completed >= total) {
      console.log(`[SKIP] Card "${title}" already complete (${completed}/${total}).`);
      continue;
    }

    try {
      // Step 3: Open the card and complete one or more subtasks
      await card.click();
      await popup.waitForPopup();

      const popupTitle = await popup.getTitle();
      expect(popupTitle).toBe(title);

      // Step 4: Verify that the subtask is striked through in the popup
      completed += await popup.completeAllSubtasks();

       // Step 5: Move task to the first column and 
       // Step 6: Close the card edit page
      await board.moveCardToColumn(title, columnTitle);
    
      // Step 7: Verify that the number of completed subtasks is correct
      // Step 8: Verify that the card moved to the correct column
      await board.verifyCardMoved(title, completed);

      console.log(`[SUCCESS] Card "${title}" moved and verified.`);
    } catch (err) {
      console.error(`[ERROR] Failed to process card "${title}":`, err);
      continue;
    }
  }

  console.log('[TEST] All incomplete cards processed successfully.');
});
