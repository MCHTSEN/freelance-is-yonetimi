import {
    Loader2,
    RefreshCcw,
    Star,
    UserPlus,
    X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { PipelineStage } from '../hooks/usePipeline'
import { STAGE_CONFIG } from '../hooks/usePipeline'
import type { Client, PipelineInsert } from '../lib/supabase'
import FormattedPriceInput from './FormattedPriceInput'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from './ui/select'

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
  { value: 'low', label: 'Düşük', variant: 'secondary' as const },
  { value: 'medium', label: 'Orta', variant: 'default' as const },
  { value: 'high', label: 'Yüksek', variant: 'destructive' as const },
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
      <div className="space-y-2">
        <Label>Müşteri</Label>
        <div className="flex gap-2">
          <Select
            value={formData.client_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Müşteri seçin..." />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.first_name} {client.last_name} {client.company && `(${client.company})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onAddClient}
            className="h-10 w-10 shrink-0"
            title="Yeni müşteri ekle"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Aşama */}
      <div className="space-y-2">
        <Label>Aşama</Label>
        <div className="flex flex-wrap gap-2">
          {STAGE_OPTIONS.map(option => (
            <Button
              key={option.value}
              type="button"
              variant={formData.stage === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, stage: option.value }))}
              className="text-xs font-semibold"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Öncelik */}
        <div className="space-y-2">
          <Label>Öncelik</Label>
          <div className="flex gap-2">
            {PRIORITY_OPTIONS.map(option => (
              <Button
                key={option.value}
                type="button"
                variant={formData.priority === option.value ? option.variant : "outline"}
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                className="flex-1 text-[10px] uppercase font-bold tracking-wider"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Fiyat */}
        <div className="space-y-2">
          <Label>Tahmini Değer (₺)</Label>
          <FormattedPriceInput
            value={formData.estimated_value}
            onChange={(val) => setFormData(prev => ({ ...prev, estimated_value: val }))}
            placeholder="0"
          />
        </div>
      </div>

      {/* Takip Tarihi */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Takip Tarihi</Label>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Opsiyonel</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_DATES.map(({ label, days }) => (
            <Button
              key={days}
              type="button"
              variant={formData.follow_up_date === addDays(days) ? "secondary" : "outline"}
              size="sm"
              onClick={() => handleQuickDate(days)}
              className="h-8 text-[10px] font-bold uppercase"
            >
              {label}
            </Button>
          ))}
          {formData.follow_up_date && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={clearDate}
              className="h-8 w-8"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Input
          type="date"
          value={formData.follow_up_date}
          onChange={(e) => setFormData(prev => ({ ...prev, follow_up_date: e.target.value }))}
          className="text-sm"
        />
      </div>

      {/* Notlar */}
      <div className="space-y-2">
        <Label>Notlar</Label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 italic"
          placeholder="İş birliği hakkında kısa notlar..."
        />
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-xs font-medium text-center">{error}</p>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Geri Dön
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-[1.5]"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            editMode ? <RefreshCcw className="mr-2 h-4 w-4" /> : <Star className="mr-2 h-4 w-4" />
          )}
          {editMode ? 'Güncelle' : 'Yolculuğu Başlat'}
        </Button>
      </div>
    </form>
  )
}
