# Dokumentasi Siapin

Folder ini berisi spesifikasi desain, panduan Figma, alur pengembangan, dan referensi proyek.

Mulai dari [FIGMA_START_HERE.md](./FIGMA_START_HERE.md) untuk dokumentasi desain atau [GETTING_STARTED.md](./GETTING_STARTED.md) untuk panduan pengembangan.

## Arsitektur dan database

- [Planning domain ERD](./PLANNING_DOMAIN_ERD.md) — relasi kanonik Plan–Goal–Initiative–Action, actual result, review, dan invariannya.
- [Senior review follow-up](./SENIOR_REVIEW_FOLLOW_UP.md) — audit bukti, koreksi asumsi, batas klaim, dan tindak lanjut penilaian eksternal.
- [Database security test matrix](./SECURITY_TEST_MATRIX.md) — cakupan aktor × aset, bukti kontrak pgTAP, dan gap yang masih terbuka.
- [Release and hosting strategy](./RELEASE_AND_HOSTING_STRATEGY.md) — positioning self-hosted, tahapan staging, serta gate aksesibilitas dan operasional.
- [Operational monochrome](./OPERATIONAL_MONOCHROME.md) — arah visual hitam putih, batas warna semantik, dan penerapan berbeda untuk landing serta workspace CRUD.
- [Market data ingestion](./MARKET_DATA_INGESTION.md) — kontrak sumber faktual, integrasi WebAPI BPS, rahasia server, dan proses sinkronisasi.
- [Market data user guide](./MARKET_DATA_USER_GUIDE.md) — memilih sumber, membaca freshness, memeriksa bukti, dan batas interpretasi statistik.

- [Product direction](./PRODUCT_DIRECTION.md) — positioning, core feedback loop, current application coverage, dan urutan vertical slice berikutnya.
- [Database security hardening](./DATABASE_SECURITY_HARDENING.md) — threat model, trust boundary, least privilege, dan definition of done keamanan.
- [Hosted security configuration](./HOSTED_SECURITY_CONFIGURATION.md) — verifikasi read-only Auth hosted dan deployment gate.

- [Domain glossary](./DOMAIN_GLOSSARY.md) — definisi resmi istilah bisnis yang digunakan di UI, kode, API, dan database.
- [Database conventions](./DATABASE_CONVENTIONS.md) — aturan penamaan, RLS, migration, constraint, index, dan checklist review.
- [Data access contract](./DATA_ACCESS_CONTRACT.md) — batas antara row database, reporting view, RPC, dan view-model demo.
- [Database semantic audit](./DATABASE_AUDIT_2026-07-23.md) — temuan ambigu, koreksi migration, compatibility fields, dan batas fitur.
- [Database operations](./DATABASE_OPERATIONS.md) — release, health monitoring, maintenance, backup, restore, dan incident boundary.
- [Stabilization passes II–III](./STABILIZATION_PASSES_2_AND_3.md) — audit integritas relasional, security functions, dan penyelarasan semantik aplikasi.
- [Asset and SEO guide](./ASSET_AND_SEO_GUIDE.md) — metadata, indexing, WebP pipeline, dan keamanan SVG.
- [Contributing](../CONTRIBUTING.md) — alur kontribusi untuk developer dan fork repository.
