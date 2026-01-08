import { useState, useEffect } from 'react'
import type { PipelineInsert, Client } from '../lib/supabase'
import type { PipelineStage } from '../hooks/usePipeline'
import { STAGE_CONFIG } from '../hooks/usePipeline'

interface PipelineFormProps {
  clients: Client[]
  onSubmit: (item: PipelineInsert) => Promise<void>
  onCancel: () => void
  onAddClient: () => void
  initialStage?: PipelineStage
  preselectedClientId?: string
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
}: PipelineFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    client_id: preselectedClientId || '',
    stage: initialStage as string,
    estimated_value: '',
    follow_up_date: '',
    priority: 'medium',
    notes: '',
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Müşteri Seçimi */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">Müşteri</label>
        <div className="flex gap-2">
          <select
            value={formData.client_id}
            onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
            className="flex-1 px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">Müşteri seçin...</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.first_name} {client.last_name} {client.company && `(${client.company})`}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onAddClient}
            className="px-4 py-3 bg-surface-dark border border-border-dark hover:border-primary text-white rounded-xl transition-colors"
            title="Yeni müşteri ekle"
          >
            <span className="material-symbols-rounded">person_add</span>
          </button>
        </div>
      </div>

      {/* Aşama - Chip Buttons */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">Aşama</label>
        <div className="flex flex-wrap gap-2">
          {STAGE_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, stage: option.value }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                formData.stage === option.value
                  ? 'bg-primary text-white'
                  : 'bg-surface-dark text-text-secondary hover:bg-[#233648] hover:text-white border border-border-dark'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Öncelik - Chip Buttons */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">Öncelik</label>
        <div className="flex gap-2">
          {PRIORITY_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                formData.priority === option.value
                  ? option.color
                  : 'bg-surface-dark text-text-secondary border-border-dark hover:bg-[#233648]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tahmini Değer */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">Tahmini Değer (₺)</label>
        <input
          type="number"
          value={formData.estimated_value}
          onChange={(e) => setFormData(prev => ({ ...prev, estimated_value: e.target.value }))}
          className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
          placeholder="50000"
          min="0"
          step="100"
        />
      </div>

      {/* Takip Tarihi */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">Takip Tarihi</label>

        {/* Hızlı Tarih Butonları */}
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_DATES.map(({ label, days }) => (
            <button
              key={days}
              type="button"
              onClick={() => handleQuickDate(days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                formData.follow_up_date === addDays(days)
                  ? 'bg-primary text-white'
                  : 'bg-surface-dark text-text-secondary hover:bg-[#233648] hover:text-white border border-border-dark'
              }`}
            >
              {label}
            </button>
          ))}
          {formData.follow_up_date && (
            <button
              type="button"
              onClick={clearDate}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
            >
              Temizle
            </button>
          )}
        </div>

        {/* Manuel Tarih Seçici */}
        <input
          type="date"
          value={formData.follow_up_date}
          onChange={(e) => setFormData(prev => ({ ...prev, follow_up_date: e.target.value }))}
          className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Notlar */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">Notlar</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="Proje veya müşteri hakkında notlar..."
          rows={3}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-surface-dark border border-border-dark hover:bg-background-dark text-white font-medium rounded-xl transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="material-symbols-rounded animate-spin">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-rounded">add</span>
              Ekle
            </>
          )}
        </button>
      </div>
    </form>
  )
}
