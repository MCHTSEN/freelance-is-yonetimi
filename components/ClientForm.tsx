import { useState } from 'react'
import type { ClientInsert } from '../lib/supabase'

interface ClientFormProps {
  onSubmit: (client: Omit<ClientInsert, 'user_id'>) => Promise<void>
  onCancel: () => void
  initialData?: Partial<ClientInsert>
}

export default function ClientForm({ onSubmit, onCancel, initialData }: ClientFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    company: initialData?.company || '',
    notes: initialData?.notes || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Ad *</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
            className="w-full px-5 py-3.5 bg-surface-dark/50 border border-glass-border rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
            placeholder="John"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Soyad</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
            className="w-full px-5 py-3.5 bg-surface-dark/50 border border-glass-border rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Şirket Ünvanı</label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
          className="w-full px-5 py-3.5 bg-surface-dark/50 border border-glass-border rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
          placeholder="Lumina Creative Studio"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">E-posta</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-5 py-3.5 bg-surface-dark/50 border border-glass-border rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all"
            placeholder="hello@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Telefon</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-5 py-3.5 bg-surface-dark/50 border border-glass-border rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all"
            placeholder="+90 5..."
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Müşteri Notları</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-5 py-4 bg-surface-dark/50 border border-glass-border rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all resize-none text-sm italic"
          placeholder="Müşteri ve beklentileri hakkında detaylar..."
          rows={3}
        />
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          <p className="text-rose-400 text-xs font-bold text-center uppercase tracking-widest">{error}</p>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl transition-all border border-glass-border"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-[1.5] py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          {loading ? (
            <span className="material-symbols-rounded animate-spin">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-rounded font-black">person_add</span>
              <span className="uppercase tracking-widest">Müşteriyi Kaydet</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
