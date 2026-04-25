'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatPrice, formatDateTime, getStatusColor } from '@/lib/utils/helpers'
import { Loader2, Gamepad2, Calendar } from 'lucide-react'
import type { Booking, BookingStatus } from '@/types'

export default function HistoryPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchBookings() {
      if (!user) return

      let query = supabase
        .from('bookings')
        .select('*, ps_unit:ps_units(*)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data } = await query
      if (data) setBookings(data)
      setLoading(false)
    }

    fetchBookings()
  }, [user, filter, supabase])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Booking</h1>
          <p className="text-muted-foreground">Lihat semua booking yang pernah dibuat.</p>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v ?? 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="cancelled">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">Belum ada riwayat booking.</p>
            <a href="/dashboard/customer/booking" className="text-primary text-sm hover:underline mt-2 inline-block">
              Buat booking pertama →
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Gamepad2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{booking.ps_unit?.name || 'Unit PS'}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(booking.start_time)} &mdash; {booking.duration_hours} jam
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:text-right">
                    <div>
                      <p className="font-bold">{formatPrice(booking.total_price)}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
                {booking.notes && (
                  <p className="text-sm text-muted-foreground mt-2 pl-13">
                    Catatan: {booking.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
