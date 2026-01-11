import { useMemo, useState } from 'react'
import FormattedPriceInput from '../components/FormattedPriceInput'
import Modal from '../components/Modal'
import { useClients } from '../hooks/useClients'
import { PAYMENT_METHODS, useInvoices, type InvoiceWithDetails, type PaymentMethod } from '../hooks/useInvoices'
import { formatDurationDetailed, useTimeTracking } from '../hooks/useTimeTracking'

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
          <FormattedPriceInput
            value={formData.amount}
            onChange={(val) => setFormData(prev => ({ ...prev, amount: val }))}
            className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
            placeholder="10.000"
            required
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
        <FormattedPriceInput
          value={formData.amount}
          onChange={(val) => setFormData(prev => ({ ...prev, amount: val }))}
          className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
          placeholder="0"
          required
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
    <div className="flex flex-col h-full w-full overflow-hidden bg-transparent" onClick={() => setActionMenuOpen(null)}>
      <header className="px-10 py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shrink-0 relative z-20">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-rounded text-primary">payments</span>
            <span className="text-secondary text-[10px] uppercase font-black tracking-[0.2em] opacity-70">Financial Console</span>
          </div>
          <h1 className="text-white text-5xl font-black leading-none tracking-[-0.05em]">Revenue Control</h1>
          <p className="text-slate-500 text-base font-light max-w-lg mt-2">
            Automate your billing cycle and monitor your financial growth.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <button
              onClick={() => setShowInvoiceForm(true)}
              className="relative flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all active:scale-95 group overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <span className="material-symbols-rounded font-bold">add_notes</span>
              <span>Create New Invoice</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Stats */}
          {/* Visual Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
            {/* Main Receivable Widget */}
            <div className="col-span-1 lg:col-span-1 h-36 bg-glass-bg border border-glass-border rounded-[2rem] p-6 flex flex-col justify-between relative group hover:border-emerald-500/30 transition-all shadow-glass overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-rounded text-7xl text-emerald-500">account_balance_wallet</span>
               </div>
               <div>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Receivable</p>
                  <p className="text-white text-4xl font-black tracking-tighter">₺{stats.totalReceivable.toLocaleString()}</p>
               </div>
               <p className="text-[10px] text-slate-400 font-medium">{stats.pendingCount} active invoices</p>
            </div>

            {/* Overdue Widget */}
            <div className="size-full h-36 bg-glass-bg border border-glass-border rounded-[2rem] p-6 flex flex-col justify-between relative group hover:border-rose-500/30 transition-all shadow-glass overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-rounded text-7xl text-rose-500">priority_high</span>
               </div>
               <div>
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Overdue</p>
                  <p className="text-white text-3xl font-black tracking-tighter text-rose-400">₺{stats.totalOverdue.toLocaleString()}</p>
               </div>
               <p className="text-[10px] text-slate-400 font-medium">Immediate attention needed</p>
            </div>

            {/* This Week Widget */}
            <div className="size-full h-36 bg-glass-bg border border-glass-border rounded-[2rem] p-6 flex flex-col justify-between relative group hover:border-primary/30 transition-all shadow-glass overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-rounded text-7xl text-primary">event_upcoming</span>
               </div>
               <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Coming This Week</p>
                  <p className="text-white text-3xl font-black tracking-tighter">₺{stats.dueThisWeek.toLocaleString()}</p>
               </div>
               <p className="text-[10px] text-slate-400 font-medium">Estimated cash flow</p>
            </div>

            {/* Timer Console Widget */}
            <div className="size-full h-36 bg-surface-lighter border border-primary/20 rounded-[2rem] p-6 flex flex-col justify-between relative group hover:border-primary/50 transition-all shadow-premium overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                  <span className="material-symbols-rounded text-7xl text-primary animate-pulse">timer</span>
               </div>
               
               {activeEntry ? (
                 <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-1">
                       <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Active Session</p>
                       <span className="size-2 rounded-full bg-green-500 animate-ping" />
                    </div>
                    <p className="text-white text-2xl font-black font-mono tracking-tight my-auto">{formatDurationDetailed(elapsedSeconds)}</p>
                     <div className="flex items-center justify-between group/row mt-auto">
                        <span className="text-[10px] text-slate-400 truncate max-w-[80px]">{activeEntry.clients?.first_name || 'Project'}</span>
                        <button onClick={stopTimer} className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white text-[10px] font-black uppercase rounded-lg transition-all">Stop</button>
                     </div>
                 </div>
               ) : (
                  <div className="flex flex-col h-full">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Time Tracking</p>
                     <div className="mt-auto flex flex-col gap-2">
                        <div className="flex gap-2">
                           <select 
                              value={timerClientId} 
                              onChange={(e) => setTimerClientId(e.target.value)}
                              className="flex-1 bg-white/5 border border-white/5 rounded-xl text-[10px] text-slate-300 px-2 py-1.5 focus:outline-none focus:border-primary/50 appearance-none"
                           >
                              <option value="">Client...</option>
                              {clients.map(c => <option key={c.id} value={c.id}>{c.first_name}</option>)}
                           </select>
                           <button 
                              onClick={() => timerClientId && startTimer(timerDescription, undefined, timerClientId)}
                              className="size-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                           >
                              <span className="material-symbols-rounded font-black">play_arrow</span>
                           </button>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Daily total: {timeStatsData.todayFormatted}</p>
                     </div>
                  </div>
               )}
            </div>
          </div>

          {/* Filters & Table */}
          <div className="flex flex-col gap-4">
            <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`flex items-center justify-center gap-3 h-11 px-6 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all shrink-0 ${
                    filter === f.value
                      ? 'bg-white text-slate-900 border-white shadow-xl shadow-white/5'
                      : 'bg-white/5 border-glass-border text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {f.color && <span className={`size-1.5 rounded-full ${f.value === 'overdue' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-' + f.color + '-500'}`}></span>}
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
                        <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="py-6 px-8">
                             <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(inv.status)}`}>
                                <span className={`size-1.5 rounded-full ${inv.status === 'overdue' ? 'bg-rose-500 animate-pulse' : 'bg-current'}`} />
                                {getStatusLabel(inv.status)}
                             </span>
                          </td>
                          <td className="py-6 px-8 text-slate-400 font-mono text-xs">
                             #{inv.invoice_number || '---'}
                          </td>
                          <td className="py-6 px-8 font-bold text-white">
                             <div className="flex items-center gap-3">
                                <div className="size-8 rounded-xl bg-gradient-to-br from-primary/20 to-indigo-500/10 border border-primary/20 flex items-center justify-center text-[10px] text-primary font-black shadow-inner uppercase">
                                   {initials}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-sm">{clientName}</span>
                                   <span className="text-[10px] text-slate-500 font-medium">Standard Project</span>
                                </div>
                             </div>
                          </td>
                          <td className="py-6 px-8 text-slate-400 text-xs">
                             {inv.due_date ? new Date(inv.due_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </td>
                          <td className="py-6 px-8 text-right font-black text-white text-base">
                             ₺{inv.amount.toLocaleString()}
                          </td>
                          <td className="py-6 px-8">
                             <div className="w-32 flex flex-col gap-2">
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                   <div
                                      className={`h-full rounded-full transition-all duration-1000 ${
                                         progress >= 100 ? 'bg-emerald-500' :
                                         progress > 0 ? 'bg-amber-400' : 'bg-slate-700'
                                      }`}
                                      style={{ width: `${Math.min(progress, 100)}%` }}
                                   />
                                </div>
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">
                                   {progress.toFixed(0)}% Collected
                                </span>
                             </div>
                          </td>
                          <td className="py-6 px-8 text-right font-black text-white text-base">
                             <span className={inv.remaining > 0 ? 'text-rose-400/80' : 'text-slate-500'}>
                                ₺{inv.remaining.toLocaleString()}
                             </span>
                          </td>
                          <td className="py-6 px-8 text-center relative">
                             <div className="flex items-center justify-end gap-3">
                                {inv.status !== 'paid' && (
                                   <button
                                      onClick={() => setPaymentInvoice(inv)}
                                      className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 rounded-xl hover:bg-emerald-500 hover:text-slate-900 border border-emerald-500/20 transition-all active:scale-95"
                                   >
                                      Pay
                                   </button>
                                )}
                                <button
                                   onClick={(e) => { e.stopPropagation(); setActionMenuOpen(actionMenuOpen === inv.id ? null : inv.id) }}
                                   className="size-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                                >
                                   <span className="material-symbols-rounded text-[18px]">more_horiz</span>
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
