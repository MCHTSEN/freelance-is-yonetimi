import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Booking, BookingInsert, AvailabilitySettings } from '../lib/supabase'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface WorkingHours {
  start: string
  end: string
}

export interface WorkingHoursMap {
  mon: WorkingHours | null
  tue: WorkingHours | null
  wed: WorkingHours | null
  thu: WorkingHours | null
  fri: WorkingHours | null
  sat: WorkingHours | null
  sun: WorkingHours | null
}

export interface TimeSlot {
  time: string
  available: boolean
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availability, setAvailability] = useState<AvailabilitySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('scheduled_at', { ascending: true })

      if (error) throw error
      setBookings(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAvailability = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('availability_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setAvailability(data)
    } catch (err) {
      console.error('Availability fetch error:', err)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
    fetchAvailability()
  }, [fetchBookings, fetchAvailability])

  // Create a new booking (public - no auth required)
  const createBooking = async (booking: Omit<BookingInsert, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single()

    if (error) throw error
    setBookings(prev => [...prev, data])
    return data
  }

  // Update booking status
  const updateBookingStatus = async (id: string, status: BookingStatus) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setBookings(prev => prev.map(b => b.id === id ? data : b))
    return data
  }

  // Cancel a booking
  const cancelBooking = async (id: string) => {
    return updateBookingStatus(id, 'cancelled')
  }

  // Confirm a booking
  const confirmBooking = async (id: string) => {
    return updateBookingStatus(id, 'confirmed')
  }

  // Complete a booking
  const completeBooking = async (id: string) => {
    return updateBookingStatus(id, 'completed')
  }

  // Delete a booking
  const deleteBooking = async (id: string) => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) throw error
    setBookings(prev => prev.filter(b => b.id !== id))
  }

  // Get availability settings for a user (public - for booking page)
  const getAvailabilityForUser = async (userId: string) => {
    const { data, error } = await supabase
      .from('availability_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Save availability settings
  const saveAvailability = async (settings: Partial<AvailabilitySettings>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı')

    const { data, error } = await supabase
      .from('availability_settings')
      .upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    setAvailability(data)
    return data
  }

  // Get available time slots for a specific date and user
  const getAvailableSlots = async (userId: string, date: Date): Promise<TimeSlot[]> => {
    // Get user's availability settings
    const availabilitySettings = await getAvailabilityForUser(userId)

    // Get existing bookings for that date
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('scheduled_at, duration_minutes')
      .eq('user_id', userId)
      .gte('scheduled_at', startOfDay.toISOString())
      .lte('scheduled_at', endOfDay.toISOString())
      .neq('status', 'cancelled')

    // Determine working hours for the day
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
    const dayName = dayNames[date.getDay()]

    const workingHours = availabilitySettings?.working_hours as WorkingHoursMap | null
    const dayHours = workingHours?.[dayName]

    if (!dayHours) {
      return [] // Not a working day
    }

    // Generate time slots
    const slots: TimeSlot[] = []
    const [startHour, startMin] = dayHours.start.split(':').map(Number)
    const [endHour, endMin] = dayHours.end.split(':').map(Number)
    const duration = availabilitySettings?.default_duration || 30
    const buffer = availabilitySettings?.buffer_minutes || 15

    let currentTime = new Date(date)
    currentTime.setHours(startHour, startMin, 0, 0)

    const endTime = new Date(date)
    endTime.setHours(endHour, endMin, 0, 0)

    while (currentTime < endTime) {
      const slotTime = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`

      // Check if slot is available (not overlapping with existing bookings)
      const slotStart = new Date(currentTime)
      const slotEnd = new Date(currentTime.getTime() + duration * 60000)

      const isBooked = (existingBookings || []).some(booking => {
        const bookingStart = new Date(booking.scheduled_at)
        const bookingEnd = new Date(bookingStart.getTime() + (booking.duration_minutes || 30) * 60000)

        // Check for overlap
        return (slotStart < bookingEnd && slotEnd > bookingStart)
      })

      // Check if slot is in the past
      const isPast = slotStart < new Date()

      slots.push({
        time: slotTime,
        available: !isBooked && !isPast
      })

      // Move to next slot (duration + buffer)
      currentTime = new Date(currentTime.getTime() + (duration + buffer) * 60000)
    }

    return slots
  }

  // Get upcoming bookings
  const getUpcomingBookings = useCallback(() => {
    const now = new Date()
    return bookings.filter(b =>
      new Date(b.scheduled_at) > now &&
      b.status !== 'cancelled' &&
      b.status !== 'completed'
    )
  }, [bookings])

  // Get today's bookings
  const getTodayBookings = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return bookings.filter(b => {
      const bookingDate = new Date(b.scheduled_at)
      return bookingDate >= today && bookingDate < tomorrow
    })
  }, [bookings])

  // Get bookings by status
  const getBookingsByStatus = useCallback((status: BookingStatus) => {
    return bookings.filter(b => b.status === status)
  }, [bookings])

  return {
    bookings,
    availability,
    loading,
    error,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    confirmBooking,
    completeBooking,
    deleteBooking,
    getAvailabilityForUser,
    saveAvailability,
    getAvailableSlots,
    getUpcomingBookings,
    getTodayBookings,
    getBookingsByStatus,
    refetch: fetchBookings,
  }
}
