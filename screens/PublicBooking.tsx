import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface TimeSlot {
  time: string
  available: boolean
}

interface BookingFormData {
  clientName: string
  clientEmail: string
  clientPhone: string
  notes: string
}

type BookingStep = 'date' | 'time' | 'details' | 'confirmation'

export default function PublicBooking() {
  const { userId } = useParams<{ userId: string }>()
  const [step, setStep] = useState<BookingStep>('date')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<BookingFormData>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: ''
  })

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i + 1)
    return date
  })

  // Generate time slots (9:00 - 17:00, 30 min intervals)
  const timeSlots: TimeSlot[] = Array.from({ length: 16 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9
    const minute = (i % 2) * 30
    return {
      time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      available: true // TODO: Check actual availability
    }
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(date)
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !userId) return

    setLoading(true)
    setError(null)

    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const scheduledAt = new Date(selectedDate)
      scheduledAt.setHours(hours, minutes, 0, 0)

      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          client_name: formData.clientName,
          client_email: formData.clientEmail,
          client_phone: formData.clientPhone || null,
          notes: formData.notes || null,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: 30,
          meeting_type: 'discovery',
          status: 'pending'
        })

      if (insertError) throw insertError

      setSuccess(true)
      setStep('confirmation')
    } catch (err) {
      console.error('Booking error:', err)
      setError(err instanceof Error ? err.message : 'Randevu oluşturulamadı')
    } finally {
      setLoading(false)
    }
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-red-400 mb-4 block">error</span>
          <p className="text-white">Geçersiz randevu linki</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-dark text-white">
      {/* Header */}
      <header className="border-b border-border-dark bg-surface-dark">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">calendar_month</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Randevu Al</h1>
              <p className="text-text-secondary text-sm">30 dakikalık görüşme</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          {['date', 'time', 'details', 'confirmation'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`size-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === s
                    ? 'bg-primary text-white'
                    : ['date', 'time', 'details', 'confirmation'].indexOf(step) > i
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-text-secondary'
                }`}
              >
                {['date', 'time', 'details', 'confirmation'].indexOf(step) > i ? (
                  <span className="material-symbols-outlined text-lg">check</span>
                ) : (
                  i + 1
                )}
              </div>
              {i < 3 && (
                <div
                  className={`w-12 h-0.5 mx-1 ${
                    ['date', 'time', 'details', 'confirmation'].indexOf(step) > i
                      ? 'bg-green-500'
                      : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
          {/* Date Selection */}
          {step === 'date' && (
            <div>
              <h2 className="text-lg font-medium text-white mb-4">Tarih Seçin</h2>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {dates.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => {
                      setSelectedDate(date)
                      setStep('time')
                    }}
                    className={`p-3 rounded-lg border transition-colors text-center ${
                      selectedDate?.toDateString() === date.toDateString()
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-border-dark hover:border-primary/50 text-text-secondary hover:text-white'
                    }`}
                  >
                    <div className="text-xs uppercase">{formatDate(date).split(' ')[0]}</div>
                    <div className="text-lg font-semibold">{date.getDate()}</div>
                    <div className="text-xs">{formatDate(date).split(' ').slice(2).join(' ')}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time Selection */}
          {step === 'time' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white">Saat Seçin</h2>
                <button
                  onClick={() => setStep('date')}
                  className="text-text-secondary hover:text-white text-sm flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Geri
                </button>
              </div>
              <p className="text-text-secondary text-sm mb-4">
                {selectedDate && formatDate(selectedDate)} için müsait saatler
              </p>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => {
                      if (slot.available) {
                        setSelectedTime(slot.time)
                        setStep('details')
                      }
                    }}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg border transition-colors ${
                      !slot.available
                        ? 'border-border-dark bg-white/5 text-text-secondary cursor-not-allowed'
                        : selectedTime === slot.time
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-border-dark hover:border-primary/50 text-white'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Details Form */}
          {step === 'details' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white">İletişim Bilgileri</h2>
                <button
                  onClick={() => setStep('time')}
                  className="text-text-secondary hover:text-white text-sm flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Geri
                </button>
              </div>

              <div className="bg-background-dark rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-primary">event</span>
                  <span className="text-white">
                    {selectedDate && formatDate(selectedDate)} - {selectedTime}
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSubmit()
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                    placeholder="Adınız Soyadınız"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Telefon (Opsiyonel)
                  </label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                    placeholder="+90 555 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Notlar (Opsiyonel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
                    placeholder="Görüşmek istediğiniz konular..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !formData.clientName || !formData.clientEmail}
                  className="w-full py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Randevu Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">check_circle</span>
                      Randevuyu Onayla
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Confirmation */}
          {step === 'confirmation' && success && (
            <div className="text-center py-8">
              <div className="size-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-green-400">check_circle</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Randevu Oluşturuldu!</h2>
              <p className="text-text-secondary mb-6">
                Randevu detayları e-posta adresinize gönderilecektir.
              </p>
              <div className="bg-background-dark rounded-lg p-4 inline-block">
                <div className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-primary">event</span>
                  <span className="text-white">
                    {selectedDate && formatDate(selectedDate)} - {selectedTime}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-text-secondary text-sm">
          <p>Powered by Freelance OS</p>
        </div>
      </div>
    </div>
  )
}
