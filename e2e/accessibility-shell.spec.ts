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

  await page.getByRole('button', { name: 'Ubah bahasa' }).click()
  const languageList = page.getByRole('listbox', { name: 'Bahasa' })
  await expect(languageList).toBeVisible()
  await expect(languageList.locator('..')).toHaveClass(/motion-window-origin/)
  await expect(page.getByRole('option', { name: /Bahasa Indonesia/ })).toHaveAttribute('aria-selected', 'true')
})

test('review route remains protected and preserves the intended return path', async ({ page }) => {
  await page.goto('/planning/reviews')
  await expect(page).toHaveURL(/\/auth\/login\?next=%2Fplanning%2Freviews$/)
})

test('demo command palette supports keyboard-first navigation', async ({ page }) => {
  await page.goto('/demo/dashboard')

  await expect(page.getByRole('button', { name: 'Buka pencarian cepat' })).toHaveAttribute(
    'data-shortcut-ready',
    'true',
  )
  await page.keyboard.press('Control+k')
  await expect(page.getByRole('dialog', { name: 'Pindah cepat' })).toBeVisible()

  const search = page.getByRole('textbox', { name: 'Cari halaman' })
  await expect(search).toBeFocused()
  await search.fill('manajemen')
  await page.keyboard.press('Enter')

  await expect(page).toHaveURL(/\/demo\/manajemen$/)
})
