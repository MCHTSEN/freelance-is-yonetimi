import { supabase } from './supabase'

export type EmailType = 'booking_confirmation' | 'booking_reminder' | 'booking_cancelled' | 'followup_reminder'

interface EmailData {
  clientName?: string
  clientEmail?: string
  scheduledAt?: string
  meetingType?: string
  notes?: string
  freelancerName?: string
}

/**
 * Send an email using Supabase Edge Function
 *
 * Note: Requires Supabase Edge Function to be deployed:
 * - supabase/functions/send-email/index.ts
 * - RESEND_API_KEY secret set in Supabase dashboard
 */
export async function sendEmail(
  type: EmailType,
  to: string,
  data: EmailData,
  subject?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: result, error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        type,
        subject: subject || getDefaultSubject(type, data),
        data,
      },
    })

    if (error) {
      console.error('Email sending error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Email sending exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'E-posta gönderilemedi'
    }
  }
}

function getDefaultSubject(type: EmailType, data: EmailData): string {
  switch (type) {
    case 'booking_confirmation':
      return `Randevu Onayı - ${data.scheduledAt}`
    case 'booking_reminder':
      return `Randevu Hatırlatması - ${data.scheduledAt}`
    case 'booking_cancelled':
      return 'Randevunuz İptal Edildi'
    case 'followup_reminder':
      return 'Takip Hatırlatması'
    default:
      return 'Freelance OS Bildirimi'
  }
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(booking: {
  client_name: string
  client_email: string
  scheduled_at: string
  meeting_type?: string
  notes?: string
}): Promise<{ success: boolean; error?: string }> {
  const formattedDate = new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(booking.scheduled_at))

  return sendEmail('booking_confirmation', booking.client_email, {
    clientName: booking.client_name,
    clientEmail: booking.client_email,
    scheduledAt: formattedDate,
    meetingType: booking.meeting_type || 'Görüşme',
    notes: booking.notes,
  })
}

/**
 * Send booking reminder email (typically 24h before)
 */
export async function sendBookingReminder(booking: {
  client_name: string
  client_email: string
  scheduled_at: string
}): Promise<{ success: boolean; error?: string }> {
  const formattedDate = new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(booking.scheduled_at))

  return sendEmail('booking_reminder', booking.client_email, {
    clientName: booking.client_name,
    scheduledAt: formattedDate,
  })
}

/**
 * Send booking cancellation email
 */
export async function sendBookingCancellation(booking: {
  client_name: string
  client_email: string
  scheduled_at: string
}): Promise<{ success: boolean; error?: string }> {
  const formattedDate = new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(booking.scheduled_at))

  return sendEmail('booking_cancelled', booking.client_email, {
    clientName: booking.client_name,
    scheduledAt: formattedDate,
  })
}
