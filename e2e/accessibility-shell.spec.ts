import { expect, test } from '@playwright/test'

test('public and demo shells expose keyboard-reachable landmarks', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Navigasi landing page' })).toBeVisible()

  await page.keyboard.press('Tab')
  const focusedElement = page.locator(':focus')
  await expect(focusedElement).toBeVisible()
  await expect(focusedElement).toHaveAttribute('href')

  await page.goto('/demo/dashboard')
  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('navigation', { name: /navigasi utama/i })).toBeVisible()
  await expect(page.locator('h1')).toHaveCount(1)
})

test('review route remains protected and preserves the intended return path', async ({ page }) => {
  await page.goto('/planning/reviews')
  await expect(page).toHaveURL(/\/auth\/login\?next=%2Fplanning%2Freviews$/)
})
