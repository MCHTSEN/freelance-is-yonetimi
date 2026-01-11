import { useState } from 'react'
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

  const timeSlots: TimeSlot[] = Array.from({ length: 16 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9
    const minute = (i % 2) * 30
    return {
      time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      available: true
    }
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
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
      setError(err instanceof Error ? err.message : 'Failed to schedule booking')
    } finally {
      setLoading(false)
    }
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="size-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-rose-500/20">
             <span className="material-symbols-rounded text-rose-500 text-4xl">warning</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Invalid Gateway</h1>
          <p className="text-slate-500 font-medium">This booking link has expired or is invalid.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/30 relative overflow-x-hidden flex flex-col items-center justify-center p-6">
      {/* Decorative Blur Clusters */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full" />

      <div className="w-full max-w-2xl relative z-10 space-y-8">
        {/* Profile Header */}
        <div className="text-center space-y-4">
           <div className="size-24 rounded-[2.5rem] bg-gradient-to-tr from-primary to-blue-600 p-1 mx-auto shadow-2xl shadow-primary/20">
              <div className="w-full h-full rounded-[2.2rem] bg-slate-900 flex items-center justify-center">
                 <span className="material-symbols-rounded text-white text-4xl">calendar_month</span>
              </div>
           </div>
           <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-white leading-none">Schedule Session</h1>
              <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.3em]">Discovery Meeting • 30 Minutes</p>
           </div>
        </div>

        {/* Progress System */}
        <div className="flex items-center justify-center gap-3">
          {['date', 'time', 'details', 'confirmation'].map((s, i) => {
            const steps = ['date', 'time', 'details', 'confirmation'];
            const currentIndex = steps.indexOf(step);
            const isActive = step === s;
            const isCompleted = currentIndex > i;
            return (
              <div key={s} className="flex items-center">
                 <div className={`h-1.5 rounded-full transition-all duration-500 ${
                   isActive ? 'w-12 bg-primary' : isCompleted ? 'w-8 bg-emerald-500' : 'w-8 bg-white/10'
                 }`} />
              </div>
            )
          })}
        </div>

        {/* Dynamic Workspace */}
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden">
           {/* Date Phase */}
           {step === 'date' && (
             <div className="p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex flex-col gap-1 items-center">
                  <h2 className="text-xl font-black text-white tracking-tight">Select your availability</h2>
                  <p className="text-slate-500 text-xs font-medium">Choose a convenient day for our session.</p>
               </div>
               
               <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                 {dates.map((date) => (
                   <button
                     key={date.toISOString()}
                     onClick={() => { setSelectedDate(date); setStep('time'); }}
                     className={`aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${
                       selectedDate?.toDateString() === date.toDateString()
                         ? 'border-primary bg-primary text-white scale-105 shadow-xl shadow-primary/20'
                         : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                     }`}
                   >
                     <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{formatDate(date).split(',')[0]}</span>
                     <span className="text-xl font-black leading-none">{date.getDate()}</span>
                   </button>
                 ))}
               </div>
             </div>
           )}

           {/* Time Phase */}
           {step === 'time' && (
             <div className="p-10 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center justify-between">
                  <button onClick={() => setStep('date')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
                     <span className="material-symbols-rounded text-[20px]">arrow_back</span>
                     <span className="text-[10px] font-black uppercase tracking-widest mt-0.5">Change Date</span>
                  </button>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">{selectedDate && formatDate(selectedDate)}</p>
               </div>
               
               <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                 {timeSlots.map((slot) => (
                   <button
                     key={slot.time}
                     onClick={() => { if (slot.available) { setSelectedTime(slot.time); setStep('details'); } }}
                     disabled={!slot.available}
                     className={`py-4 rounded-xl border font-black text-sm tracking-tight transition-all ${
                       !slot.available
                         ? 'border-white/5 bg-white/[0.01] text-slate-700 cursor-not-allowed line-through'
                         : selectedTime === slot.time
                         ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20'
                         : 'border-white/5 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white hover:scale-105'
                     }`}
                   >
                     {slot.time}
                   </button>
                 ))}
               </div>
             </div>
           )}

           {/* Details Phase */}
           {step === 'details' && (
             <div className="p-10 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <div className="space-y-1">
                     <h2 className="text-xl font-black text-white tracking-tight">Finalizing session</h2>
                     <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-rounded text-sm text-primary">event_available</span>
                        {selectedDate && formatDate(selectedDate)} @ {selectedTime}
                     </p>
                  </div>
                  <button onClick={() => setStep('time')} className="size-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                     <span className="material-symbols-rounded text-[18px]">close</span>
                  </button>
               </div>

               <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity</label>
                       <input
                        type="text" required
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-slate-700 focus:outline-none focus:border-primary/50 font-bold transition-all"
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Communication</label>
                       <input
                         type="email" required
                         value={formData.clientEmail}
                         onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                         className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-slate-700 focus:outline-none focus:border-primary/50 font-bold transition-all"
                         placeholder="professional@email.com"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Strategic Session Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] px-5 py-4 text-white placeholder-slate-700 focus:outline-none focus:border-primary/50 font-medium transition-all resize-none shadow-inner"
                      placeholder="Outline any key discussion points or project goals..."
                    />
                 </div>

                 {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-black uppercase tracking-widest text-center">{error}</div>}

                 <button
                   type="submit"
                   disabled={loading || !formData.clientName || !formData.clientEmail}
                   className="w-full py-5 bg-primary hover:bg-primary-dark disabled:bg-primary/30 rounded-[1.5rem] text-white font-black uppercase tracking-[0.2em] text-sm transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                 >
                   {loading ? (
                     <>
                       <span className="material-symbols-rounded animate-spin">progress_activity</span>
                       Deploying Request...
                     </>
                   ) : (
                     <>
                       <span className="material-symbols-rounded font-black">verified</span>
                       Confirm Reservation
                     </>
                   )}
                 </button>
               </form>
             </div>
           )}

           {/* Confirmation Phase */}
           {step === 'confirmation' && success && (
             <div className="p-16 text-center space-y-8 animate-in zoom-in-95 duration-700">
               <div className="size-24 rounded-full bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)] flex items-center justify-center mx-auto relative">
                  <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500 opacity-20" />
                  <span className="material-symbols-rounded text-5xl text-white font-black">done_all</span>
               </div>
               <div className="space-y-3">
                  <h2 className="text-3xl font-black text-white tracking-tight">Mission Secured!</h2>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto">Your session has been successfully logged. Expect a verification email shortly.</p>
               </div>
               
               <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 inline-block">
                 <div className="flex items-center gap-4 text-sm px-4">
                   <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-rounded">event</span>
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Scheduled Asset</p>
                      <p className="text-white font-black tracking-tight">{selectedDate && formatDate(selectedDate)} • {selectedTime}</p>
                   </div>
                 </div>
               </div>
             </div>
           )}
        </div>

        {/* Brand Signifier */}
        <div className="flex items-center justify-center gap-3 opacity-30 select-none">
           <div className="h-px w-8 bg-slate-500" />
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-500">Encrypted Infrastructure by Freelance OS</p>
           <div className="h-px w-8 bg-slate-500" />
        </div>
      </div>
    </div>
  )
}
