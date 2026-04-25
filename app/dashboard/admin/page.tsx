import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Gamepad2, CalendarDays, DollarSign, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils/helpers'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Total units
  const { count: totalUnits } = await supabase
    .from('ps_units')
    .select('*', { count: 'exact', head: true })

  // Rented units today
  const { count: rentedToday } = await supabase
    .from('ps_units')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rented')

  // Pending bookings
  const { count: pendingBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Total revenue (from completed bookings)
  const { data: revenueData } = await supabase
    .from('bookings')
    .select('total_price')
    .eq('status', 'completed')

  const totalRevenue = (revenueData || []).reduce(
    (sum: number, b: { total_price: number }) => sum + (b.total_price || 0),
    0
  )

  // Recent bookings
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('*, ps_unit:ps_units(name, type), profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    {
      title: 'Total Unit',
      value: totalUnits || 0,
      icon: Gamepad2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Sedang Disewa',
      value: rentedToday || 0,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Booking Pending',
      value: pendingBookings || 0,
      icon: CalendarDays,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">Ringkasan operasional rental PlayStation.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {(!recentBookings || recentBookings.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada booking.</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Gamepad2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{booking.profiles?.full_name || 'Customer'}</p>
                      <p className="text-xs text-muted-foreground">{booking.ps_unit?.name} &bull; {booking.ps_unit?.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatPrice(booking.total_price)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{booking.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
