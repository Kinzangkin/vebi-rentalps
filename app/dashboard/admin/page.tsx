import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Gamepad2, CalendarDays, DollarSign, Clock, LayoutDashboard, Activity } from 'lucide-react'
import { formatPrice } from '@/lib/utils/helpers'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { count: totalUnits } = await supabase
    .from('ps_units')
    .select('*', { count: 'exact', head: true })

  const { count: rentedToday } = await supabase
    .from('ps_units')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rented')

  const { count: pendingBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { data: revenueData } = await supabase
    .from('bookings')
    .select('total_price')
    .eq('status', 'completed')

  const totalRevenue = (revenueData || []).reduce(
    (sum: number, b: { total_price: number }) => sum + (b.total_price || 0),
    0
  )

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
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Sedang Disewa',
      value: rentedToday || 0,
      icon: Clock,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      title: 'Booking Pending',
      value: pendingBookings || 0,
      icon: CalendarDays,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ]

  return (
    <div className="space-y-10 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-2 text-lg">Kelola operasional rental Anda dengan mudah.</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-2xl">
          <Activity className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="glass p-6 rounded-[2rem] hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live Status</span>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.title}</p>
            <p className="text-3xl font-black mt-1 text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-blue-600" />
              Booking Terbaru
            </h2>
            <button className="text-sm font-bold text-blue-600 hover:underline">Lihat Semua</button>
          </div>
          
          <div className="glass rounded-[2rem] overflow-hidden">
            {(!recentBookings || recentBookings.length === 0) ? (
              <div className="p-20 text-center text-gray-400 font-medium">Belum ada booking masuk.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-[#00439c]">
                        {booking.profiles?.full_name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{booking.profiles?.full_name || 'Customer'}</p>
                        <p className="text-sm text-gray-500">{booking.ps_unit?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#00439c]">{formatPrice(booking.total_price)}</p>
                      <Badge variant="outline" className="mt-1 border-none bg-blue-50 text-blue-600 font-bold text-[10px] uppercase px-3">
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-4">
             {[
               { label: 'Tambah Unit PS', icon: Gamepad2, color: 'bg-blue-600' },
               { label: 'Kelola Jadwal', icon: CalendarDays, color: 'bg-pink-600' },
             ].map((action, i) => (
               <button key={i} className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group">
                 <div className={`p-3 rounded-xl ${action.color} text-white group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5" />
                 </div>
                 <span className="font-bold text-gray-700">{action.label}</span>
               </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}
