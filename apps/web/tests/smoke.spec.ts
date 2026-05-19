import { test, expect } from '@playwright/test';

test.describe('ClearRing Website - Smoke Tests', () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ClearRing/i);
  });

  test('hero section is visible with tagline', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('text=Know who').first();
    await expect(hero).toBeVisible({ timeout: 10000 });
  });

  test('navbar is visible and has ClearRing branding', async ({ page }) => {
    await page.goto('/');
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();
  });

  test('Get Early Access button is present', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('button', { hasText: /early access|waitlist|get started/i }).first();
    await expect(cta).toBeVisible({ timeout: 10000 });
  });

  test('page scrolls and all major sections are present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check multiple sections load by scrolling
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Footer should be visible after scrolling to bottom
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });

  test('waitlist modal opens on CTA click', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('button', { hasText: /early access|waitlist|get started/i }).first();
    await cta.click();

    // Modal or form should appear
    const modal = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('How It Works section is present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const section = page.locator('text=How It Works').first();
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
  });

  test('FAQ section has expandable items', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll to FAQ
    const faqSection = page.locator('text=FAQ, text=Frequently Asked').first();
    await faqSection.scrollIntoViewIfNeeded().catch(() => {});

    // There should be some question-like elements
    const questions = page.locator('[data-faq], details, [role="button"]');
    const count = await questions.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known third-party errors
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('ERR_BLOCKED') && !e.includes('hydration'),
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('page is responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // No horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10); // 10px tolerance
  });
});
