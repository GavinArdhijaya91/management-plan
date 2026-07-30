import { expect, test } from '@playwright/test'
import { createConfirmedE2eAccount, type E2eAccount } from './support/supabase-fixture'

test.describe.serial('private workspace journey', () => {
  let account: E2eAccount

  test.beforeAll(async () => {
    account = await createConfirmedE2eAccount()
  })

  test('a protected route redirects an anonymous visitor to login', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page).toHaveURL(/\/auth\/login\?next=%2Fdashboard$/)
    await expect(page.getByRole('heading', { name: 'Masuk ke workspace' })).toBeVisible()
  })

  test('invalid credentials are rejected without exposing account details', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByLabel('Email').fill('unknown-user@siapin.test')
    await page.getByLabel('Kata sandi').fill('Wrong-Password!2026')
    await page.getByRole('button', { name: 'Masuk' }).click()

    await expect(page).toHaveURL(/\/auth\/login\?error=/)
    await expect(page.getByText('Email atau kata sandi salah.')).toBeVisible()
  })

  test('a confirmed account can create its first workspace and business plan', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByLabel('Email').fill(account.email)
    await page.getByLabel('Kata sandi').fill(account.password)
    await page.getByRole('button', { name: 'Masuk' }).click()

    await expect(page).toHaveURL(/\/workspace\/select$/)
    await page.getByRole('link', { name: 'Buat workspace pertama' }).click()

    await page.getByLabel('Nama usaha').fill(account.workspaceName)
    await page.getByLabel('Slug workspace').fill(account.workspaceSlug)
    await page.getByRole('button', { name: 'Buat workspace' }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('heading', { name: 'Dashboard usaha' })).toBeVisible()
    await expect(page.getByText(account.workspaceName, { exact: false }).first()).toBeVisible()

    await page.getByRole('link', { name: 'Buka planning' }).click()
    await expect(page).toHaveURL(/\/planning$/)
    await page.getByText('Buat rencana bisnis', { exact: true }).click()
    await page.getByLabel('Nama rencana').fill('Rencana pertumbuhan E2E')
    await page.getByLabel('Deskripsi').fill('Rencana yang dibuat melalui perjalanan browser end-to-end.')
    await page.getByLabel('Mulai').fill('2026-08-01')
    await page.getByLabel('Selesai').fill('2026-12-31')
    await page.getByRole('button', { name: 'Simpan sebagai draft' }).click()

    await expect(page).toHaveURL(/\/planning\?success=/)
    await expect(page.getByRole('heading', { name: 'Rencana pertumbuhan E2E' })).toBeVisible()

    await page.getByRole('link', { name: 'Evaluasi' }).click()
    await expect(page).toHaveURL(/\/planning\/reviews$/)
    await page.getByText('Buat draft evaluasi', { exact: true }).click()
    await page.getByLabel('Rencana bisnis').selectOption({ label: 'Rencana pertumbuhan E2E' })
    await page.getByLabel('Jenis periode').selectOption('custom')
    await page.getByLabel('Awal periode').fill('2026-07-01')
    await page.getByLabel('Akhir periode').fill('2026-07-29')
    await page.getByLabel('Ringkasan').fill('Evaluasi browser memastikan workflow review bekerja secara menyeluruh.')
    await page.getByLabel('Tindak lanjut').fill('Tambahkan target terukur pada iterasi berikutnya.')
    await page.getByRole('button', { name: 'Simpan draft evaluasi' }).click()

    await expect(page).toHaveURL(/\/planning\/reviews\?success=/)
    await page.getByRole('button', { name: 'Perbarui evidence' }).click()
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === '/planning/reviews' &&
        url.searchParams.get('success') === 'Evidence dan pemeriksaan kesiapan telah diperbarui.',
      { timeout: 15_000 },
    )
    await expect(page.getByText('Rencana belum memiliki target metrik', { exact: false })).toBeVisible()
    await page.getByLabel(/Saya memahami .* warning/).check()
    await page.getByRole('button', { name: 'Finalisasi evaluasi' }).click()

    await expect(page).toHaveURL(
      (url) =>
        url.pathname === '/planning/reviews' &&
        url.searchParams.get('success') === 'Evaluasi difinalisasi dan evidence telah dikunci.',
      { timeout: 15_000 },
    )
    await expect(page.getByRole('status')).toContainText('Evaluasi difinalisasi')
    await expect(page.getByText('Finalized', { exact: true })).toBeVisible()
    await page.goto('/notifikasi')
    await expect(page.getByText('Evaluasi bisnis difinalisasi')).toBeVisible()
  })
})
