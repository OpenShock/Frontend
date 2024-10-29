import { expect, test } from '@playwright/test';

test('index page has expected title', async ({ page }) => {
  await page.goto('/');

  // Find the h1 element
  const heading = await page.$('h1');

  // Check if the heading exists
  expect(heading).not.toBeNull();

  // Check the text content of the heading
  const textContent = await heading!.textContent();
  expect(textContent).toContain('Welcome to');

  // Check if the span element with class exists inside the h1
  const span = await heading!.$('span');
  expect(span).not.toBeNull();

  // Check the text content of the span
  const spanTextContent = await span!.textContent();
  expect(spanTextContent).toContain('OpenShock');
});
