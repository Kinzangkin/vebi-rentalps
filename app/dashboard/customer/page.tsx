import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Gamepad2, CalendarDays, Clock } from 'lucide-react'
import { formatPrice, getStatusColor } from '@/lib/utils/helpers'
import type { PsUnit } from '@/types'

export default async function CustomerDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch available PS units
  const { data: units } = await supabase
    .from('ps_units')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch user's active bookings count
  const { count: activeBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', user.id)
    .in('status', ['pending', 'active'])

  // Fetch user's total bookings count
  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', user.id)

  const availableCount = (units || []).filter((u: PsUnit) => u.status === 'available').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Lihat unit yang tersedia dan lakukan booking.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unit Tersedia</CardTitle>
            <Gamepad2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Booking Aktif</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Booking</CardTitle>
            <CalendarDays className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* PS Units Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Daftar Unit PlayStation</h2>
          <Link href="/dashboard/customer/booking">
            <Button size="sm">Booking Sekarang</Button>
          </Link>
        </div>

        {(!units || units.length === 0) ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Belum ada unit PlayStation yang tersedia.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((unit: PsUnit) => (
              <Card key={unit.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Gamepad2 className="h-16 w-16 text-primary/30" />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{unit.name}</h3>
                      <p className="text-sm text-muted-foreground">{unit.type} &bull; TV {unit.tv_size}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(unit.status)}>
                      {unit.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="font-bold text-primary">{formatPrice(unit.price_per_hour)}<span className="text-xs text-muted-foreground font-normal">/jam</span></p>
                    {unit.status === 'available' && (
                      <Link href={`/dashboard/customer/booking?unit=${unit.id}`}>
                        <Button size="sm" variant="outline">Book</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
