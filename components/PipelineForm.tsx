import { useEffect, useState } from 'react'
import type { PipelineStage } from '../hooks/usePipeline'
import { STAGE_CONFIG } from '../hooks/usePipeline'
import type { Client, PipelineInsert } from '../lib/supabase'

interface PipelineFormProps {
  clients: Client[]
  onSubmit: (item: PipelineInsert) => Promise<void>
  onCancel: () => void
  onAddClient: () => void
  initialStage?: PipelineStage
  preselectedClientId?: string
  editMode?: boolean
  initialData?: {
    estimated_value?: string
    follow_up_date?: string
    priority?: string
    notes?: string
  }
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Düşük', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  { value: 'medium', label: 'Orta', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  { value: 'high', label: 'Yüksek', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
]

const STAGE_OPTIONS = Object.entries(STAGE_CONFIG).map(([key, config]) => ({
  value: key,
  label: config.title,
}))

const QUICK_DATES = [
  { label: 'Yarın', days: 1 },
  { label: '3 Gün', days: 3 },
  { label: '1 Hafta', days: 7 },
  { label: '2 Hafta', days: 14 },
  { label: '1 Ay', days: 30 },
]

function addDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export default function PipelineForm({
  clients,
  onSubmit,
  onCancel,
  onAddClient,
  initialStage = 'lead',
  preselectedClientId,
  editMode = false,
  initialData,
}: PipelineFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    client_id: preselectedClientId || '',
    stage: initialStage as string,
    estimated_value: initialData?.estimated_value || '',
    follow_up_date: initialData?.follow_up_date || '',
    priority: initialData?.priority || 'medium',
    notes: initialData?.notes || '',
  })

  // Update client_id when preselectedClientId changes
  useEffect(() => {
    if (preselectedClientId) {
      setFormData(prev => ({ ...prev, client_id: preselectedClientId }))
    }
  }, [preselectedClientId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await onSubmit({
        client_id: formData.client_id || null,
        stage: formData.stage,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
        follow_up_date: formData.follow_up_date || null,
        priority: formData.priority,
        notes: formData.notes || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDate = (days: number) => {
    setFormData(prev => ({ ...prev, follow_up_date: addDays(days) }))
  }

  const clearDate = () => {
    setFormData(prev => ({ ...prev, follow_up_date: '' }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Müşteri Seçimi */}
      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Müşteri</label>
        <div className="flex gap-2">
          <select
            value={formData.client_id}
            onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
            className="flex-1 px-5 py-4 bg-surface-dark/50 border border-glass-border rounded-2xl text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-900">Müşteri seçin...</option>
            {clients.map(client => (
              <option key={client.id} value={client.id} className="bg-slate-900">
                {client.first_name} {client.last_name} {client.company && `(${client.company})`}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onAddClient}
            className="size-[58px] bg-white/5 border border-glass-border hover:border-primary/50 text-slate-400 hover:text-primary rounded-2xl transition-all flex items-center justify-center"
            title="Yeni müşteri ekle"
          >
            <span className="material-symbols-rounded">person_add</span>
          </button>
        </div>
      </div>

      {/* Aşama - Chip Buttons */}
      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Aşama</label>
        <div className="flex flex-wrap gap-2">
          {STAGE_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, stage: option.value }))}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                formData.stage === option.value
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border-glass-border'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Öncelik */}
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Öncelik</label>
          <div className="flex gap-2">
            {PRIORITY_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${
                  formData.priority === option.value
                    ? option.color + ' shadow-lg'
                    : 'bg-white/5 text-slate-500 border-glass-border hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fiyat */}
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Tahmini Değer (₺)</label>
          <input
            type="number"
            value={formData.estimated_value}
            onChange={(e) => setFormData(prev => ({ ...prev, estimated_value: e.target.value }))}
            className="w-full px-5 py-2.5 bg-surface-dark/50 border border-glass-border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 font-mono text-sm"
            placeholder="0.00"
            min="0"
          />
        </div>
      </div>

      {/* Takip Tarihi */}
      <div>
        <div className="flex justify-between items-center mb-2 px-1">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Takip Tarihi</label>
          <span className="text-[10px] text-slate-600 font-medium">Opsiyonel</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_DATES.map(({ label, days }) => (
            <button
              key={days}
              type="button"
              onClick={() => handleQuickDate(days)}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                formData.follow_up_date === addDays(days)
                  ? 'bg-slate-200 text-slate-900 border-slate-200 shadow-lg shadow-white/5'
                  : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white border-glass-border'
              }`}
            >
              {label}
            </button>
          ))}
          {formData.follow_up_date && (
            <button
              type="button"
              onClick={clearDate}
              className="px-3 py-2 rounded-xl text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all flex items-center justify-center"
            >
              <span className="material-symbols-rounded text-[14px]">close</span>
            </button>
          )}
        </div>

        <input
          type="date"
          value={formData.follow_up_date}
          onChange={(e) => setFormData(prev => ({ ...prev, follow_up_date: e.target.value }))}
          className="w-full px-5 py-3 bg-surface-dark/50 border border-glass-border rounded-xl text-white focus:outline-none focus:border-primary/50 text-sm"
        />
      </div>

      {/* Notlar */}
      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Notlar</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-5 py-4 bg-surface-dark/50 border border-glass-border rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all resize-none text-sm font-light italic"
          placeholder="İş birliği hakkında kısa notlar..."
          rows={3}
        />
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-pulse">
          <p className="text-rose-400 text-xs font-bold text-center uppercase tracking-wider">{error}</p>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl transition-all border border-glass-border"
        >
          Geri Dön
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-[1.5] py-4 bg-white text-slate-900 hover:bg-slate-200 disabled:opacity-50 font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5 active:scale-[0.98]"
        >
          {loading ? (
            <span className="material-symbols-rounded animate-spin">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-rounded font-black">{editMode ? 'sync' : 'stars'}</span>
              <span className="uppercase tracking-widest">{editMode ? 'Güncelle' : 'Yolculuğu Başlat'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
