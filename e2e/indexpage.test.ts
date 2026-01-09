import { expect, test } from '@playwright/test';

test('index page has expected content', async ({ page }) => {
  await page.goto('/');

  // Check that the logo images exist
  const logos = await page.$$('section img');
  expect(logos.length).toBeGreaterThanOrEqual(2);

  // Check the text paragraph exists and includes "The go-to platform"
  const paragraph = await page.locator('section p');
  await expect(paragraph).toContainText(
    'The go-to platform for safe, reliable, real low-latency remote shocking.'
  );

  // Check that it includes the people online count text
  await expect(paragraph).toContainText('people online right now');

  // Check for the "Learn More" link
  const learnMore = page.locator('a[href="https://openshock.org"]');
  await expect(learnMore).toHaveText('Learn More');

  // Check for the "Wiki" link
  const wikiLink = page.locator('a[href="https://wiki.openshock.org"]');
  await expect(wikiLink).toHaveText('Wiki');
});
