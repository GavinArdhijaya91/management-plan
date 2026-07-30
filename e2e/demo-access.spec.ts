import { expect, test } from '@playwright/test'

test('a visitor can explore demo data without an account', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /buka demo/i }).click()

  await expect(page).toHaveURL(/\/demo\/dashboard$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByText(/mode demo aktif/i)).toBeVisible()

  await page.locator('.page-shell a[href="/demo/manajemen"]').click()
  await expect(page).toHaveURL(/\/demo\/manajemen$/, { timeout: 15_000 })
  await expect(page.getByRole('heading', { name: /manajemen transaksi/i })).toBeVisible()
})
