import { expect, test } from "@playwright/test";

test("renders the auth shell with creator next targets", async ({ page }) => {
  await page.goto("/sign-in?next=%2Fcreator");

  await expect(page.getByRole("heading", { name: "Sign in to your studio" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Create an account" })).toHaveAttribute(
    "href",
    "/sign-up?next=%2Fcreator",
  );
  await expect(page.getByRole("link", { name: "Forgot password?" })).toHaveAttribute(
    "href",
    "/forgot-password?next=%2Fcreator",
  );
});

test("protects library and creator routes for guests", async ({ page }) => {
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Sign in to your studio" })).toBeVisible();

  await page.goto("/creator");
  await expect(page.getByRole("heading", { name: "Sign in to your studio" })).toBeVisible();
});
