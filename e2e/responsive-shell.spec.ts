import { expect, test } from '@playwright/test'

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }))
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth)
}

test('authentication remains readable on a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/auth/login')

  await expect(page.getByRole('heading', { name: 'Masuk ke workspace' })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible()
  await expectNoHorizontalOverflow(page)
})

test('the application shell uses mobile navigation at tablet width', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 })
  await page.goto('/demo/dashboard')

  const openMenu = page.getByRole('button', { name: /buka menu/i })
  await expect(openMenu).toBeVisible()
  await openMenu.click()
  await expect(page.locator('#mobile-navigation')).toBeVisible()
  await expectNoHorizontalOverflow(page)

  await page.locator('#mobile-navigation').getByRole('button', { name: /tutup menu/i }).click()
  await expect(page.locator('#mobile-navigation')).toBeHidden()
})

test('the application shell exposes its persistent sidebar on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/demo/dashboard')

  await expect(page.getByRole('navigation', { name: /navigasi utama/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /buka menu/i })).toBeHidden()
  await expectNoHorizontalOverflow(page)
})
