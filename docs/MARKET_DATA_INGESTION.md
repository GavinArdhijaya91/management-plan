# Integrasi data pasar faktual

Integrasi pertama menggunakan WebAPI Badan Pusat Statistik (BPS). Sistem menyimpan metadata dokumen resmi dan jejak sinkronisasinya; sistem tidak membuat ringkasan, prediksi, sentimen, atau keputusan dengan AI.

## Batas semantik

- `market_snapshots` adalah observasi manual workspace dan tidak boleh dilabeli sebagai data BPS.
- `market_source_documents` adalah bukti eksternal berupa berita resmi statistik atau publikasi BPS.
- Dokumen BPS menjadi bahan telaah manusia. Kehadirannya tidak otomatis membuktikan perubahan permintaan suatu produk.
- Angka statistik dinamis belum diingest pada tahap ini. Adapter baru boleh ditambahkan setelah dimensi, unit, periode, wilayah, dan tabel asal dapat divalidasi tanpa menebak struktur data.

Referensi resmi: [Dokumentasi WebAPI BPS](https://webapi.bps.go.id/documentation/).

## Konfigurasi

Tambahkan rahasia berikut hanya pada environment server/deployment:

```dotenv
BPS_API_KEY=token-dari-webapi-bps
CRON_SECRET=rahasia-acak-minimal-32-karakter
SUPABASE_SECRET_KEY=sb_secret_...
```

Jangan menaruh nilai asli di `.env.example`, browser, database, log, atau URL bukti. `SUPABASE_SECRET_KEY` melewati RLS dan hanya boleh dipakai oleh endpoint ingestion.

Anggota dengan izin `market.write` menghubungkan produk pada halaman `/tren-pasar`. Nilai `external_identifier` disimpan sebagai query string tervalidasi:

```text
model=pressrelease&domain=0000&keyword=inflasi
```

Model yang didukung adalah `pressrelease` dan `publication`; domain harus empat digit (`0000` untuk nasional); hanya parameter tersebut yang diterima.

## Menjalankan sinkronisasi

Panggil `GET` atau `POST /api/market/ingest/bps` dari scheduler dengan header:

```http
Authorization: Bearer <CRON_SECRET>
```

Endpoint mengambil maksimal lima halaman untuk tiap binding aktif, menghindari duplikasi berdasarkan ID rekaman BPS, dan menulis hasil setiap proses ke `market_source_sync_runs`. Jadwal awal yang disarankan adalah sekali sehari; naikkan frekuensi hanya setelah mengukur kuota dan kebutuhan bisnis.

Respons hanya memuat jumlah binding, dokumen yang ditemukan, dokumen baru, dan binding gagal. Kegagalan disimpan sebagai kode stabil tanpa membocorkan API key atau payload mentah.
