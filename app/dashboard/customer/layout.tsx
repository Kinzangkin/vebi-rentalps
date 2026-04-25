import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Gamepad2, CalendarDays, User, LayoutDashboard } from 'lucide-react'
import NotificationBell from '@/components/shared/NotificationBell'

const customerLinks = [
  { href: '/dashboard/customer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/customer/booking', label: 'Booking', icon: CalendarDays },
  { href: '/dashboard/customer/history', label: 'Riwayat', icon: Gamepad2 },
  { href: '/dashboard/customer/profile', label: 'Profil', icon: User },
]

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card p-4 gap-1">
        <div className="mb-6 px-3">
          <p className="text-sm text-muted-foreground">Selamat datang,</p>
          <p className="font-semibold truncate">{profile?.full_name || user.email}</p>
        </div>
        {customerLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
        <div className="flex items-center justify-around py-2">
          {customerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-end p-4 border-b gap-3">
          <NotificationBell />
        </div>
        <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </div>
      </div>
    </div>
  )
}
