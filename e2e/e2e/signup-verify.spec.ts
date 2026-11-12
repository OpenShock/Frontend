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

import { deleteSelf } from './lib/api-client';
import { FRONTEND_URL } from './lib/env';
import { deleteMessage, extractAndRewriteLink, waitForEmailTo } from './lib/mailpit';
import { expect, getAuthCookies, MAILPIT_URL, test } from './lib/test-fixtures';

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

    // Either a success dialog appears or the page redirects to /login, and which one happens
    // is timing-dependent — so wait on the two together. Reading page.url() up front could
    // not see a later redirect, and isVisible() ignores its timeout rather than waiting.
    await expect
      .poll(
        async () => {
          if (/login/.test(page.url())) return true;
          return page.getByText(/welcome|account created|thank you/i).isVisible();
        },
        { timeout: 15_000 }
      )
      .toBe(true);
  });

  test('duplicate email shows an error without crashing', async ({ page, credentials }) => {
    // Sign up once; the fixture deletes this account afterwards.
    const creds = credentials;
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

    // The first signup has to succeed, or the second one is not a duplicate at all. Success
    // shows the welcome dialog or lands on /login; whichever happens, wait on it.
    await expect
      .poll(
        async () => {
          if (/login/.test(page.url())) return true;
          return page.getByText(/thank you for signing up/i).isVisible();
        },
        { timeout: 15_000 }
      )
      .toBe(true);

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
    const signupResponse = page.waitForResponse((res) => /\/account\/signup/.test(res.url()));
    await page.getByRole('button', { name: /create account/i }).click();
    expect((await signupResponse).ok()).toBe(false);

    // The rejection has to reach the user: the problem's title is shown as a toast.
    await expect(page.getByText(/already in use|already taken|already exists/i)).toBeVisible({
      timeout: 10_000,
    });
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

    // Step 4: Navigate to the activation link. The page activates on load and reports the result.
    await page.goto(activationLink!);
    await expect(page.getByText(/your account has been activated/i)).toBeVisible({
      timeout: 10_000,
    });

    // Step 5: Continue to login
    await page.getByRole('link', { name: /continue to login/i }).click();
    await page.waitForURL(/login/, { timeout: 10_000 });

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
    // The page activates on load; a bad token has to end in the visible failure message, and
    // nothing else may happen (no redirect anywhere, no way to continue to login).
    await expect(page.getByText(/activation link is invalid or has expired/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole('link', { name: /continue to login/i })).toHaveCount(0);
    expect(page.url()).toMatch(/\/activate/);
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

    // 3. Activate (happens on load) and continue to login
    await page.goto(link!);
    await expect(page.getByText(/your account has been activated/i)).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole('link', { name: /continue to login/i }).click();
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

    // Teardown: delete the account with the session the browser holds for the API host. The
    // credentials fixture would get there too, but this spares it the mail round trip.
    try {
      await deleteSelf(await getAuthCookies(context));
    } catch {
      // best-effort; the credentials fixture retries over the API
    }
  });
});
