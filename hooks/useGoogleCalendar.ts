import { useState, useCallback } from 'react'
import { useAuth } from '../lib/AuthContext'

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

export interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  attendees?: {
    email: string
    displayName?: string
    responseStatus?: string
  }[]
  htmlLink?: string
  status?: string
}

export interface CreateEventPayload {
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  attendees?: {
    email: string
  }[]
}

export interface FreeBusyTimeSlot {
  start: string
  end: string
}

export function useGoogleCalendar() {
  const { getGoogleAccessToken, isGoogleConnected } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch events from Google Calendar
  const fetchEvents = useCallback(async (
    timeMin: Date,
    timeMax: Date,
    calendarId = 'primary'
  ): Promise<GoogleCalendarEvent[]> => {
    const token = getGoogleAccessToken()
    if (!token) {
      throw new Error('Google Calendar bağlantısı gerekli')
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
      })

      const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Takvim olayları alınamadı')
      }

      const data = await response.json()
      return data.items || []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [getGoogleAccessToken])

  // Create a new event in Google Calendar
  const createEvent = useCallback(async (
    event: CreateEventPayload,
    calendarId = 'primary'
  ): Promise<GoogleCalendarEvent> => {
    const token = getGoogleAccessToken()
    if (!token) {
      throw new Error('Google Calendar bağlantısı gerekli')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Etkinlik oluşturulamadı')
      }

      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [getGoogleAccessToken])

  // Delete an event from Google Calendar
  const deleteEvent = useCallback(async (
    eventId: string,
    calendarId = 'primary'
  ): Promise<void> => {
    const token = getGoogleAccessToken()
    if (!token) {
      throw new Error('Google Calendar bağlantısı gerekli')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Etkinlik silinemedi')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [getGoogleAccessToken])

  // Get free/busy information
  const getFreeBusy = useCallback(async (
    timeMin: Date,
    timeMax: Date,
    calendarId = 'primary'
  ): Promise<FreeBusyTimeSlot[]> => {
    const token = getGoogleAccessToken()
    if (!token) {
      throw new Error('Google Calendar bağlantısı gerekli')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${GOOGLE_CALENDAR_API}/freeBusy`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            items: [{ id: calendarId }],
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Müsaitlik bilgisi alınamadı')
      }

      const data = await response.json()
      return data.calendars?.[calendarId]?.busy || []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [getGoogleAccessToken])

  // Get today's events
  const getTodayEvents = useCallback(async (): Promise<GoogleCalendarEvent[]> => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return fetchEvents(today, tomorrow)
  }, [fetchEvents])

  // Get this week's events
  const getWeekEvents = useCallback(async (): Promise<GoogleCalendarEvent[]> => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    return fetchEvents(today, nextWeek)
  }, [fetchEvents])

  // Create event from booking
  const createEventFromBooking = useCallback(async (booking: {
    client_name: string
    client_email: string
    scheduled_at: string
    duration_minutes: number
    notes?: string
  }): Promise<GoogleCalendarEvent> => {
    const startTime = new Date(booking.scheduled_at)
    const endTime = new Date(startTime.getTime() + (booking.duration_minutes || 30) * 60000)

    return createEvent({
      summary: `Görüşme: ${booking.client_name}`,
      description: booking.notes || `${booking.client_name} ile randevu`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: [
        { email: booking.client_email },
      ],
    })
  }, [createEvent])

  return {
    isConnected: isGoogleConnected,
    loading,
    error,
    fetchEvents,
    createEvent,
    deleteEvent,
    getFreeBusy,
    getTodayEvents,
    getWeekEvents,
    createEventFromBooking,
  }
}
