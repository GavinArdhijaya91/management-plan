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
    await page.getByLabel('Kata sandi', { exact: true }).fill('Wrong-Password!2026')
    await page.getByRole('button', { name: 'Masuk' }).click()

    await expect(page).toHaveURL(/\/auth\/login\?error=/)
    await expect(page.getByText('Email atau kata sandi salah.')).toBeVisible()
  })

  test('a confirmed account can create its first workspace and business plan', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByLabel('Email').fill(account.email)
    await page.getByLabel('Kata sandi', { exact: true }).fill(account.password)
    await page.getByRole('button', { name: 'Masuk' }).click()

    await expect(page).toHaveURL(/\/workspace\/select$/)
    await page.getByRole('link', { name: 'Buat workspace pertama' }).click()

    await page.getByLabel('Nama usaha').fill(account.workspaceName)
    await page.getByLabel('Slug workspace').fill(account.workspaceSlug)
    await page.getByRole('button', { name: 'Buat workspace' }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('heading', { name: 'Dashboard usaha' })).toBeVisible()
    await expect(page.getByText(account.workspaceName, { exact: false }).first()).toBeVisible()

    await page.goto('/profil')
    await page.getByLabel('Display name').fill('Owner Presence E2E')
    await page.getByLabel('Headline').fill('Pemilik usaha pengujian')
    await page.getByRole('textbox', { name: 'Status', exact: true }).fill('Memastikan kolaborasi berjalan')
    await page.getByLabel('Tampilkan status aktivitas').uncheck()
    await page.getByRole('button', { name: 'Simpan profil' }).click()
    await expect(page).toHaveURL(/\/profil\?success=/)
    await expect(page.getByRole('status')).toContainText('Profil berhasil diperbarui.')

    await page.goto('/kolaborasi')
    await expect(page.getByText('Memastikan kolaborasi berjalan')).toBeVisible()
    await expect(page.getByLabel('Owner Presence E2E, offline').last()).toBeVisible()

    await page.goto('/kalender')
    await expect(page.getByRole('heading', { name: 'Kalender & pengingat' })).toBeVisible()
    await page.getByRole('button', { name: 'Tambah agenda', exact: true }).click()
    const createAgendaDialog = page.getByRole('dialog', { name: 'Tambah agenda' })
    await createAgendaDialog.getByLabel('Judul agenda').fill('Bayar supplier E2E')
    await createAgendaDialog.getByLabel('Kategori').selectOption('supplier')
    await createAgendaDialog.getByLabel('Catatan (opsional)').fill('Agenda privat yang dibuat melalui browser.')
    await createAgendaDialog.getByRole('button', { name: 'Tambah agenda', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('Agenda berhasil ditambahkan.')
    await expect(page.getByText('Bayar supplier E2E')).toBeVisible()

    await page.getByRole('button', { name: 'Edit' }).click()
    await page.getByLabel('Judul agenda').fill('Bayar supplier E2E diperbarui')
    await page.getByRole('button', { name: 'Simpan perubahan' }).click()
    await expect(page.getByText('Bayar supplier E2E diperbarui')).toBeVisible()
    await page.getByRole('button', { name: 'Selesai' }).click()
    await expect(page.getByRole('button', { name: 'Buka kembali' })).toBeVisible()
    await page.getByRole('button', { name: 'Hapus' }).click()
    await page.getByRole('dialog', { name: 'Hapus agenda?' }).getByRole('button', { name: 'Hapus agenda' }).click()
    await expect(page.getByText('Bayar supplier E2E diperbarui')).toHaveCount(0)

    await page.goto('/manajemen')
    await page.getByText('Tambah transaksi', { exact: true }).click()
    await page.getByLabel('Tanggal').fill('2026-08-25')
    await page.getByLabel('Tipe').selectOption('sale')
    await page.getByLabel('Jumlah').fill('2000000')
    await page.getByLabel('Biaya pokok').fill('500000')
    await page.getByLabel('Catatan').fill('Penjualan E2E untuk bukti target omzet.')
    await page.getByRole('button', { name: 'Simpan transaksi' }).click()
    await expect(page).toHaveURL(/\/manajemen\?success=/)
    await expect(page.getByRole('status')).toContainText('Transaksi berhasil ditambahkan.')
    await expect(page.getByText(/1\.500\.000/)).toBeVisible()

    await page.goto('/planning')
    await expect(page).toHaveURL(/\/planning$/)
    await page.getByText('Buat rencana bisnis', { exact: true }).click()
    await page.getByLabel('Nama rencana').fill('Rencana pertumbuhan E2E')
    await page.getByLabel('Deskripsi').fill('Rencana yang dibuat melalui perjalanan browser end-to-end.')
    await page.getByLabel('Mulai').fill('2026-08-01')
    await page.getByLabel('Selesai').fill('2026-12-31')
    await page.getByRole('button', { name: 'Simpan sebagai draft' }).click()

    await expect(page).toHaveURL(/\/planning\?success=/)
    await expect(page.getByRole('heading', { name: 'Rencana pertumbuhan E2E' })).toBeVisible()

    const goalComposer = page.locator('details').filter({ hasText: 'Tambah target' }).first()
    await goalComposer.getByText('Tambah target', { exact: true }).click()
    await goalComposer.getByLabel('Nama target').fill('Naikkan omzet E2E')
    await goalComposer.getByLabel('Tanggal target').fill('2026-12-31')
    await goalComposer.getByRole('button', { name: 'Tambahkan target' }).click()
    await expect(page).toHaveURL(/\/planning\?success=/)

    await page.getByRole('link', { name: 'Pengukuran' }).click()
    await expect(page).toHaveURL(/\/planning\/metrics$/)
    await page.getByLabel('Nama metrik').fill('Omzet E2E')
    await page.getByLabel('Kode').fill('omzet_e2e')
    await page.getByLabel('Jenis unit').selectOption('currency')
    await page.getByLabel('Label unit').fill('IDR')
    await page.getByLabel('Agregasi').selectOption('latest')
    await page.getByLabel('Sumber otoritatif').selectOption('manual')
    await page.getByRole('button', { name: 'Simpan metrik' }).click()
    await expect(page).toHaveURL(/\/planning\/metrics\?success=/)

    const targetComposer = page.locator('details').filter({ hasText: '2. Tetapkan target' })
    await targetComposer.getByLabel('Goal').selectOption({ label: 'Naikkan omzet E2E' })
    await targetComposer.getByLabel('Metrik').selectOption({ label: 'Omzet E2E' })
    await targetComposer.getByLabel('Nilai awal').fill('1000000')
    await targetComposer.getByLabel('Nilai target').fill('2000000')
    await targetComposer.getByRole('button', { name: 'Tambahkan target' }).click()
    await expect(page).toHaveURL(/\/planning\/metrics\?success=/)

    await page.getByLabel('Target terukur').selectOption({ label: 'Naikkan omzet E2E - Omzet E2E' })
    await page.getByLabel('Nilai aktual').fill('1500000')
    await page.getByLabel('Waktu pengukuran').fill('2026-08-25T09:00')
    await page.getByLabel('Sumber', { exact: true }).fill('Rekap kas E2E')
    await page.getByLabel('Catatan bukti').fill('Observasi sintetis untuk kontrak browser.')
    await page.getByRole('button', { name: 'Catat hasil aktual' }).click()
    await expect(page).toHaveURL(/\/planning\/metrics\?success=/)
    await expect(page.getByText(/1\.500\.000/)).toBeVisible()

    const contributionComposer = page.locator('details').filter({ hasText: '4. Hubungkan transaksi' })
    await contributionComposer.getByText('4. Hubungkan transaksi', { exact: true }).click()
    await contributionComposer.getByLabel('Transaksi').selectOption({ index: 1 })
    await contributionComposer.getByLabel('Target terukur').selectOption({ label: 'Naikkan omzet E2E - Omzet E2E' })
    await contributionComposer.getByLabel('Nilai kontribusi bertanda').fill('1500000')
    await contributionComposer.getByLabel('Catatan hubungan').fill('Hasil bersih transaksi menjadi pembanding aktual.')
    await contributionComposer.getByRole('button', { name: 'Hubungkan transaksi' }).click()
    await expect(page).toHaveURL(/\/planning\/metrics\?success=/)
    await expect(page.getByRole('status')).toContainText('Kontribusi transaksi berhasil dihubungkan ke target.')
    await expect(page.getByText('Selaras')).toBeVisible()

    await page.getByRole('link', { name: 'Buka evaluasi' }).click()
    await expect(page).toHaveURL(/\/planning\/reviews$/)
    await page.getByText('Buat draft evaluasi', { exact: true }).click()
    await page.getByLabel('Rencana bisnis').selectOption({ label: 'Rencana pertumbuhan E2E' })
    await page.getByLabel('Jenis periode').selectOption('custom')
    await page.getByLabel('Awal periode').fill('2026-08-01')
    await page.getByLabel('Akhir periode').fill('2026-08-31')
    await page.getByLabel('Ringkasan').fill('Evaluasi browser memastikan workflow review bekerja secara menyeluruh.')
    await page.getByLabel('Tindak lanjut').fill('Gunakan evidence aktual untuk keputusan berikutnya.')
    await page.getByRole('button', { name: 'Simpan draft evaluasi' }).click()

    await expect(page).toHaveURL(/\/planning\/reviews\?success=/)
    await page.getByRole('button', { name: 'Perbarui evidence' }).click()
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === '/planning/reviews' &&
        url.searchParams.get('success') === 'Evidence dan pemeriksaan kesiapan telah diperbarui.',
      { timeout: 15_000 },
    )
    await expect(page.getByText('Target tercatat').locator('..')).toContainText('1')
    const warningAcknowledgement = page.getByLabel(/Saya memahami .* warning/)
    if (await warningAcknowledgement.isVisible()) await warningAcknowledgement.check()
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
