import { test, expect } from "@playwright/test";

test("redirects to login page", async ({ page }) => {
  await page.goto("/");
  
  // Verify redirected to login
  await expect(page).toHaveURL(/.*login/);

  // Verify form has heading
  const heading = page.locator("h1");
  await expect(heading).toContainText("Kusco");

  // Verify inputs exist
  const emailInput = page.locator("input#email");
  await expect(emailInput).toBeVisible();
  
  const passwordInput = page.locator("input#password");
  await expect(passwordInput).toBeVisible();
});
