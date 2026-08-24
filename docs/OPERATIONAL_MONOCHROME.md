# Operational Monochrome

Operational Monochrome adalah arah visual Siapin untuk aplikasi manajemen bisnis berbasis CRUD. Sistem ini memakai off-white, graphite, garis struktural, IBM Plex Sans, dan IBM Plex Mono agar data mudah dipindai tanpa terlihat seperti dashboard trading atau template SaaS generik.

## Design read

- Produk: workspace manajemen bisnis dan proyek untuk UMKM.
- Pengguna: pemilik usaha dan tim operasional, termasuk pengguna nonteknis.
- Mode: redesign-preserve. Information architecture, route, istilah navigasi, dan urutan form tetap stabil.
- Dial: `DESIGN_VARIANCE 4`, `MOTION_INTENSITY 2`, `VISUAL_DENSITY 7`.
- Fondasi: Tailwind CSS yang sudah dimiliki proyek. Tidak menambahkan design system kedua.

## Insight dari taste skill

Skill taste-design berfokus pada landing page dan redesign, bukan dashboard atau data table. Karena itu, prinsipnya diterapkan secara selektif:

- Audit sebelum redesign dipakai untuk menjaga route, aksesibilitas, dan alur kerja.
- Tipografi, ritme, contrast, radius, empty state, dan tactile feedback berlaku di semua permukaan.
- Variasi layout hanya dipakai pada landing page.
- Dashboard mengutamakan alignment, densitas, dan keterbandingan data.
- Motion hanya menjelaskan feedback atau perubahan state. Konten tidak boleh tersembunyi ketika JavaScript belum siap.
- Kartu dipakai saat sebuah area memang merupakan objek atau konteks mandiri. Daftar dan metrik lebih sering memakai divider serta whitespace.

## Token visual

- Background utama: `#f7f7f5`.
- Surface: `#fcfcfb`.
- Foreground: `#18181b`.
- Primary action: zinc-950 dengan teks off-white.
- Border: neutral zinc dengan kontras rendah tetapi terlihat.
- Radius dasar: 10px. Panel, input, tombol, dan menu memakai keluarga radius yang sama.
- Angka finansial, persentase, waktu, serta identifier memakai IBM Plex Mono dan tabular numerals.

## Batas monokrom

Monokrom bukan berarti menghapus makna status. Warna boleh digunakan untuk informasi yang memang memiliki konsekuensi operasional:

- Merah: error, destructive action, atau kondisi kritis.
- Amber: risiko, overdue, atau perhatian.
- Hijau: sukses atau status sehat yang terverifikasi.
- Biru: status proses aktif hanya jika tidak dapat dibedakan dengan label dan bentuk.

Warna status harus selalu disertai teks atau ikon. Warna tidak digunakan untuk dekorasi, CTA umum, navigasi aktif, logo, atau grafik yang tidak membutuhkan pemisahan seri.

## Landing dan workspace

Landing page boleh memakai komposisi split, headline lebih besar, dan satu panel produk nyata. Hero tidak memakai typewriter, glow, gradient text, scroll cue, atau angka palsu sebagai dekorasi.

Workspace memakai sidebar tetap, header ringkas, judul 40px maksimum, tabel padat, dan action yang stabil posisinya. CRUD harus memperlihatkan loading, empty, error, success, disabled, dan destructive state secara eksplisit.

## Larangan

- Glassmorphism dan blur dekoratif pada area data.
- Bento tanpa fungsi bisnis.
- Serif dekoratif untuk heading dashboard.
- Shadow berat pada setiap card.
- Pill untuk semua label.
- Animasi perpetual pada angka dan grafik.
- Warna aksen berbeda pada setiap modul.
- Mengubah route, field name, atau label navigasi hanya demi estetika.
