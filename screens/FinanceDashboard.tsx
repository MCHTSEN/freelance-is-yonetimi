import { useState, useMemo } from 'react'
import { useInvoices, type InvoiceWithDetails, PAYMENT_METHODS, type PaymentMethod } from '../hooks/useInvoices'
import { useTimeTracking, formatDuration, formatDurationDetailed } from '../hooks/useTimeTracking'
import { useClients } from '../hooks/useClients'
import Modal from '../components/Modal'

type FilterType = 'all' | 'overdue' | 'partial' | 'unpaid' | 'paid'

const FILTERS: { value: FilterType; label: string; color?: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'overdue', label: 'Vadesi Geçmiş', color: 'red' },
  { value: 'partial', label: 'Kısmi Ödeme', color: 'amber' },
  { value: 'unpaid', label: 'Bekleyen', color: 'slate' },
  { value: 'paid', label: 'Ödendi', color: 'green' },
]

function InvoiceForm({
  clients,
  onSubmit,
  onCancel,
}: {
  clients: { id: string; first_name: string; last_name: string; company: string | null }[]
  onSubmit: (data: {
    client_id: string | null
    amount: number
    due_date: string | null
    invoice_number: string | null
    notes: string | null
  }) => Promise<void>
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    client_id: '',
    amount: '',
    due_date: '',
    invoice_number: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await onSubmit({
        client_id: formData.client_id || null,
        amount: parseFloat(formData.amount) || 0,
        due_date: formData.due_date || null,
        invoice_number: formData.invoice_number || null,
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
        <select
          value={formData.client_id}
          onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
          className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">Müşteri seçin...</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.first_name} {client.last_name} {client.company && `(${client.company})`}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-text-secondary mb-2">Tutar (₺) *</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
            placeholder="10000"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">Fatura No</label>
          <input
            type="text"
            value={formData.invoice_number}
            onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
            className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
            placeholder="INV-001"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-2">Vade Tarihi</label>
        <input
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
          className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-2">Notlar</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="Ek notlar..."
          rows={2}
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
              Fatura Ekle
            </>
          )}
        </button>
      </div>
    </form>
  )
}

function PaymentForm({
  invoice,
  onSubmit,
  onCancel,
}: {
  invoice: InvoiceWithDetails
  onSubmit: (amount: number, method?: PaymentMethod, notes?: string) => Promise<void>
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    amount: invoice.remaining.toString(),
    method: '' as PaymentMethod | '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const amount = parseFloat(formData.amount)
      if (amount <= 0) throw new Error('Tutar 0\'dan büyük olmalı')
      if (amount > invoice.remaining) throw new Error('Tutar kalan tutardan fazla olamaz')

      await onSubmit(
        amount,
        formData.method || undefined,
        formData.notes || undefined
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-secondary text-sm">Fatura Tutarı</span>
          <span className="text-white font-bold">₺{invoice.amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-secondary text-sm">Ödenen</span>
          <span className="text-green-400 font-medium">₺{invoice.total_paid.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border-dark">
          <span className="text-text-secondary text-sm font-medium">Kalan</span>
          <span className="text-amber-400 font-bold">₺{invoice.remaining.toLocaleString()}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-2">Ödeme Tutarı (₺) *</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
          placeholder="0"
          required
          min="0.01"
          max={invoice.remaining}
          step="0.01"
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-2">Ödeme Yöntemi</label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map(method => (
            <button
              key={method.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, method: prev.method === method.value ? '' : method.value }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                formData.method === method.value
                  ? 'bg-primary text-white'
                  : 'bg-surface-dark text-text-secondary hover:bg-[#233648] hover:text-white border border-border-dark'
              }`}
            >
              {method.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-2">Not</label>
        <input
          type="text"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
          placeholder="Ödeme notu..."
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
          className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="material-symbols-rounded animate-spin">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-rounded">payments</span>
              Ödeme Ekle
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default function FinanceDashboard() {
  const { invoices, loading, addInvoice, deleteInvoice, addPayment, calculateStats } = useInvoices()
  const { activeEntry, elapsedSeconds, startTimer, stopTimer, calculateStats: timeStats } = useTimeTracking()
  const { clients } = useClients()

  const [filter, setFilter] = useState<FilterType>('all')
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceWithDetails | null>(null)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const [timerDescription, setTimerDescription] = useState('')
  const [timerClientId, setTimerClientId] = useState<string>('')

  const stats = calculateStats()
  const timeStatsData = timeStats()

  const filteredInvoices = useMemo(() => {
    if (filter === 'all') return invoices
    return invoices.filter(inv => inv.status === filter)
  }, [invoices, filter])

  const handleAddInvoice = async (data: Parameters<typeof addInvoice>[0]) => {
    await addInvoice(data)
    setShowInvoiceForm(false)
  }

  const handleAddPayment = async (amount: number, method?: PaymentMethod, notes?: string) => {
    if (!paymentInvoice) return
    await addPayment(paymentInvoice.id, amount, method, notes)
    setPaymentInvoice(null)
  }

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Bu fatura silinsin mi?')) return
    await deleteInvoice(id)
    setActionMenuOpen(null)
  }

  const getStatusLabel = (status: InvoiceWithDetails['status']) => {
    switch (status) {
      case 'overdue': return 'Vadesi Geçmiş'
      case 'partial': return 'Kısmi Ödeme'
      case 'unpaid': return 'Bekliyor'
      case 'paid': return 'Ödendi'
    }
  }

  const getStatusStyle = (status: InvoiceWithDetails['status']) => {
    switch (status) {
      case 'overdue': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'partial': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      case 'unpaid': return 'bg-slate-700/30 text-slate-400 border-slate-700/50'
      case 'paid': return 'bg-green-500/10 text-green-500 border-green-500/20'
    }
  }

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <span className="material-symbols-rounded text-primary text-4xl animate-spin">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background-dark" onClick={() => setActionMenuOpen(null)}>
      <div className="px-6 py-8 md:px-10 flex flex-wrap items-end justify-between gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">Finansal Takip</h2>
          <p className="text-text-secondary text-sm md:text-base">Nakit akışınızı yönetin ve ödenmemiş faturaları takip edin.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInvoiceForm(true)}
            className="flex items-center gap-2 h-10 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95 transform"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Yeni Fatura</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-3 p-5 rounded-xl border border-border-dark bg-surface-dark shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-text-secondary text-sm font-medium">Toplam Alacak</p>
                <span className="material-symbols-outlined text-emerald-500 bg-emerald-500/10 p-1 rounded">trending_up</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-white">₺{stats.totalReceivable.toLocaleString()}</p>
                <span className="text-text-secondary text-xs">{stats.pendingCount} fatura</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 p-5 rounded-xl border border-red-900/30 bg-red-900/10 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl text-red-500">warning</span>
              </div>
              <div className="flex items-center justify-between z-10">
                <p className="text-red-400 text-sm font-medium">Vadesi Geçmiş</p>
                <span className="material-symbols-outlined text-red-500">error</span>
              </div>
              <div className="flex items-baseline gap-2 z-10">
                <p className="text-2xl font-bold text-red-400">₺{stats.totalOverdue.toLocaleString()}</p>
                {stats.overdueCount > 0 && (
                  <span className="text-red-400 text-xs font-medium">Acil!</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 p-5 rounded-xl border border-border-dark bg-surface-dark shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-text-secondary text-sm font-medium">Bu Hafta Gelecek</p>
                <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded">calendar_today</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-white">₺{stats.dueThisWeek.toLocaleString()}</p>
              </div>
            </div>

            {/* Timer Widget */}
            <div className="flex flex-col gap-3 p-5 rounded-xl border border-border-dark bg-surface-dark shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-text-secondary text-sm font-medium">Zaman Takibi</p>
                <span className={`material-symbols-outlined ${activeEntry ? 'text-green-500 animate-pulse' : 'text-text-secondary'} bg-green-500/10 p-1 rounded`}>
                  timer
                </span>
              </div>
              {activeEntry ? (
                <div className="flex flex-col gap-2">
                  <p className="text-2xl font-bold text-green-400 font-mono">
                    {formatDurationDetailed(elapsedSeconds)}
                  </p>
                  {activeEntry.clients && (
                    <p className="text-xs text-text-secondary truncate">
                      {activeEntry.clients.first_name} {activeEntry.clients.last_name}
                    </p>
                  )}
                  <button
                    onClick={stopTimer}
                    className="flex items-center justify-center gap-2 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">stop</span>
                    Durdur
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <select
                    value={timerClientId}
                    onChange={(e) => setTimerClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-white text-sm focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Müşteri seçin...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={timerDescription}
                    onChange={(e) => setTimerDescription(e.target.value)}
                    placeholder="Ne üzerinde çalışıyorsun?"
                    className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-white text-sm placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={() => {
                      if (!timerClientId) {
                        alert('Lütfen müşteri seçin')
                        return
                      }
                      startTimer(timerDescription, undefined, timerClientId)
                      setTimerDescription('')
                      setTimerClientId('')
                    }}
                    className="flex items-center justify-center gap-2 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-medium rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    Başlat
                  </button>
                </div>
              )}
              <p className="text-text-secondary text-xs">
                Bugün: {timeStatsData.todayFormatted}
              </p>
            </div>
          </div>

          {/* Filters & Table */}
          <div className="flex flex-col gap-4">
            <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`flex items-center justify-center gap-2 h-9 px-4 rounded-full border text-sm font-medium transition-colors shrink-0 ${
                    filter === f.value
                      ? 'bg-white text-slate-900 border-white'
                      : 'bg-surface-dark border-border-dark text-slate-300 hover:bg-[#1f2b36]'
                  }`}
                >
                  {f.color && <span className={`size-2 rounded-full bg-${f.color}-500`}></span>}
                  {f.label}
                </button>
              ))}
            </div>

            <div className="w-full overflow-hidden rounded-xl border border-border-dark bg-surface-dark shadow-sm min-h-[300px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#192633] border-b border-border-dark">
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary w-32">Durum</th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary">Fatura No</th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary">Müşteri</th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary">Vade</th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary text-right">Tutar</th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary w-32">İlerleme</th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary text-right">Kalan</th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark text-sm">
                    {filteredInvoices.map((inv) => {
                      const progress = inv.amount > 0 ? (inv.total_paid / inv.amount) * 100 : 0
                      const clientName = inv.clients
                        ? `${inv.clients.first_name} ${inv.clients.last_name}`
                        : 'Bilinmiyor'
                      const initials = inv.clients
                        ? `${inv.clients.first_name[0]}${inv.clients.last_name[0]}`
                        : '?'

                      return (
                        <tr key={inv.id} className="group hover:bg-[#1f2b36] transition-colors">
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(inv.status)}`}>
                              {getStatusLabel(inv.status)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-400 font-mono">
                            {inv.invoice_number || '-'}
                          </td>
                          <td className="py-4 px-6 font-medium text-white">
                            <div className="flex items-center gap-2">
                              <div className="size-6 rounded bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                                {initials}
                              </div>
                              {clientName}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-400">
                            {inv.due_date
                              ? new Date(inv.due_date).toLocaleDateString('tr-TR')
                              : '-'}
                          </td>
                          <td className="py-4 px-6 text-right font-bold text-white">
                            ₺{inv.amount.toLocaleString()}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1">
                              <div className="h-2 bg-border-dark rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    progress >= 100 ? 'bg-green-500' :
                                    progress > 0 ? 'bg-amber-500' : 'bg-slate-600'
                                  }`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-text-secondary">
                                {progress.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-bold text-white">
                            ₺{inv.remaining.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-center relative">
                            <div className="flex items-center justify-end gap-2">
                              {inv.status !== 'paid' && (
                                <button
                                  onClick={() => setPaymentInvoice(inv)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-400 bg-green-500/10 rounded hover:bg-green-500/20 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[14px]">payments</span>
                                  Ödeme
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); setActionMenuOpen(actionMenuOpen === inv.id ? null : inv.id) }}
                                className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                              >
                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                              </button>

                              {actionMenuOpen === inv.id && (
                                <div className="absolute right-8 top-10 w-32 bg-surface-lighter border border-border-dark shadow-xl rounded-lg z-20 py-1 flex flex-col items-start">
                                  <button
                                    onClick={() => handleDeleteInvoice(inv.id)}
                                    className="w-full text-left px-4 py-2 text-xs hover:bg-[#1f2b36] text-white hover:text-red-400"
                                  >
                                    Sil
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredInvoices.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-text-secondary">
                          Fatura bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Form Modal */}
      <Modal isOpen={showInvoiceForm} onClose={() => setShowInvoiceForm(false)} title="Yeni Fatura">
        <InvoiceForm
          clients={clients}
          onSubmit={handleAddInvoice}
          onCancel={() => setShowInvoiceForm(false)}
        />
      </Modal>

      {/* Payment Form Modal */}
      <Modal isOpen={!!paymentInvoice} onClose={() => setPaymentInvoice(null)} title="Ödeme Ekle">
        {paymentInvoice && (
          <PaymentForm
            invoice={paymentInvoice}
            onSubmit={handleAddPayment}
            onCancel={() => setPaymentInvoice(null)}
          />
        )}
      </Modal>
    </div>
  )
}
