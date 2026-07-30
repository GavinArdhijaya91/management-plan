import { expect, test } from '@playwright/test'

test('a visitor can explore demo data without an account', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /buka demo/i }).click()

  await expect(page).toHaveURL(/\/demo\/dashboard$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByText(/mode demo aktif/i)).toBeVisible()

  await page.getByRole('link', { name: /manajemen/i }).click()
  await expect(page).toHaveURL(/\/demo\/manajemen$/)
  await expect(page.getByRole('heading', { name: /manajemen transaksi/i })).toBeVisible()
})
