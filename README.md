# Dashboard Arsip HKI — Bappeda Sleman

> Panel admin terpusat untuk mengelola, menganalisis, dan mengekspor data pengajuan Hak Kekayaan Intelektual (HKI) di lingkungan Bappeda Kabupaten Sleman.

---

## ✨ Fitur Utama

| Kategori | Detail |
|---|---|
| **Otentikasi & Otorisasi** | Login email/password via Supabase Auth, proteksi rute berbasis peran (`admin`), super-admin privilege |
| **Manajemen Data HKI (CRUD)** | Buat, baca, perbarui, dan hapus data HKI dengan validasi Zod, termasuk unggah sertifikat PDF |
| **Tabel Data Modern** | Pencarian, filter multi-kriteria, paginasi sisi server, bulk-delete, dan tampilan responsif (card view di mobile) |
| **Ekspor Data** | Ekspor data terfilter ke **CSV** (streaming) dan **Excel (.xlsx)** dengan batas aman |
| **Laporan & Visualisasi** | Grafik interaktif (bar chart, donut chart) dengan insight otomatis, serta **generate laporan PDF** |
| **Data Master** | CRUD untuk data referensi: Jenis HKI, Kelas HKI, dan Pengusul (OPD) |
| **Manajemen Pengguna** | Tambah, edit, hapus pengguna oleh admin — dilengkapi validasi peran |
| **Real-time Updates** | Tabel HKI otomatis diperbarui saat ada perubahan dari pengguna lain (Supabase Realtime) |
| **Manajemen File Aman** | Upload sertifikat PDF ke Supabase Storage, diakses via signed URL berdurasi terbatas |
| **Health Check** | Endpoint `/api/ping` untuk monitoring ketersediaan koneksi database |

---

## 🛠️ Teknologi

| Layer | Teknologi |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) — App Router + Turbopack |
| Bahasa | [TypeScript](https://www.typescriptlang.org/) |
| Database & Backend | [Supabase](https://supabase.com/) — Auth, PostgreSQL, Storage, Realtime, RPC |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| State Management | [TanStack React Query](https://tanstack.com/query) |
| Formulir & Validasi | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Visualisasi | [Recharts](https://recharts.org/) |
| PDF Generation | [@react-pdf/renderer](https://react-pdf.org/) |
| Ekspor Spreadsheet | [ExcelJS](https://github.com/exceljs/exceljs) |
| Animasi | [Framer Motion](https://www.framer.com/motion/) |

---

## 🚀 Panduan Instalasi

### Prasyarat

- **Node.js** ≥ 18
- **npm** ≥ 9
- Proyek **Supabase** yang sudah dikonfigurasi

### 1. Konfigurasi Environment

Salin `.env.example` → `.env.local`, lalu isi dengan kredensial Supabase:

```env
# URL proyek Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxx.supabase.co"

# Kunci Anon (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"

# Kunci Service Role (hanya untuk operasi server-side)
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# Email Super Admin (opsional)
SUPER_ADMIN_EMAIL="super.admin@example.com"
```

### 2. Konfigurasi Supabase

| Komponen | Konfigurasi |
|---|---|
| **Tabel** | `hki`, `pemohon`, `pengusul`, `jenis_hki`, `status_hki`, `kelas_hki`, `profiles` |
| **RLS** | Aktifkan Row Level Security pada semua tabel; buat policy `ALL` untuk peran `admin` |
| **Trigger** | Buat fungsi `handle_new_user` untuk sinkronisasi `auth.users` → `public.profiles` |
| **RPC** | Buat fungsi `get_hki_report_summary` dan `get_form_options` untuk agregasi server-side |
| **Storage** | Buat bucket `sertifikat-hki` (private); policy: hanya admin yang boleh `insert` dan `select` |
| **Realtime** | Aktifkan Realtime pada tabel `hki` |

### 3. Instalasi & Jalankan

```bash
npm install
npm run dev
```

Aplikasi tersedia di `http://localhost:3000`.

### Skrip yang Tersedia

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan development server (Turbopack) |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan build produksi |
| `npm run lint` | Menjalankan ESLint |
| `npm run lint:fix` | Memperbaiki masalah ESLint secara otomatis |
| `npm run type-check` | Validasi tipe TypeScript |
| `npm run check` | Menjalankan lint + type-check + build sekaligus |
| `npm run format` | Format kode dengan Prettier |

---

## 📂 Struktur Proyek

```
├── app/
│   ├── layout.tsx                        # Root layout (font, providers, toaster)
│   ├── page.tsx                          # Root page — redirect ke /dashboard
│   ├── providers.tsx                     # QueryClientProvider wrapper
│   ├── globals.css                       # Variabel tema & style global
│   ├── login/                            # Halaman login
│   ├── dashboard/
│   │   ├── layout.tsx                    # Layout admin (sidebar, topbar, auth guard)
│   │   ├── page.tsx                      # Halaman utama — statistik & ringkasan
│   │   ├── data-pengajuan-fasilitasi/    # Modul utama CRUD HKI
│   │   ├── data-master/                  # CRUD data referensi (jenis, kelas, pengusul)
│   │   ├── laporan/                      # Halaman laporan & visualisasi
│   │   ├── manajemen-pengguna/           # Manajemen pengguna (admin only)
│   │   └── pengaturan/                   # Halaman pengaturan profil
│   ├── actions/                          # Server Actions (auth, hki bulk-delete)
│   ├── services/                         # Service layer (hki-service)
│   └── api/
│       ├── hki/                          # CRUD, ekspor, signed-url, status update
│       ├── laporan/hki/pdf/              # Generate laporan PDF
│       ├── master/                       # Endpoint data master
│       ├── users/                        # CRUD pengguna
│       └── ping/                         # Health check endpoint
│
├── components/
│   ├── ui/                               # Komponen shadcn/ui (button, dialog, table, dll.)
│   ├── hki/                              # Data table, modals (create, edit, view)
│   ├── forms/                            # HKI form, file uploader
│   ├── laporan/                          # Charts, insight cards, filter, PDF button
│   ├── layout/                           # Admin layout, sidebar, topbar, footer
│   ├── auth/                             # Logout button
│   └── dashboard/                        # Stat cards, chart widgets
│
├── hooks/
│   ├── use-debounce.ts                   # Debounce input pencarian
│   ├── use-hki-entry.ts                  # Fetch single HKI entry (React Query)
│   ├── use-media-query.ts                # Deteksi breakpoint responsif
│   └── useHkiRealtime.ts                 # Supabase Realtime subscription
│
├── lib/
│   ├── types.ts                          # Tipe TypeScript global (HKIEntry, FormOptions, dll.)
│   ├── database.types.ts                 # Tipe auto-generated Supabase + RPC overrides
│   ├── utils.ts                          # Utility (cn class merger)
│   ├── supabase-browser.ts               # Supabase client (browser/client component)
│   ├── auth/server.ts                    # Helper otorisasi admin (server-side)
│   └── reports/                          # Laporan: types, service, insights, PDF template
│
├── utils/supabase/
│   ├── server.ts                         # Supabase client (RSC, Server Actions, API Routes)
│   └── middleware.ts                     # Session refresh logic (digunakan oleh proxy.ts)
│
├── proxy.ts                              # Next.js 16 proxy — refresh Supabase session cookies
├── next.config.js                        # Konfigurasi Next.js
├── tailwind.config.ts                    # Konfigurasi Tailwind CSS
├── postcss.config.cjs                    # Konfigurasi PostCSS
├── tsconfig.json                         # Konfigurasi TypeScript
└── eslint.config.js                      # Konfigurasi ESLint (flat config)
```

---

## 🏗️ Arsitektur & Prinsip

### Pemisahan Server vs Client

- **React Server Components (RSC)** digunakan untuk data fetching awal (layout, halaman), dibungkus `React.cache` agar query hanya dieksekusi sekali per request.
- **Client Components** (`'use client'`) digunakan untuk interaktivitas — form, tabel, modal, chart.

### Data Fetching Strategy

| Data | Strategi | Contoh |
|---|---|---|
| Opsi filter & data master | RSC + `React.cache` | `getFormOptions()` di halaman server |
| Tabel HKI (dinamis) | React Query (`useQuery`) | `hki-client-page.tsx` — caching, refetch, optimistic UI |
| Laporan & agregasi | RPC Supabase → RSC | `getHKIReportSummary()` via database function |
| Mutasi data | React Query (`useMutation`) + Server Actions | Optimistic update + rollback on error |

### Optimasi Performa

- **`React.lazy` + `Suspense`** untuk lazy-load modal berat (form HKI, view modal)
- **`dynamic()` import** dari Next.js untuk code splitting komponen klien
- **Debounced search** (400ms) untuk mengurangi query saat mengetik
- **Throttled Realtime** (1.5s debounce) untuk mencegah spam invalidation
- **Streaming CSV** untuk ekspor data besar tanpa memory spike
- **`optimizePackageImports`** untuk tree-shaking `lucide-react`, `recharts`, `date-fns`

### Keamanan

- Semua route dashboard dilindungi oleh `proxy.ts` (session refresh) dan auth guard di `layout.tsx`
- Row Level Security (RLS) aktif di semua tabel Supabase
- File sertifikat hanya dapat diakses via **signed URL** dengan masa berlaku terbatas (300 detik)
- Operasi sensitif (hapus user, bulk-delete) memerlukan verifikasi peran `admin` di server-side

---

## 📄 Lisensi

Hak Cipta © 2025 Bappeda Sleman. Seluruh hak dilindungi.
