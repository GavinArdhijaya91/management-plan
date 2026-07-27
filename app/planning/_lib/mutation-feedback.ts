const planningErrorRules: Array<[RegExp, string]> = [
  [/requires at least one goal/i, 'Tambahkan minimal satu target sebelum mengaktifkan rencana.'],
  [/requires a reason/i, 'Tuliskan alasan yang spesifik untuk melanjutkan perubahan status ini.'],
  [/replacement target date/i, 'Pilih tanggal target baru sebelum membuka kembali target yang terlewat.'],
  [/unresolved action|active action items/i, 'Selesaikan atau batalkan tindakan aktif terlebih dahulu.'],
  [/not authorized|permission denied/i, 'Role Anda tidak memiliki permission untuk tindakan ini.'],
  [/archived planning record/i, 'Pulihkan data dari arsip sebelum mengubahnya.'],
  [/duplicate key/i, 'Data serupa sudah tersedia di workspace ini.'],
]

export function planningErrorMessage(message: string) {
  return (
    planningErrorRules.find(([pattern]) => pattern.test(message))?.[1] ??
    'Perubahan belum dapat disimpan. Periksa kembali data lalu tekan ulang.'
  )
}
