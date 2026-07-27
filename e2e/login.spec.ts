import { expect, test } from "@playwright/test";

test("renders landing page and navigates to login page", async ({ page }) => {
  await page.goto("/");

  // Verify landing page title
  const heading = page.locator("h1");
  await expect(heading).toContainText("Reclaim");

  // Click Sign In link
  await page.click("text=Sign In");

  // Verify navigated to login
  await expect(page).toHaveURL(/.*login/);

  // Verify inputs exist on login page
  const emailInput = page.locator("input#email");
  await expect(emailInput).toBeVisible();

  const passwordInput = page.locator("input#password");
  await expect(passwordInput).toBeVisible();
});
