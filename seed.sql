-- 1. Bersihkan data lama (opsional, hati-hati jika ada data asli)
-- truncate ps_units cascade;
-- truncate bookings cascade;
-- truncate notifications cascade;

-- 2. Masukkan Unit PS (Data Master)
insert into ps_units (name, type, tv_size, price_per_hour, image_url, status)
values 
('PS5 Ultimate Edition - Unit 1', 'PS5', '55 inch 4K HDR', 15000, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=2072&auto=format&fit=crop', 'available'),
('PS5 Digital Edition - Unit 2', 'PS5', '50 inch 4K', 12000, 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=80&w=1854&auto=format&fit=crop', 'available'),
('PS5 - Unit 3 (VIP Room)', 'PS5', '65 inch OLED', 20000, 'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?q=80&w=2070&auto=format&fit=crop', 'available'),
('PS4 Pro - Unit 4', 'PS4', '43 inch Full HD', 8000, 'https://images.unsplash.com/photo-1507457379470-08b8006bc444?q=80&w=2031&auto=format&fit=crop', 'available'),
('PS4 Pro - Unit 5', 'PS4', '43 inch Full HD', 8000, 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?q=80&w=2070&auto=format&fit=crop', 'available'),
('PS4 Slim - Unit 6', 'PS4', '32 inch', 5000, 'https://images.unsplash.com/photo-1544265853-bc4fa637da96?q=80&w=2070&auto=format&fit=crop', 'maintenance');

-- 3. Logika Otomatis untuk Data Booking (Memerlukan minimal 1 user terdaftar)
do $$ 
declare
    v_user_id uuid;
    v_unit_ps5 uuid;
    v_unit_ps4 uuid;
begin
    -- Mengambil user pertama yang terdaftar di tabel profiles
    select id into v_user_id from public.profiles limit 1;
    
    -- Mengambil ID unit untuk contoh booking
    select id into v_unit_ps5 from ps_units where type = 'PS5' limit 1;
    select id into v_unit_ps4 from ps_units where type = 'PS4' limit 1;

    -- Jika user ditemukan, masukkan data simulasi
    if v_user_id is not null then
        
        -- Masukkan Riwayat Booking
        insert into bookings (customer_id, ps_unit_id, start_time, end_time, duration_hours, total_price, status, created_at)
        values 
        -- Booking yang sudah selesai kemarin
        (v_user_id, v_unit_ps4, now() - interval '1 day', now() - interval '1 day' + interval '2 hours', 2, 16000, 'completed', now() - interval '1 day'),
        -- Booking yang sedang aktif sekarang
        (v_user_id, v_unit_ps5, now() - interval '30 minutes', now() + interval '1 hour 30 minutes', 2, 30000, 'active', now() - interval '30 minutes'),
        -- Booking yang masih menunggu persetujuan (pending)
        (v_user_id, v_unit_ps5, now() + interval '5 hours', now() + interval '8 hours', 3, 45000, 'pending', now());

        -- Masukkan Notifikasi simulasi
        insert into notifications (user_id, title, message, type, is_read, created_at)
        values 
        (v_user_id, 'Booking Berhasil!', 'Pesanan PS4 Pro Anda telah selesai.', 'booking_completed', true, now() - interval '1 day'),
        (v_user_id, 'Sesi Dimulai', 'Selamat bermain! Sesi PS5 Anda sedang aktif.', 'booking_confirmed', false, now() - interval '30 minutes'),
        (v_user_id, 'Tagihan Baru', 'Pesanan baru Anda sedang menunggu konfirmasi admin.', 'booking_reminder', false, now());

        -- Update status unit yang sedang disewa menjadi 'rented'
        update ps_units set status = 'rented' where id = v_unit_ps5;
        
        raise notice 'Data simulasi berhasil dimasukkan untuk user ID: %', v_user_id;
    else
        raise notice 'PERINGATAN: Tidak ada user di tabel profiles. Silakan REGISTER dulu di aplikasi baru jalankan skrip ini lagi.';
    end if;
end $$;

-- 4. Instruksi Admin
-- Untuk menjadikan user Anda sebagai ADMIN:
-- Update profiles set role = 'admin' where id = 'ID-USER-ANDA';
