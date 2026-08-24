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

test('password visibility can be toggled on login and sign-up', async ({ page }) => {
  await page.goto('/auth/login')

  const loginPassword = page.getByLabel('Kata sandi', { exact: true })
  await expect(loginPassword).toHaveAttribute('type', 'password')
  await page.getByRole('button', { name: 'Tampilkan kata sandi' }).click()
  await expect(loginPassword).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: 'Sembunyikan kata sandi' }).click()
  await expect(loginPassword).toHaveAttribute('type', 'password')

  await page.goto('/auth/sign-up')

  const signUpPassword = page.getByLabel(/Kata sandi \(minimal 10 karakter/)
  await expect(signUpPassword).toHaveAttribute('type', 'password')
  await page.getByRole('button', { name: 'Tampilkan kata sandi' }).click()
  await expect(signUpPassword).toHaveAttribute('type', 'text')
})
