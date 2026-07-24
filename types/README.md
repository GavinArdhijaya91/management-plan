# Shared Types

Tempat tipe TypeScript yang digunakan oleh lebih dari satu halaman atau komponen.

Tipe yang hanya digunakan dalam satu file tetap didefinisikan dekat dengan implementasinya agar dependensi tetap sederhana.

Folder ini hanya untuk presentation model dan data demo. Row atau view Supabase
harus diimpor dari `lib/supabase/domain-types.ts`. Model lokal yang bentuknya
berbeda dari database wajib memakai prefix `Demo`.
