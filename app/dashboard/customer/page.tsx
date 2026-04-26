import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Gamepad2, CalendarDays, Clock, Star } from 'lucide-react'
import { formatPrice, getStatusColor } from '@/lib/utils/helpers'
import type { PsUnit } from '@/types'

export default async function CustomerDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: units } = await supabase
    .from('ps_units')
    .select('*')
    .order('created_at', { ascending: false })

  const { count: activeBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', user.id)
    .in('status', ['pending', 'active'])

  const availableCount = (units || []).filter((u: PsUnit) => u.status === 'available').length

  return (
    <div className="space-y-10 py-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Halo, {user.email?.split('@')[0]}!</h1>
          <p className="text-gray-500 mt-2 text-lg">Siap untuk petualangan baru hari ini?</p>
        </div>
        <div className="flex gap-3">
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Tersedia</p>
              <p className="text-xl font-bold">{availableCount} Unit</p>
            </div>
          </div>
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Aktif</p>
              <p className="text-xl font-bold">{activeBookings || 0} Sewa</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500 fill-current" />
            <h2 className="text-2xl font-bold">Katalog PlayStation</h2>
          </div>
          <Link href="/dashboard/customer/history">
            <Button variant="ghost" className="text-blue-600 font-bold hover:text-blue-700">
              Lihat Riwayat <CalendarDays className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {(!units || units.length === 0) ? (
          <div className="glass py-20 text-center rounded-[2rem]">
            <div className="mb-4 inline-flex p-4 bg-gray-50 rounded-full">
               <Gamepad2 className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-lg">Belum ada unit PlayStation yang tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {units.map((unit: PsUnit) => (
              <div key={unit.id} className="group relative">
                <div className="absolute -inset-1 bg-linear-to-r from-[#00439c] to-[#0070d1] rounded-[2.5rem] opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                <Card className="relative h-full overflow-hidden border-none rounded-[2rem] shadow-xl shadow-black/5 hover:shadow-2xl transition-all duration-500">
                  <div className="relative h-56 overflow-hidden">
                    {unit.image_url ? (
                      <img 
                        src={unit.image_url} 
                        alt={unit.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Gamepad2 className="w-20 h-20 text-gray-200" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge className={`px-4 py-1.5 rounded-full border-none font-bold uppercase tracking-wider text-[10px] shadow-lg ${
                        unit.status === 'available' ? 'bg-emerald-500 text-white' : 
                        unit.status === 'rented' ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white'
                      }`}>
                        {unit.status}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="glass px-3 py-1 rounded-full text-xs font-bold text-gray-800">
                        {unit.type}
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{unit.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <span className="font-semibold text-gray-700">Layar:</span> {unit.tv_size}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Harga</p>
                        <p className="text-2xl font-black text-[#00439c]">
                          {formatPrice(unit.price_per_hour)}
                          <span className="text-xs text-gray-400 font-medium">/jam</span>
                        </p>
                      </div>
                      
                      {unit.status === 'available' ? (
                        <Link href={`/dashboard/customer/booking?unit=${unit.id}`}>
                          <Button className="bg-[#00439c] hover:bg-[#00367d] rounded-2xl px-6 h-12 font-bold shadow-lg shadow-blue-600/20">
                            Book Now
                          </Button>
                        </Link>
                      ) : (
                        <Button disabled variant="outline" className="rounded-2xl px-6 h-12 font-bold border-2">
                          Reserved
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
