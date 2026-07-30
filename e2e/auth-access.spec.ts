import { expect, test } from '@playwright/test'

test('a protected route redirects an anonymous visitor to login', async ({ page }) => {
  await page.goto('/dashboard')

  await expect(page).toHaveURL(/\/auth\/login\?next=%2Fdashboard$/)
  await expect(page.getByRole('heading', { name: 'Masuk ke workspace' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Buka Demo tanpa akun' })).toBeVisible()

  await page.getByRole('link', { name: 'Buat akun' }).click()
  await expect(page).toHaveURL(/\/auth\/sign-up$/)
  await expect(page.getByRole('heading', { name: 'Buat akun Siapin' })).toBeVisible()
})
