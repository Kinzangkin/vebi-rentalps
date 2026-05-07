'use server'

import { createClient } from '@/lib/supabase/server'

interface CreateBookingPayload {
  ps_unit_id: string
  start_time: string
  end_time: string
  duration_hours: number
  total_price: number
  payment_method: 'cash' | 'qris'
  payment_proof_url?: string | null
  notes?: string | null
}

export async function createBooking(payload: CreateBookingPayload) {
  const supabase = await createClient()
  
  // 1. Get user session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: 'Unauthorized. Silakan login kembali.' }
  }

  try {
    // 2. Check for overlaps
    // An overlap occurs if an existing booking starts before the new booking ends
    // AND ends after the new booking starts.
    const { data: overlappingBookings, error: overlapError } = await supabase
      .from('bookings')
      .select('id')
      .eq('ps_unit_id', payload.ps_unit_id)
      .in('status', ['pending', 'confirmed', 'active'])
      .lt('start_time', payload.end_time)
      .gt('end_time', payload.start_time)

    if (overlapError) {
      console.error('Error checking overlaps:', overlapError)
      return { error: 'Gagal memvalidasi jadwal. Silakan coba lagi.' }
    }

    if (overlappingBookings && overlappingBookings.length > 0) {
      return { error: 'Maaf, jadwal ini sudah terisi. Silakan pilih waktu lain.' }
    }

    // 3. Insert booking
    const { error: insertError } = await supabase.from('bookings').insert({
      customer_id: user.id,
      ps_unit_id: payload.ps_unit_id,
      start_time: payload.start_time,
      end_time: payload.end_time,
      duration_hours: payload.duration_hours,
      total_price: payload.total_price,
      payment_method: payload.payment_method,
      payment_status: 'unpaid',
      payment_proof_url: payload.payment_proof_url || null,
      notes: payload.notes || null,
      status: 'pending',
    })

    if (insertError) {
      console.error('Insert booking error:', insertError)
      return { error: 'Terjadi kesalahan saat menyimpan booking: ' + insertError.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Create booking exception:', err)
    return { error: 'Terjadi kesalahan sistem.' }
  }
}
