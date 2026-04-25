'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { Loader2, Send, Bell } from 'lucide-react'
import type { Profile } from '@/types'

export default function AdminNotificationsPage() {
  const supabase = createClient()
  const [customers, setCustomers] = useState<Profile[]>([])
  const [target, setTarget] = useState('all')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchCustomers() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('full_name')

      if (data) setCustomers(data)
    }
    fetchCustomers()
  }, [supabase])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !message) {
      toast.error('Mohon isi judul dan pesan notifikasi')
      return
    }

    setLoading(true)

    if (target === 'all') {
      // Send to all customers
      const notifications = customers.map((c) => ({
        user_id: c.id,
        title,
        message,
        type: 'booking_reminder' as const,
      }))

      const { error } = await supabase.from('notifications').insert(notifications)

      if (error) {
        toast.error('Gagal mengirim notifikasi: ' + error.message)
      } else {
        toast.success(`Notifikasi berhasil dikirim ke ${customers.length} pelanggan!`)
        setTitle('')
        setMessage('')
      }
    } else {
      // Send to specific customer
      const { error } = await supabase.from('notifications').insert({
        user_id: target,
        title,
        message,
        type: 'booking_reminder' as const,
      })

      if (error) {
        toast.error('Gagal mengirim notifikasi: ' + error.message)
      } else {
        toast.success('Notifikasi berhasil dikirim!')
        setTitle('')
        setMessage('')
      }
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kirim Notifikasi</h1>
        <p className="text-muted-foreground">Kirim notifikasi ke pelanggan.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Buat Notifikasi
          </CardTitle>
          <CardDescription>Kirim notifikasi manual ke customer tertentu atau semua customer</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <Label>Penerima</Label>
              <Select value={target} onValueChange={(v) => setTarget(v ?? 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih penerima" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Pelanggan ({customers.length})</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name || 'Unnamed'} — {c.phone || 'No phone'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Promo Akhir Pekan!"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Pesan</Label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis pesan notifikasi..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Mengirim...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Kirim Notifikasi
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
