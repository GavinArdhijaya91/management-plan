# Panduan sumber pasar untuk pengguna

## Memilih jenis sumber

- **Dokumen resmi** cocok untuk membaca konteks rilis, publikasi, dan penjelasan metodologi.
- **Seri angka** cocok untuk membandingkan nilai menurut waktu dengan satuan yang konsisten.
- **Observasi manual** adalah catatan internal workspace. Data ini tidak berasal dari BPS dan selalu ditampilkan terpisah.

Statistik resmi bukan rekomendasi otomatis. Kenaikan indikator nasional tidak selalu berarti permintaan produk tertentu naik di wilayah usaha pengguna.

## Domain dan kata kunci

Domain `0000` adalah BPS pusat/nasional. Domain provinsi atau kabupaten/kota harus diambil dari daftar domain WebAPI BPS. Gunakan kata kunci spesifik seperti `inflasi`, `industri mikro`, atau `harga pangan`; hindari kalimat panjang.

## Membaca status

- **Data segar**: sinkronisasi terakhir berhasil dan masih berada dalam interval yang dipilih.
- **Perlu diperbarui**: umur data melewati interval.
- **Sedang berjalan**: ingestion sedang mengambil dan memvalidasi data.
- **Gagal**: data lama tidak dihapus; periksa kode kegagalan atau hubungi administrator.
- **Dijeda**: scheduler melewati sumber sampai diaktifkan kembali.

Gunakan **Sinkronkan** untuk mencoba ulang satu sumber. Mengubah interval tidak mengubah isi data; pilihan ini hanya mengatur kapan sumber dianggap jatuh tempo.

## Memeriksa bukti

Setiap dokumen dan seri menyediakan tautan sumber. Periksa judul indikator, wilayah, periode, satuan, catatan metodologi, dan tanggal rilis sebelum memakai data untuk keputusan. Sistem tidak membuat ringkasan AI, prediksi, atau keputusan atas nama pengguna.
