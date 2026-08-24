# Integrasi data pasar faktual

Integrasi pertama menggunakan WebAPI Badan Pusat Statistik (BPS). Sistem menyimpan metadata dokumen resmi dan jejak sinkronisasinya; sistem tidak membuat ringkasan, prediksi, sentimen, atau keputusan dengan AI.

## Batas semantik

- `market_snapshots` adalah observasi manual workspace dan tidak boleh dilabeli sebagai data BPS.
- `market_source_documents` adalah bukti eksternal berupa berita resmi statistik atau publikasi BPS.
- `market_observations` adalah seri angka eksternal yang tervalidasi dan ditampilkan pada panel Data Statistik Resmi.
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

Model dokumen yang didukung adalah `pressrelease` dan `publication`; domain harus empat digit (`0000` untuk nasional); hanya parameter tersebut yang diterima.

Seri kuantitatif menggunakan binding berikut:

```text
model=data&domain=0000&var=145&th=100&turvar=289&vervar=9999&turth=0
```

`var` dan `th` wajib. `turvar`, `vervar`, dan `turth` bersifat opsional, tetapi parser hanya menerima nilai numerik/rentang yang didokumentasikan BPS. Nilai `datacontent` direkonstruksi dari kombinasi metadata respons. Kunci dimensi yang tidak dapat direkonstruksi, nilai nonnumerik, unit kosong, dan periode yang tidak didukung menyebabkan binding gagal secara tertutup.

## Menjalankan sinkronisasi

Panggil `GET` atau `POST /api/market/ingest/bps` dari scheduler dengan header:

```http
Authorization: Bearer <CRON_SECRET>
```

Endpoint memproses maksimal 25 binding jatuh tempo per eksekusi. Dokumen mengambil maksimal lima halaman. Permintaan BPS mencoba ulang HTTP 429 dan 5xx maksimal tiga kali dengan exponential backoff pendek. Setiap binding menghormati `refresh_interval_minutes`, menghindari duplikasi berdasarkan identitas rekaman, dan menulis hasil ke `market_source_sync_runs`.

Database hanya mengizinkan satu sync run berstatus `running` per binding. Run yang masih berjalan setelah 30 menit ditandai gagal sebagai `INGESTION_STALE_RUN_RECOVERED` sebelum batch berikutnya. Jadwal awal yang disarankan adalah sekali sehari; naikkan frekuensi hanya setelah mengukur kuota dan kebutuhan bisnis.

Respons hanya memuat jumlah binding, dokumen yang ditemukan, dokumen baru, dan binding gagal. Kegagalan disimpan sebagai kode stabil tanpa membocorkan API key atau payload mentah.

## Monitoring dan respons insiden

- `running` lebih dari 30 menit: proses berikutnya memulihkan status secara otomatis.
- `BPS_HTTP_429`: pertahankan interval atau kurangi frekuensi scheduler.
- `BPS_HTTP_5xx`: tunggu layanan BPS pulih; retry internal sudah dibatasi.
- `BPS_RESPONSE_INVALID` atau `BPS_DIMENSION_KEY_UNKNOWN`: nonaktifkan binding dan audit perubahan kontrak API; jangan melonggarkan parser tanpa fixture resmi.
- `accepted_count = 0` dengan status berhasil: normal apabila seluruh rekaman sudah pernah diterima.
- Kegagalan berulang: rotasi key bila dicurigai bocor, periksa portal BPS, kemudian jalankan sinkronisasi manual dari UI.

Log aplikasi hanya boleh berisi kode kegagalan, ID binding internal, hitungan, dan durasi. API key, authorization header, payload mentah, serta URL request yang mengandung `key` dilarang dicatat.

## Checklist smoke test

1. Hubungkan satu produk ke dokumen BPS dan satu seri `model=data`.
2. Jalankan sinkronisasi manual dan pastikan sync run berakhir `succeeded`.
3. Pastikan dokumen memiliki tautan resmi BPS dan observasi memiliki satuan yang benar.
4. Jalankan ulang; `acceptedCount` harus nol untuk data yang sama.
5. Pastikan pengguna workspace lain tidak dapat membaca binding, dokumen, observasi, atau sync run.
6. Uji key tidak valid; UI hanya menampilkan status gagal dan tidak membocorkan token.
7. Jeda binding dan pastikan scheduler tidak memprosesnya.
