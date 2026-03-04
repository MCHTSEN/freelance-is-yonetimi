import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Filter,
    History,
    Loader2,
    MoreHorizontal,
    Play,
    Plus,
    Square,
    Timer,
    Trash2,
    TrendingUp,
    Wallet
} from 'lucide-react'
import { useMemo, useState } from 'react'
import FormattedPriceInput from '../components/FormattedPriceInput'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
    Card,
    CardContent
} from '../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '../components/ui/dropdown-menu'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../components/ui/table'
import { useClients } from '../hooks/useClients'
import { PAYMENT_METHODS, useInvoices, type InvoiceWithDetails, type PaymentMethod } from '../hooks/useInvoices'
import { formatDurationDetailed, useTimeTracking } from '../hooks/useTimeTracking'
import { cn } from '../lib/utils'

type FilterType = 'all' | 'overdue' | 'partial' | 'unpaid' | 'paid'

const FILTERS: { value: FilterType; label: string; variant: "default" | "secondary" | "outline" | "destructive" }[] = [
  { value: 'all', label: 'Tümü', variant: 'outline' },
  { value: 'overdue', label: 'Vadesi Geçmiş', variant: 'destructive' },
  { value: 'partial', label: 'Kısmi Ödeme', variant: 'secondary' },
  { value: 'unpaid', label: 'Bekleyen', variant: 'outline' },
  { value: 'paid', label: 'Ödendi', variant: 'default' },
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
    client_id: 'none',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    invoice_number: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await onSubmit({
        client_id: formData.client_id === 'none' ? null : formData.client_id,
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
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Müşteri</Label>
        <Select
          value={formData.client_id}
          onValueChange={(val) => setFormData(prev => ({ ...prev, client_id: val }))}
        >
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Müşteri seçin..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Müşteri seçin...</SelectItem>
            {clients.map(client => (
              <SelectItem key={client.id} value={client.id}>
                {client.first_name} {client.last_name} {client.company && `(${client.company})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tutar (₺)*</Label>
          <FormattedPriceInput
            value={formData.amount}
            onChange={(val) => setFormData(prev => ({ ...prev, amount: val }))}
            className="text-xs"
            placeholder="10.000"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Fatura No</Label>
          <Input
            value={formData.invoice_number}
            onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
            className="text-xs"
            placeholder="INV-001"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Vade Tarihi</Label>
        <Input
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label>Notlar</Label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          placeholder="Ek notlar..."
        />
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs">
          {error}
        </div>
      )}

      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={onCancel} className="flex-1">İptal</Button>
        <Button type="submit" disabled={loading} className="flex-1 gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : (
            <><Plus className="size-4" /> Fatura Ekle</>
          )}
        </Button>
      </DialogFooter>
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
    method: 'cash' as PaymentMethod,
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

      await onSubmit(amount, formData.method, formData.notes || undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="p-4 bg-accent/50 rounded-xl border space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Fatura Tutarı</span>
          <span className="text-sm font-bold">₺{invoice.amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Kalan</span>
          <span className="text-sm font-bold text-amber-500">₺{invoice.remaining.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Ödeme Tutarı (₺)*</Label>
        <FormattedPriceInput
          value={formData.amount}
          onChange={(val) => setFormData(prev => ({ ...prev, amount: val }))}
          className="text-xs"
          placeholder="0"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Ödeme Yöntemi</Label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map(method => (
            <Button
              key={method.value}
              type="button"
              variant={formData.method === method.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, method: method.value as PaymentMethod }))}
              className="text-xs font-bold uppercase h-8"
            >
              {method.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Not</Label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="text-xs"
          placeholder="Ödeme notu..."
        />
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs">
          {error}
        </div>
      )}

      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={onCancel} className="flex-1">İptal</Button>
        <Button type="submit" disabled={loading} className="flex-1 gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : (
            <><CheckCircle2 className="size-4" /> Ödemeyi Kaydet</>
          )}
        </Button>
      </DialogFooter>
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
  const [historyInvoice, setHistoryInvoice] = useState<InvoiceWithDetails | null>(null)
  const [timerClientId, setTimerClientId] = useState<string>('')

  const stats = calculateStats()
  const timeStatsData = timeStats()

  const filteredInvoices = useMemo(() => {
    if (filter === 'all') return invoices
    return invoices.filter(inv => inv.status === filter)
  }, [invoices, filter])

  const handleAddInvoice = async (data: any) => {
    await addInvoice(data)
    setShowInvoiceForm(false)
  }

  const handleAddPayment = async (amount: number, method?: PaymentMethod, notes?: string) => {
    if (!paymentInvoice) return
    await addPayment(paymentInvoice.id, amount, method, notes)
    setPaymentInvoice(null)
  }

  const getStatusConfig = (status: InvoiceWithDetails['status']) => {
    switch (status) {
      case 'overdue': return { label: 'Gecikmiş', variant: 'destructive' as const }
      case 'partial': return { label: 'Kısmi', variant: 'secondary' as const }
      case 'unpaid': return { label: 'Bekleyen', variant: 'outline' as const }
      case 'paid': return { label: 'Ödendi', variant: 'default' as const }
    }
  }

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      <header className="px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="size-4 text-primary" />
            <span className="text-primary text-xs uppercase font-bold tracking-[0.2em] opacity-80">Finans Yönetimi</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Cari Kontrolü</h1>
          <p className="text-muted-foreground text-sm max-w-lg mt-1">
            Fatura takibinizi yapın ve tahsilat sürecinizi hızlandırın.
          </p>
        </div>

        <Button onClick={() => setShowInvoiceForm(true)} className="gap-2 px-6 h-12 shadow-lg hover:shadow-primary/20 transition-all">
          <Plus className="size-4" />
          <span>Yeni Fatura Oluştur</span>
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-8 pb-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/40 shadow-sm bg-card/50">
               <CardContent className="p-5 flex flex-col justify-between h-32">
                  <div className="flex justify-between items-start">
                     <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <Wallet className="size-5" />
                     </div>
                     <Badge variant="outline" className="text-xs font-bold text-emerald-600 border-emerald-200 bg-emerald-500/5">TOPLAM ALACAK</Badge>
                  </div>
                  <div className="mt-auto">
                     <p className="text-2xl font-bold">₺{stats.totalReceivable.toLocaleString()}</p>
                     <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stats.pendingCount} Aktif Kayıt</p>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm bg-card/50">
               <CardContent className="p-5 flex flex-col justify-between h-32">
                  <div className="flex justify-between items-start">
                     <div className="size-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                        <AlertCircle className="size-5" />
                     </div>
                     <Badge variant="outline" className="text-xs font-bold text-destructive border-destructive/20 bg-destructive/5">GECİKEN</Badge>
                  </div>
                  <div className="mt-auto">
                     <p className="text-2xl font-bold text-destructive">₺{stats.totalOverdue.toLocaleString()}</p>
                     <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tahsilat Bekleyen</p>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm bg-card/50">
               <CardContent className="p-5 flex flex-col justify-between h-32">
                  <div className="flex justify-between items-start">
                     <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar className="size-5" />
                     </div>
                     <Badge variant="outline" className="text-xs font-bold text-primary border-primary/20 bg-primary/5">BU HAFTA</Badge>
                  </div>
                  <div className="mt-auto">
                     <p className="text-2xl font-bold">₺{stats.dueThisWeek.toLocaleString()}</p>
                     <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Planlanan Giriş</p>
                  </div>
               </CardContent>
            </Card>

            {/* Timer Mini Console */}
            <Card className="border-primary/20 shadow-md bg-primary/5">
                <CardContent className="p-5 flex flex-col justify-between h-32">
                   {activeEntry ? (
                     <>
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-2">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Çalışıyor</span>
                           </div>
                           <Badge className="text-xs font-bold">{activeEntry.clients?.first_name || 'Aktif'}</Badge>
                        </div>
                        <div className="flex items-end justify-between mt-auto">
                           <p className="text-2xl font-mono font-bold leading-none">{formatDurationDetailed(elapsedSeconds)}</p>
                           <Button size="icon" variant="destructive" className="h-8 w-8 rounded-lg" onClick={stopTimer}>
                             <Square className="size-3.5 fill-current" />
                           </Button>
                        </div>
                     </>
                   ) : (
                     <>
                        <div className="flex justify-between items-start">
                           <Timer className="size-5 text-muted-foreground" />
                           <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hızlı Başlat</span>
                        </div>
                        <div className="flex gap-2 items-center mt-auto">
                          <Select value={timerClientId} onValueChange={setTimerClientId}>
                            <SelectTrigger className="h-8 text-xs font-bold uppercase w-full bg-background/50">
                              <SelectValue placeholder="MÜŞTERİ" />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Button 
                            size="icon" 
                            className="h-8 w-8 shrink-0 rounded-lg" 
                            onClick={() => timerClientId && startTimer('', undefined, timerClientId)}
                          >
                             <Play className="size-3.5 fill-current" />
                          </Button>
                        </div>
                     </>
                   )}
                </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
            <div className="flex items-center justify-between overflow-x-auto no-scrollbar pb-2">
               <div className="flex gap-2">
                  {FILTERS.map(f => (
                    <Button
                      key={f.value}
                      variant={filter === f.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(f.value)}
                      className="text-xs font-bold uppercase h-9 rounded-xl px-4"
                    >
                      {filter === f.value && <Filter className="size-3 mr-2" />}
                      {f.label}
                    </Button>
                  ))}
               </div>
            </div>

            <div className="border rounded-2xl overflow-hidden bg-card/30 backdrop-blur-sm">
               <Table>
                  <TableHeader className="bg-muted/50">
                     <TableRow>
                        <TableHead className="w-32 text-xs font-bold uppercase py-4">Durum</TableHead>
                        <TableHead className="text-xs font-bold uppercase py-4">Fatura No</TableHead>
                        <TableHead className="text-xs font-bold uppercase py-4">Müşteri</TableHead>
                        <TableHead className="text-xs font-bold uppercase py-4">Vade</TableHead>
                        <TableHead className="text-right text-xs font-bold uppercase py-4">Tutar</TableHead>
                        <TableHead className="w-40 text-xs font-bold uppercase py-4">Süreç</TableHead>
                        <TableHead className="text-right text-xs font-bold uppercase py-4">Kalan</TableHead>
                        <TableHead className="text-center text-xs font-bold uppercase py-4">İşlem</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {filteredInvoices.map((inv) => {
                       const progress = inv.amount > 0 ? (inv.total_paid / inv.amount) * 100 : 0
                       const statusConfig = getStatusConfig(inv.status)
                       return (
                         <TableRow key={inv.id} className="group transition-colors">
                           <TableCell>
                              <Badge variant={statusConfig.variant} className="text-xs font-bold uppercase">
                                {statusConfig.label}
                              </Badge>
                           </TableCell>
                           <TableCell className="font-mono text-xs text-muted-foreground uppercase">
                             #{inv.invoice_number || '---'}
                           </TableCell>
                           <TableCell>
                              <div className="flex items-center gap-3">
                                 <div className="size-8 rounded-lg bg-accent flex items-center justify-center text-xs font-bold">
                                   {inv.clients?.first_name[0]}{inv.clients?.last_name?.[0] || ''}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold truncate leading-none mb-1">
                                      {inv.clients ? `${inv.clients.first_name} ${inv.clients.last_name}` : 'Genel'}
                                    </span>
                                    <span className="text-xs text-muted-foreground uppercase font-medium">{inv.clients?.company || 'Proje'}</span>
                                 </div>
                              </div>
                           </TableCell>
                           <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                             {inv.due_date ? new Date(inv.due_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '-'}
                           </TableCell>
                           <TableCell className="text-right font-bold text-sm">
                             ₺{inv.amount.toLocaleString()}
                           </TableCell>
                           <TableCell>
                              <div className="space-y-2">
                                 <div className="h-1 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className={cn(
                                        "h-full rounded-full transition-all duration-700",
                                        progress >= 100 ? "bg-emerald-500" : "bg-primary"
                                      )}
                                      style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                 </div>
                                 <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">%{progress.toFixed(0)} Tahsil</span>
                              </div>
                           </TableCell>
                           <TableCell className="text-right font-bold text-sm">
                             <span className={inv.remaining > 0 ? "text-amber-500" : "text-emerald-500"}>
                                ₺{inv.remaining.toLocaleString()}
                             </span>
                           </TableCell>
                           <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                 {inv.status !== 'paid' && (
                                   <Button
                                     size="sm"
                                     variant="ghost"
                                     className="h-8 px-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                     onClick={() => setPaymentInvoice(inv)}
                                   >
                                      Öde
                                   </Button>
                                 )}
                                 {inv.payments.length > 0 && (
                                   <Button
                                     size="sm"
                                     variant="ghost"
                                     className="h-8 px-3 text-muted-foreground hover:text-foreground"
                                     onClick={() => setHistoryInvoice(inv)}
                                   >
                                     <History className="size-3.5 mr-1.5" />
                                     Geçmiş
                                   </Button>
                                 )}
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                       <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <MoreHorizontal className="size-4" />
                                       </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                       <DropdownMenuItem 
                                         className="text-destructive gap-2"
                                         onClick={() => {
                                           if (confirm('Bu faturayı silmek istediğinize emin misiniz?')) {
                                             deleteInvoice(inv.id)
                                           }
                                         }}
                                       >
                                          <Trash2 className="size-4" />
                                          Faturayı Sil
                                       </DropdownMenuItem>
                                    </DropdownMenuContent>
                                 </DropdownMenu>
                              </div>
                           </TableCell>
                         </TableRow>
                       )
                     })}
                     {filteredInvoices.length === 0 && (
                        <TableRow>
                           <TableCell colSpan={8} className="h-32 text-center text-muted-foreground opacity-50">
                              Kayıt bulunamadı.
                           </TableCell>
                        </TableRow>
                     )}
                  </TableBody>
               </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <Dialog open={showInvoiceForm} onOpenChange={setShowInvoiceForm}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Fatura Kaydı</DialogTitle>
            <DialogDescription>Yeni bir fatura girişi yaparak cari takibini başlatın.</DialogDescription>
          </DialogHeader>
          <InvoiceForm
            clients={clients}
            onSubmit={handleAddInvoice}
            onCancel={() => setShowInvoiceForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={!!paymentInvoice} onOpenChange={(open) => !open && setPaymentInvoice(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Tahsilat Kaydı</DialogTitle>
            <DialogDescription>Gelen ödemeyi faturaya mahsup edin.</DialogDescription>
          </DialogHeader>
          {paymentInvoice && (
            <PaymentForm
              invoice={paymentInvoice}
              onSubmit={handleAddPayment}
              onCancel={() => setPaymentInvoice(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
