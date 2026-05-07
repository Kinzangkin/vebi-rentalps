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
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
export type PaymentMethod = 'cash' | 'qris'
export type PaymentStatus = 'unpaid' | 'paid'

export interface Booking {
  id: string
  customer_id: string
  ps_unit_id: string
  start_time: string
  end_time: string
  duration_hours: number
  total_price: number
  status: BookingStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  payment_proof_url: string | null
  notes: string | null
  created_at: string
  // Joined fields
  ps_unit?: PsUnit
  profiles?: Profile
}

export type NotificationType = 'booking_confirmed' | 'booking_started' | 'booking_reminder' | 'booking_completed'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  created_at: string
}
