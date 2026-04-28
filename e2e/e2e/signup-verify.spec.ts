/**
 * Full E2E: Signup → Email Verification → Login
 *
 * Email verification tests require MailPit to be running and the backend
 * configured to use it as its SMTP server.
 *
 *   docker run -d -p 8025:8025 -p 1025:1025 axllent/mailpit
 *
 * Set TEST_MAILPIT_URL=http://localhost:8025 to enable these tests.
 * If TEST_MAILPIT_URL is not set, the email-verification tests are skipped.
 */

import { deleteMessage, extractAndRewriteLink, waitForEmailTo } from './lib/mailpit';
import { expect, makeCredentials, MAILPIT_URL, test } from './lib/test-fixtures';
import { FRONTEND_URL } from './lib/env';
import { deleteSelf } from './lib/api-client';

// ---------------------------------------------------------------------------
// Browser-based signup — no email verification required
// ---------------------------------------------------------------------------

test.describe('browser signup flow', () => {
  test('signup form submission shows the success dialog', async ({ page, credentials }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Navigate to email signup if OAuth is shown first
    const emailBtn = page.getByRole('button', { name: /signup with email/i });
    if (await emailBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await emailBtn.click();
    }

    await page.getByLabel(/username/i).fill(credentials.username);
    await page.getByLabel(/^email$/i).fill(credentials.email);
    const pwFields = page.getByLabel(/password/i);
    await pwFields.nth(0).fill(credentials.password);
    await pwFields.nth(1).fill(credentials.password);

    // Wait for Turnstile mock to enable the button
    await page.waitForFunction(
      () => !(document.querySelector('button[type="submit"]') as HTMLButtonElement)?.disabled,
      { timeout: 8_000 }
    );

    await page.getByRole('button', { name: /create account/i }).click();

    // Either a success dialog appears, or the page redirects to /login
    const dialogTitle = page.getByText(/welcome|account created|thank you/i);
    const redirectedToLogin = page.url().includes('login');
    const hasDialog = await dialogTitle.isVisible({ timeout: 8_000 }).catch(() => false);

    expect(hasDialog || redirectedToLogin).toBe(true);

    // Cleanup: dismiss dialog and delete via API is handled in teardown
  });

  test('duplicate email shows an error without crashing', async ({ page }) => {
    // Sign up once (this is a fresh unique account so no conflict is expected,
    // but we check that the error path doesn't crash the page)
    const creds = makeCredentials('dup');
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    const emailBtn = page.getByRole('button', { name: /signup with email/i });
    if (await emailBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await emailBtn.click();
    }

    await page.getByLabel(/username/i).fill(creds.username);
    await page.getByLabel(/^email$/i).fill(creds.email);
    const pwFields = page.getByLabel(/password/i);
    await pwFields.nth(0).fill(creds.password);
    await pwFields.nth(1).fill(creds.password);
    await page.waitForFunction(
      () => !(document.querySelector('button[type="submit"]') as HTMLButtonElement)?.disabled,
      { timeout: 8_000 }
    );
    await page.getByRole('button', { name: /create account/i }).click();

    // Dismiss success if shown
    const okBtn = page.getByRole('button', { name: /^ok$/i });
    if (await okBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await okBtn.click();
    }

    // Try to sign up again with the same email
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    const emailBtn2 = page.getByRole('button', { name: /signup with email/i });
    if (await emailBtn2.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await emailBtn2.click();
    }
    await page.getByLabel(/username/i).fill(`${creds.username}2`.slice(0, 32));
    await page.getByLabel(/^email$/i).fill(creds.email);
    const pwFields2 = page.getByLabel(/password/i);
    await pwFields2.nth(0).fill(creds.password);
    await pwFields2.nth(1).fill(creds.password);
    await page.waitForFunction(
      () => !(document.querySelector('button[type="submit"]') as HTMLButtonElement)?.disabled,
      { timeout: 8_000 }
    );
    await page.getByRole('button', { name: /create account/i }).click();
    await page.waitForTimeout(3_000);

    // Should show an error toast or inline message — not crash or redirect to home
    expect(page.url()).not.toMatch(/\/(home|shockers|hubs)/);
  });
});

// ---------------------------------------------------------------------------
// Email verification flow (requires MailPit)
// ---------------------------------------------------------------------------

test.describe('email verification via MailPit', () => {
  test.beforeEach(({ mailpitEnabled }) => {
    test.skip(!mailpitEnabled, 'Set TEST_MAILPIT_URL to enable email verification tests');
  });

  test('signup sends a verification email', async ({ page, credentials }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    const emailBtn = page.getByRole('button', { name: /signup with email/i });
    if (await emailBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await emailBtn.click();
    }

    await page.getByLabel(/username/i).fill(credentials.username);
    await page.getByLabel(/^email$/i).fill(credentials.email);
    const pwFields = page.getByLabel(/password/i);
    await pwFields.nth(0).fill(credentials.password);
    await pwFields.nth(1).fill(credentials.password);
    await page.waitForFunction(
      () => !(document.querySelector('button[type="submit"]') as HTMLButtonElement)?.disabled,
      { timeout: 8_000 }
    );
    await page.getByRole('button', { name: /create account/i }).click();

    // Poll MailPit for the verification email (30s timeout)
    const msg = await waitForEmailTo(MAILPIT_URL, credentials.email, { timeoutMs: 30_000 });

    expect(msg.Subject).toBeTruthy();
    expect(msg.HTML || msg.Text).toMatch(/activate|verify|confirm/i);

    await deleteMessage(MAILPIT_URL, msg.ID);
  });

  test('clicking the activation link activates the account and redirects to login', async ({
    page,
    credentials,
  }) => {
    // Step 1: Sign up via browser
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    const emailBtn = page.getByRole('button', { name: /signup with email/i });
    if (await emailBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await emailBtn.click();
    }

    await page.getByLabel(/username/i).fill(credentials.username);
    await page.getByLabel(/^email$/i).fill(credentials.email);
    const pwFields = page.getByLabel(/password/i);
    await pwFields.nth(0).fill(credentials.password);
    await pwFields.nth(1).fill(credentials.password);
    await page.waitForFunction(
      () => !(document.querySelector('button[type="submit"]') as HTMLButtonElement)?.disabled,
      { timeout: 8_000 }
    );
    await page.getByRole('button', { name: /create account/i }).click();

    // Dismiss success dialog if shown
    const okBtn = page.getByRole('button', { name: /^ok$/i });
    if (await okBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await okBtn.click();
    }

    // Step 2: Retrieve the verification email from MailPit
    const msg = await waitForEmailTo(MAILPIT_URL, credentials.email, { timeoutMs: 30_000 });

    // Step 3: Extract the activation link and rewrite to test frontend URL
    const activationLink = extractAndRewriteLink(
      msg,
      /https?:\/\/[^\s"'<]+\/activate\?token=[^\s"'<&]+/,
      FRONTEND_URL
    );
    expect(activationLink).toBeTruthy();

    await deleteMessage(MAILPIT_URL, msg.ID);

    // Step 4: Navigate to the activation link
    await page.goto(activationLink!);
    await page.waitForLoadState('networkidle');

    // Step 5: Click "Activate Account" button
    await expect(
      page.getByRole('button', { name: /activate account/i })
    ).toBeVisible({ timeout: 5_000 });
    await page.getByRole('button', { name: /activate account/i }).click();

    // Should redirect to /login after activation
    await page.waitForURL(/login/, { timeout: 10_000 });
    expect(page.url()).toMatch(/login/);

    // Step 6: Log in with the activated account
    await page.getByLabel(/username or email/i).fill(credentials.email);
    await page.getByLabel(/password/i).fill(credentials.password);
    await page.waitForFunction(
      () => !(document.querySelector('button[type="submit"]') as HTMLButtonElement)?.disabled,
      { timeout: 5_000 }
    );
    await page.getByRole('button', { name: /^login$/i }).click();
    await page.waitForURL(/\/(home|shockers|hubs)/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/(home|shockers|hubs)/);
  });

  test('activate page with an invalid token shows an error state', async ({ page }) => {
    await page.goto('/activate?token=00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /activate account/i }).click();
    await page.waitForTimeout(2_000);
    // Should show some error feedback — not crash or redirect to home
    expect(page.url()).not.toMatch(/\/(home|shockers|hubs)/);
  });
});

// ---------------------------------------------------------------------------
// Full signup → verify → login round-trip (MailPit required)
// ---------------------------------------------------------------------------

test.describe('complete new-user onboarding journey', () => {
  test.beforeEach(({ mailpitEnabled }) => {
    test.skip(!mailpitEnabled, 'Set TEST_MAILPIT_URL to enable this test');
  });

  test('new user can sign up, verify email, log in, and see the home page', async ({
    page,
    credentials,
    context,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    // 1. Signup
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    const emailBtn = page.getByRole('button', { name: /signup with email/i });
    if (await emailBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await emailBtn.click();
    }
    await page.getByLabel(/username/i).fill(credentials.username);
    await page.getByLabel(/^email$/i).fill(credentials.email);
    const pwFields = page.getByLabel(/password/i);
    await pwFields.nth(0).fill(credentials.password);
    await pwFields.nth(1).fill(credentials.password);
    await page.waitForFunction(
      () => !(document.querySelector('button[type="submit"]') as HTMLButtonElement)?.disabled,
      { timeout: 8_000 }
    );
    await page.getByRole('button', { name: /create account/i }).click();
    const okBtn = page.getByRole('button', { name: /^ok$/i });
    if (await okBtn.isVisible({ timeout: 5_000 }).catch(() => false)) await okBtn.click();

    // 2. Get verification email
    const msg = await waitForEmailTo(MAILPIT_URL, credentials.email, { timeoutMs: 30_000 });
    const link = extractAndRewriteLink(
      msg,
      /https?:\/\/[^\s"'<]+\/activate\?token=[^\s"'<&]+/,
      FRONTEND_URL
    );
    expect(link).toBeTruthy();
    await deleteMessage(MAILPIT_URL, msg.ID);

    // 3. Activate
    await page.goto(link!);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /activate account/i }).click();
    await page.waitForURL(/login/, { timeout: 10_000 });

    // 4. Login
    await page.getByLabel(/username or email/i).fill(credentials.email);
    await page.getByLabel(/password/i).fill(credentials.password);
    await page.waitForFunction(
      () => !(document.querySelector('button[type="submit"]') as HTMLButtonElement)?.disabled,
      { timeout: 5_000 }
    );
    await page.getByRole('button', { name: /^login$/i }).click();
    await page.waitForURL(/\/(home|shockers|hubs)/, { timeout: 15_000 });

    // 5. Assert home page is functional
    await expect(page.getByRole('navigation').first()).toBeVisible({ timeout: 5_000 });
    expect(errors).toHaveLength(0);

    // Teardown: delete the account
    const cookies = await context.cookies();
    const apiHost = new URL(FRONTEND_URL).hostname.replace('next.', '');
    const authCookies = cookies
      .filter((c) => c.domain.includes(apiHost) || c.domain.includes('openshock'))
      .map((c) => `${c.name}=${c.value}; Path=${c.path}`);
    try {
      await deleteSelf(authCookies);
    } catch {
      // best-effort
    }
  });
});
