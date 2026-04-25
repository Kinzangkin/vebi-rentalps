'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatPrice, calculateTotalPrice } from '@/lib/utils/helpers'
import { toast } from 'react-hot-toast'
import { Loader2, CalendarDays, Gamepad2 } from 'lucide-react'
import type { PsUnit } from '@/types'

export default function BookingPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedUnit = searchParams.get('unit')

  const [units, setUnits] = useState<PsUnit[]>([])
  const [selectedUnit, setSelectedUnit] = useState<string>(preselectedUnit || '')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState<number>(1)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingUnits, setFetchingUnits] = useState(true)

  useEffect(() => {
    async function fetchUnits() {
      const { data } = await supabase
        .from('ps_units')
        .select('*')
        .eq('status', 'available')
        .order('name')

      if (data) setUnits(data)
      setFetchingUnits(false)
    }
    fetchUnits()
  }, [supabase])

  const currentUnit = units.find((u) => u.id === selectedUnit)
  const totalPrice = currentUnit ? calculateTotalPrice(currentUnit.price_per_hour, duration) : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !selectedUnit || !startDate || !startTime) {
      toast.error('Mohon lengkapi semua field')
      return
    }

    setLoading(true)

    const startDateTime = new Date(`${startDate}T${startTime}:00`)
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000)

    const { error } = await supabase.from('bookings').insert({
      customer_id: user.id,
      ps_unit_id: selectedUnit,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      duration_hours: duration,
      total_price: totalPrice,
      notes: notes || null,
      status: 'pending',
    })

    if (error) {
      toast.error('Gagal membuat booking: ' + error.message)
      setLoading(false)
      return
    }

    toast.success('Booking berhasil dibuat! Menunggu konfirmasi admin.')
    router.push('/dashboard/customer/history')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Buat Booking</h1>
        <p className="text-muted-foreground">Pilih unit PlayStation, tentukan waktu, dan konfirmasi.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Form Booking
          </CardTitle>
          <CardDescription>Isi detail booking di bawah ini</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Unit Selection */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unit PlayStation</Label>
              {fetchingUnits ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat unit...
                </div>
              ) : (
                <Select value={selectedUnit} onValueChange={(v) => setSelectedUnit(v ?? '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih unit PS" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} — {unit.type} — {formatPrice(unit.price_per_hour)}/jam
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Tanggal</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Jam Mulai</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Durasi (jam)</Label>
              <Select value={String(duration)} onValueChange={(v) => v && setDuration(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                    <SelectItem key={h} value={String(h)}>
                      {h} jam
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (opsional)</Label>
              <Input
                id="notes"
                placeholder="Contoh: bawa joystick tambahan"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Price Summary */}
            {currentUnit && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Gamepad2 className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold">{currentUnit.name}</p>
                      <p className="text-sm text-muted-foreground">{currentUnit.type} &bull; TV {currentUnit.tv_size}</p>
                    </div>
                  </div>
                  <div className="border-t pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Harga per jam</span>
                      <span>{formatPrice(currentUnit.price_per_hour)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Durasi</span>
                      <span>{duration} jam</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full" disabled={loading || !selectedUnit}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Membuat Booking...
                </>
              ) : (
                'Konfirmasi Booking'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
