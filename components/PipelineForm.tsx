import { useState } from 'react'
import type { PipelineInsert, Client } from '../lib/supabase'
import type { PipelineStage } from '../hooks/usePipeline'
import { STAGE_CONFIG } from '../hooks/usePipeline'

interface PipelineFormProps {
  clients: Client[]
  onSubmit: (item: PipelineInsert) => Promise<void>
  onCancel: () => void
  onAddClient: () => void
  initialStage?: PipelineStage
}

export default function PipelineForm({ clients, onSubmit, onCancel, onAddClient, initialStage = 'lead' }: PipelineFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    client_id: '',
    stage: initialStage as string,
    estimated_value: '',
    follow_up_date: '',
    priority: 'medium',
    notes: '',
  })

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-text-secondary mb-2">Aşama</label>
          <select
            value={formData.stage}
            onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value }))}
            className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
          >
            {Object.entries(STAGE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">Öncelik</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
          >
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <label className="block text-sm text-text-secondary mb-2">Takip Tarihi</label>
          <input
            type="date"
            value={formData.follow_up_date}
            onChange={(e) => setFormData(prev => ({ ...prev, follow_up_date: e.target.value }))}
            className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

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
