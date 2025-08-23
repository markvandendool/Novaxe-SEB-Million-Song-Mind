import { test, expect } from '@playwright/test';

test('Welcome page loads and is not empty', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/Novaxe/i);
	const appRoot = page.locator('app-root');
	await expect(appRoot).toBeVisible();
	await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
});

