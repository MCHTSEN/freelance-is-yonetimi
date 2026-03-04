import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    Calendar as CalendarIcon,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock,
    Loader2,
    Mail,
    MessageSquare,
    ShieldCheck,
    User,
    X
} from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

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

  const timeSlots: TimeSlot[] = Array.from({ length: 16 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9
    const minute = (i % 2) * 30
    return {
      time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      available: true
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
      setError(err instanceof Error ? err.message : 'Randevu oluşturulamadı')
    } finally {
      setLoading(false)
    }
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="size-20 bg-destructive/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-destructive/20 shadow-2xl shadow-destructive/10">
             <AlertCircle className="text-destructive size-10" />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Bağlantı Geçersiz</h1>
          <p className="text-muted-foreground font-medium text-sm">Bu randevu sayfası kullanım dışı veya yanlış bir link kullanıyor olabilirsiniz.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative overflow-x-hidden flex flex-col items-center justify-center p-6 font-display">
      {/* Immersive Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[160px] rounded-full pointer-events-none animate-pulse" />

      <div className="w-full max-w-2xl relative z-10 space-y-10">
        {/* Visual Header */}
        <div className="text-center space-y-6">
           <div className="relative inline-flex">
              <div className="absolute inset-0 bg-primary/40 blur-3xl opacity-20 scale-150" />
              <div className="relative size-20 rounded-3xl bg-gradient-to-br from-primary via-blue-600 to-indigo-500 p-[1.5px] shadow-2xl">
                 <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center">
                    <CalendarDays className="size-8 text-foreground" />
                 </div>
              </div>
           </div>
           <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-foreground leading-tight">Oturum Planla</h1>
              <div className="flex items-center justify-center gap-3">
                 <Badge variant="secondary" className="bg-secondary text-primary text-xs font-black uppercase tracking-widest px-3 border-border/50">Tanışma Toplantısı</Badge>
                 <Badge variant="secondary" className="bg-secondary text-muted-foreground text-xs font-black uppercase tracking-widest px-3 border-border/50">30 Dakika</Badge>
              </div>
           </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-6">
          {['date', 'time', 'details', 'confirmation'].map((s, i) => {
            const steps = ['date', 'time', 'details', 'confirmation'];
            const currentIndex = steps.indexOf(step);
            return (
              <div key={s} className={cn(
                "h-1.5 rounded-full transition-all duration-700",
                step === s ? "w-12 bg-primary" : currentIndex > i ? "w-6 bg-emerald-500/60" : "w-6 bg-secondary/30"
              )} />
            )
          })}
        </div>

        {/* Interactive Workspace */}
        <Card className="bg-card/40 dark:bg-card/40 backdrop-blur-3xl border-border/50 dark:border-border/20 rounded-[2.5rem] shadow-2xl overflow-hidden">
           <CardContent className="p-0">
              
              {/* Date Phase */}
              {step === 'date' && (
                <div className="p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center space-y-1">
                     <h2 className="text-xl font-bold text-foreground tracking-tight">Tarih Belirleyin</h2>
                     <p className="text-muted-foreground text-xs font-medium">Size uygun bir iş günü seçin.</p>
                  </div>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                    {dates.map((date) => (
                      <button
                        key={date.toISOString()}
                        onClick={() => { setSelectedDate(date); setStep('time'); }}
                        className={cn(
                          "aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 group overflow-hidden relative active:scale-95",
                          selectedDate?.toDateString() === date.toDateString()
                            ? "border-primary bg-primary text-primary-foreground shadow-2xl shadow-primary/20 scale-105"
                            : "border-border/20 bg-secondary/30 text-muted-foreground/60 hover:border-white/20 hover:text-foreground"
                        )}
                      >
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60 z-10">{formatDate(date).split(',')[0]}</span>
                        <span className="text-lg font-black leading-none z-10">{date.getDate()}</span>
                        {selectedDate?.toDateString() === date.toDateString() && (
                          <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Phase */}
              {step === 'time' && (
                <div className="p-10 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between border-b border-border/20 pb-6">
                     <Button variant="ghost" size="sm" onClick={() => setStep('date')} className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl">
                        <ArrowLeft className="size-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Tarih</span>
                     </Button>
                     <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">{selectedDate && formatDate(selectedDate)}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => { if (slot.available) { setSelectedTime(slot.time); setStep('details'); } }}
                        disabled={!slot.available}
                        className={cn(
                          "h-14 rounded-2xl border font-bold text-sm transition-all relative active:scale-95",
                          !slot.available
                            ? "border-border/10 bg-secondary/10 text-muted-foreground/30 cursor-not-allowed line-through"
                            : selectedTime === slot.time
                            ? "border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                            : "border-border/30 bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:bg-secondary"
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Details Phase */}
              {step === 'details' && (
                <div className="p-10 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between border-b border-border/20 pb-8">
                     <div className="space-y-1.5">
                        <h2 className="text-xl font-bold text-foreground tracking-tight">Oturumu Onaylayın</h2>
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                              <CalendarIcon className="size-3 text-primary" />
                              <span className="text-xs font-bold text-primary uppercase">{selectedDate && formatDate(selectedDate)}</span>
                           </div>
                           <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                              <Clock className="size-3 text-primary" />
                              <span className="text-xs font-bold text-primary uppercase">{selectedTime}</span>
                           </div>
                        </div>
                     </div>
                     <Button variant="ghost" size="icon" onClick={() => setStep('time')} className="rounded-full hover:bg-secondary/30">
                        <X className="size-4 text-muted-foreground" />
                     </Button>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2.5">
                          <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Kimlik Bilgisi</Label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 mt-0.5 size-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                            <Input
                              type="text" required
                              value={formData.clientName}
                              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                              className="h-14 pl-12 bg-secondary/30 border-border/20 rounded-2xl text-foreground placeholder:text-slate-800 focus:border-primary/40 focus:ring-primary/20 transition-all font-bold"
                              placeholder="Tam Adınız"
                            />
                          </div>
                       </div>
                       <div className="space-y-2.5">
                          <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">İletişim Kanalı</Label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 mt-0.5 size-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                            <Input
                              type="email" required
                              value={formData.clientEmail}
                              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                              className="h-14 pl-12 bg-secondary/30 border-border/20 rounded-2xl text-foreground placeholder:text-slate-800 focus:border-primary/40 focus:ring-primary/20 transition-all font-bold"
                              placeholder="e-posta@adresiniz.com"
                            />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2.5">
                       <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Kısa Notlar (Opsiyonel)</Label>
                       <div className="relative group">
                          <MessageSquare className="absolute left-4 top-5 size-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                          <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full bg-secondary/30 border border-border/20 rounded-[1.5rem] pl-12 pr-6 py-4 text-foreground placeholder:text-slate-800 focus:outline-none focus:border-primary/40 transition-all font-medium resize-none shadow-inner"
                            placeholder="Tartışmak istediğiniz konuları belirtebilirsiniz..."
                          />
                       </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3">
                        <AlertCircle className="size-4 text-destructive shrink-0" />
                        <p className="text-destructive/80 text-xs font-bold uppercase tracking-wider">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading || !formData.clientName || !formData.clientEmail}
                      className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[1.5rem] text-xs font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] group"
                    >
                      {loading ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="size-5" />
                          <span>REZERVASYONU ONAYLA</span>
                          <ChevronRight className="size-4 opacity-40 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}

              {/* Confirmation Phase */}
              {step === 'confirmation' && success && (
                <div className="p-16 text-center space-y-10 animate-in zoom-in-95 duration-700">
                  <div className="relative inline-flex mb-4">
                     <div className="absolute inset-0 bg-emerald-500/40 blur-3xl opacity-20 scale-150 rounded-full" />
                     <div className="relative size-24 rounded-full bg-emerald-500 shadow-2xl flex items-center justify-center">
                        <Check className="size-12 text-foreground stroke-[3px]" />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <h2 className="text-4xl font-black text-foreground tracking-tight leading-none">Harika!</h2>
                     <p className="text-muted-foreground font-medium max-w-sm mx-auto text-sm leading-relaxed">
                       Randevu talebiniz başarıyla oluşturuldu. <br/>Temsilcimiz kısa sürede sizinle iletişime geçecektir.
                     </p>
                  </div>
                  
                  <div className="bg-secondary/30 border border-border/20 rounded-3xl p-8 max-w-sm mx-auto flex flex-col items-center gap-6 shadow-xl">
                     <p className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/40">Özet Detaylar</p>
                     <div className="flex flex-col gap-4 w-full">
                        <div className="flex items-center justify-between text-xs font-bold border-b border-border/20 pb-3">
                           <span className="text-muted-foreground/60">Tarih</span>
                           <span className="text-foreground">{selectedDate && formatDate(selectedDate)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold">
                           <span className="text-muted-foreground/60">Saat</span>
                           <span className="text-foreground">{selectedTime}</span>
                        </div>
                     </div>
                  </div>
                </div>
              )}
           </CardContent>
        </Card>

        {/* Footer Identity */}
        <div className="flex flex-col items-center gap-6 pt-10">
           <div className="flex items-center gap-4 opacity-20">
              <div className="h-px w-6 bg-slate-500" />
              <ShieldCheck className="size-4 text-muted-foreground" />
              <div className="h-px w-6 bg-slate-500" />
           </div>
           <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-700 text-center leading-relaxed">
             SECURE CONNECT • POWERED BY FREE.OS
           </p>
        </div>
      </div>
    </div>
  )
}
