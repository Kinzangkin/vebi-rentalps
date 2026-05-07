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
import { createBooking } from './actions'

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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('cash')
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchingUnits, setFetchingUnits] = useState(true)

  useEffect(() => {
    async function fetchUnits() {
      const { data } = await supabase
        .from('ps_units')
        .select('*')
        .neq('status', 'maintenance')
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

    let paymentProofUrl = null

    if (paymentMethod === 'qris') {
      if (!paymentFile) {
        toast.error('Mohon upload bukti pembayaran QRIS')
        setLoading(false)
        return
      }

      const fileExt = paymentFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, paymentFile)

      if (uploadError) {
        toast.error('Gagal mengupload bukti pembayaran. Pastikan admin sudah membuat bucket payment-proofs.')
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName)

      paymentProofUrl = publicUrl
    }

    const res = await createBooking({
      ps_unit_id: selectedUnit,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      duration_hours: duration,
      total_price: totalPrice,
      payment_method: paymentMethod,
      payment_proof_url: paymentProofUrl,
      notes: notes,
    })

    if (res.error) {
      toast.error(res.error)
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

            {/* Payment Method */}
            <div className="space-y-3 pt-2">
              <Label>Metode Pembayaran</Label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer text-center transition-colors ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <p className="font-semibold">Bayar di Tempat</p>
                  <p className="text-xs text-muted-foreground mt-1">Cash</p>
                </div>
                <div
                  className={`border rounded-lg p-4 cursor-pointer text-center transition-colors ${paymentMethod === 'qris' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                  onClick={() => setPaymentMethod('qris')}
                >
                  <p className="font-semibold">QRIS</p>
                  <p className="text-xs text-muted-foreground mt-1">Non-Tunai</p>
                </div>
              </div>

              {paymentMethod === 'qris' && (
                <div className="mt-4 p-5 border rounded-lg bg-muted/20 space-y-5">
                  <div className="text-center space-y-3">
                    <p className="text-sm font-medium">Scan QR Code di bawah ini</p>
                    <div className="flex justify-center bg-white p-4 rounded-lg w-fit mx-auto shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RentalPS_Total_${totalPrice}`} 
                        alt="QRIS" 
                        className="w-40 h-40" 
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Tagihan: <span className="font-bold text-foreground">{formatPrice(totalPrice)}</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_proof">Upload Bukti Transfer</Label>
                    <Input
                      id="payment_proof"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                      required={paymentMethod === 'qris'}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              )}
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
