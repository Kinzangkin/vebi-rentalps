'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatPrice, formatDateTime, getStatusColor } from '@/lib/utils/helpers'
import { toast } from 'react-hot-toast'
import { Loader2, Check, X, CheckCircle2, CalendarDays } from 'lucide-react'
import type { Booking } from '@/types'

export default function AdminBookingsPage() {
  const supabase = createClient()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [processing, setProcessing] = useState<string | null>(null)

  async function fetchBookings() {
    let query = supabase
      .from('bookings')
      .select('*, ps_unit:ps_units(name, type), profiles(full_name, phone)')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query
    if (data) setBookings(data)
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    fetchBookings()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function updateBookingStatus(bookingId: string, newStatus: string, unitId: string) {
    setProcessing(bookingId)

    // Update booking status
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)

    if (error) {
      toast.error('Gagal mengubah status: ' + error.message)
      setProcessing(null)
      return
    }

    // Update unit status accordingly
    if (newStatus === 'active') {
      await supabase.from('ps_units').update({ status: 'rented' }).eq('id', unitId)
    } else if (newStatus === 'completed' || newStatus === 'cancelled') {
      await supabase.from('ps_units').update({ status: 'available' }).eq('id', unitId)
    }

    // Find the booking to get customer ID for notification
    const booking = bookings.find((b) => b.id === bookingId)
    if (booking) {
      let notifTitle = ''
      let notifMessage = ''
      let notifType = ''

      if (newStatus === 'active') {
        notifTitle = 'Booking Dikonfirmasi!'
        notifMessage = `Booking Anda untuk ${booking.ps_unit?.name} telah dikonfirmasi. Selamat bermain!`
        notifType = 'booking_confirmed'
      } else if (newStatus === 'completed') {
        notifTitle = 'Booking Selesai'
        notifMessage = `Booking Anda untuk ${booking.ps_unit?.name} telah selesai. Terima kasih!`
        notifType = 'booking_completed'
      } else if (newStatus === 'cancelled') {
        notifTitle = 'Booking Dibatalkan'
        notifMessage = `Booking Anda untuk ${booking.ps_unit?.name} telah dibatalkan oleh admin.`
        notifType = 'booking_completed'
      }

      if (notifTitle) {
        await supabase.from('notifications').insert({
          user_id: booking.customer_id,
          title: notifTitle,
          message: notifMessage,
          type: notifType,
        })
      }
    }

    toast.success(`Booking berhasil diubah ke ${newStatus}`)
    setProcessing(null)
    fetchBookings()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Booking</h1>
          <p className="text-muted-foreground">Kelola semua booking pelanggan.</p>
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

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <p>Belum ada booking.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.profiles?.full_name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{booking.profiles?.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{booking.ps_unit?.name}</p>
                      <p className="text-xs text-muted-foreground">{booking.ps_unit?.type}</p>
                    </TableCell>
                    <TableCell className="text-sm">{formatDateTime(booking.start_time)}</TableCell>
                    <TableCell>{booking.duration_hours} jam</TableCell>
                    <TableCell className="font-semibold">{formatPrice(booking.total_price)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              disabled={processing === booking.id}
                              onClick={() => updateBookingStatus(booking.id, 'active', booking.ps_unit_id)}
                              title="Approve"
                            >
                              {processing === booking.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-red-50"
                              disabled={processing === booking.id}
                              onClick={() => updateBookingStatus(booking.id, 'cancelled', booking.ps_unit_id)}
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {booking.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            disabled={processing === booking.id}
                            onClick={() => updateBookingStatus(booking.id, 'completed', booking.ps_unit_id)}
                            title="Complete"
                          >
                            {processing === booking.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
