Berikut prompt lengkap yang bisa Anda gunakan untuk membangun website Rental PS:

---

## 🎮 PROMPT: Website Rental PlayStation (Next.js + Supabase)

---

### KONTEKS PROYEK
Buatkan aplikasi web lengkap untuk bisnis **Rental PlayStation (PS)** menggunakan **Next.js 14 (App Router)** dan **Supabase** sebagai backend (database, auth, realtime).

---

### TECH STACK
- **Framework:** Next.js
- **Database & Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand atau React Context
- **Form Handling:** React Hook Form + Zod validation
- **Notifikasi:** Supabase Realtime + react-hot-toast

---

### STRUKTUR PENGGUNA & AUTENTIKASI
Gunakan **Supabase Auth** dengan dua role berbeda:

**1. Pelanggan (customer)**
- Register & login dengan email/password
- Profil: nama, nomor HP, alamat
- Redirect ke `/dashboard/customer` setelah login

**2. Admin**
- Login dengan email/password (admin dibuat manual di Supabase)
- Redirect ke `/dashboard/admin` setelah login
- Role disimpan di tabel `profiles` dengan kolom `role: 'customer' | 'admin'`

Buat **middleware Next.js** untuk proteksi route berdasarkan role.

---

### STRUKTUR DATABASE (Supabase)

Buatkan skema SQL berikut:

```sql
-- Profiles (extend auth.users)
profiles (
  id uuid references auth.users primary key,
  full_name text,
  phone text,
  role text default 'customer',
  created_at timestamptz default now()
)

-- Unit PS
ps_units (
  id uuid primary key default gen_random_uuid(),
  name text,              -- contoh: "PS5 - Unit 1"
  type text,              -- 'PS4' | 'PS5'
  tv_size text,           -- contoh: "32 inch"
  status text default 'available', -- 'available' | 'rented' | 'maintenance'
  price_per_hour numeric,
  image_url text,
  created_at timestamptz default now()
)

-- Bookings
bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id),
  ps_unit_id uuid references ps_units(id),
  start_time timestamptz,
  end_time timestamptz,
  duration_hours numeric,
  total_price numeric,
  status text default 'pending', -- 'pending' | 'active' | 'completed' | 'cancelled'
  notes text,
  created_at timestamptz default now()
)

-- Notifications
notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  title text,
  message text,
  type text,   -- 'booking_confirmed' | 'booking_reminder' | 'booking_completed'
  is_read boolean default false,
  created_at timestamptz default now()
)
```

---

### HALAMAN & FITUR YANG DIBUTUHKAN

#### 🌐 Public Pages
- `/` — Landing page: hero section, daftar unit PS tersedia, harga, cara booking, CTA
- `/login` — Form login (customer & admin)
- `/register` — Form registrasi customer

#### 👤 Customer Dashboard (`/dashboard/customer`)
- **Halaman utama:** Lihat semua unit PS dengan status (available/rented)
- **Booking:** Form pilih unit PS → pilih tanggal & jam mulai → pilih durasi → kalkulasi harga otomatis → konfirmasi booking
- **Riwayat Booking:** List semua booking milik customer (filter by status)
- **Notifikasi:** Bell icon dengan badge unread count, dropdown list notifikasi
- **Profil:** Edit nama & nomor HP

#### 🛠️ Admin Dashboard (`/dashboard/admin`)
- **Overview:** Cards statistik — total unit, unit tersewa hari ini, total revenue, booking pending
- **Manajemen Unit PS:** Tabel CRUD unit PS (tambah, edit, hapus, ubah status)
- **Manajemen Booking:** List semua booking, filter by status, tombol approve/cancel/complete booking
- **Notifikasi:** Kirim notifikasi manual ke customer tertentu atau semua customer

---

### LOGIKA BISNIS PENTING

1. **Kalkulasi Harga:** `total_price = duration_hours × price_per_hour` (kalkulasi real-time di form)
2. **Status Unit Otomatis:** Saat booking di-approve → status unit berubah jadi `rented`. Saat completed/cancelled → kembali jadi `available`
3. **Reminder Otomatis:** Kirim notifikasi ke customer 30 menit sebelum waktu sewa habis menggunakan Supabase Realtime atau cron (pg_cron)
4. **Konfirmasi Booking:** Booking baru masuk sebagai `pending` → Admin approve → status jadi `active` → customer dapat notifikasi konfirmasi

---

### NOTIFIKASI (Supabase Realtime)
- Gunakan `supabase.channel()` untuk subscribe perubahan tabel `notifications`
- Tampilkan toast notification real-time saat ada notifikasi baru
- Bell icon di navbar dengan badge jumlah notifikasi yang belum dibaca
- Klik notifikasi → tandai sebagai sudah dibaca

---

### STRUKTUR FOLDER
```
/app
  /(auth)/login/page.tsx
  /(auth)/register/page.tsx
  /dashboard/customer/page.tsx
  /dashboard/admin/page.tsx
  /dashboard/admin/units/page.tsx
  /dashboard/admin/bookings/page.tsx
/components
  /ui/         ← shadcn components
  /customer/   ← komponen khusus customer
  /admin/      ← komponen khusus admin
  /shared/     ← Navbar, NotificationBell, dll
/lib
  /supabase/   ← client, server, middleware helpers
  /hooks/      ← useAuth, useNotifications, useBookings
  /utils/      ← kalkulasi harga, format tanggal
/types/
  index.ts     ← semua TypeScript types
```

---

### TAMBAHAN
- Gunakan **Row Level Security (RLS)** di Supabase: customer hanya bisa lihat data miliknya sendiri
- Semua form harus ada **validasi** menggunakan Zod
- Responsive design — mobile friendly
- Loading skeleton saat fetch data
- Error handling yang informatif ke user
