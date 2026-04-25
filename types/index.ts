export type UserRole = 'customer' | 'admin'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: UserRole
  created_at: string
}

export type PsUnitStatus = 'available' | 'rented' | 'maintenance'
export type PsUnitType = 'PS4' | 'PS5'

export interface PsUnit {
  id: string
  name: string
  type: PsUnitType
  tv_size: string
  status: PsUnitStatus
  price_per_hour: number
  image_url: string | null
  created_at: string
}

export type BookingStatus = 'pending' | 'active' | 'completed' | 'cancelled'

export interface Booking {
  id: string
  customer_id: string
  ps_unit_id: string
  start_time: string
  end_time: string
  duration_hours: number
  total_price: number
  status: BookingStatus
  notes: string | null
  created_at: string
  // Joined fields
  ps_unit?: PsUnit
  profiles?: Profile
}

export type NotificationType = 'booking_confirmed' | 'booking_reminder' | 'booking_completed'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  created_at: string
}
