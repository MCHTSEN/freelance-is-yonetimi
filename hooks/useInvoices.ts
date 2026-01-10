import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Invoice, InvoiceInsert, InvoicePayment, InvoicePaymentInsert, Client } from '../lib/supabase'

export interface InvoiceWithDetails extends Invoice {
  clients: Client | null
  payments: InvoicePayment[]
  total_paid: number
  remaining: number
  status: 'unpaid' | 'partial' | 'paid' | 'overdue'
}

export type PaymentMethod = 'nakit' | 'havale' | 'eft' | 'kredi_karti' | 'diger'

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'nakit', label: 'Nakit' },
  { value: 'havale', label: 'Havale' },
  { value: 'eft', label: 'EFT' },
  { value: 'kredi_karti', label: 'Kredi Kartı' },
  { value: 'diger', label: 'Diğer' },
]

function calculateInvoiceStatus(invoice: Invoice, totalPaid: number): InvoiceWithDetails['status'] {
  const remaining = invoice.amount - totalPaid

  if (remaining <= 0) return 'paid'

  const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date()
  if (isOverdue && remaining > 0) return 'overdue'

  if (totalPaid > 0) return 'partial'

  return 'unpaid'
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch invoices with clients
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (*)
        `)
        .order('created_at', { ascending: false })

      if (invoicesError) throw invoicesError

      // Fetch all payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('invoice_payments')
        .select('*')
        .order('payment_date', { ascending: false })

      if (paymentsError) throw paymentsError

      // Group payments by invoice_id
      const paymentsByInvoice = (paymentsData || []).reduce((acc, payment) => {
        if (!acc[payment.invoice_id]) {
          acc[payment.invoice_id] = []
        }
        acc[payment.invoice_id].push(payment)
        return acc
      }, {} as Record<string, InvoicePayment[]>)

      // Calculate totals and status
      const invoicesWithDetails: InvoiceWithDetails[] = (invoicesData || []).map(invoice => {
        const payments = paymentsByInvoice[invoice.id] || []
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
        const remaining = invoice.amount - totalPaid
        const status = calculateInvoiceStatus(invoice, totalPaid)

        return {
          ...invoice,
          payments,
          total_paid: totalPaid,
          remaining: Math.max(0, remaining),
          status,
        }
      })

      setInvoices(invoicesWithDetails)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const addInvoice = async (invoice: Omit<InvoiceInsert, 'user_id'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı')

    const { data, error } = await supabase
      .from('invoices')
      .insert({ ...invoice, user_id: user.id })
      .select(`*, clients (*)`)
      .single()

    if (error) throw error

    const newInvoice: InvoiceWithDetails = {
      ...data,
      payments: [],
      total_paid: 0,
      remaining: data.amount,
      status: 'unpaid',
    }

    setInvoices(prev => [newInvoice, ...prev])
    return newInvoice
  }

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select(`*, clients (*)`)
      .single()

    if (error) throw error

    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const totalPaid = inv.total_paid
        const remaining = data.amount - totalPaid
        const status = calculateInvoiceStatus(data, totalPaid)
        return { ...data, payments: inv.payments, total_paid: totalPaid, remaining, status }
      }
      return inv
    }))

    return data
  }

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) throw error
    setInvoices(prev => prev.filter(inv => inv.id !== id))
  }

  // Kısmi ödeme ekle
  const addPayment = async (
    invoiceId: string,
    amount: number,
    paymentMethod?: PaymentMethod,
    notes?: string,
    paymentDate?: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı')

    const { data, error } = await supabase
      .from('invoice_payments')
      .insert({
        invoice_id: invoiceId,
        amount,
        payment_method: paymentMethod || null,
        notes: notes || null,
        payment_date: paymentDate || new Date().toISOString().split('T')[0],
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    // Update local state
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const newPayments = [data, ...inv.payments]
        const newTotalPaid = inv.total_paid + amount
        const newRemaining = Math.max(0, inv.amount - newTotalPaid)
        const newStatus = calculateInvoiceStatus(inv, newTotalPaid)

        // Eğer tamamen ödendiyse, is_paid ve paid_at güncelle
        if (newRemaining <= 0) {
          supabase
            .from('invoices')
            .update({ is_paid: true, paid_at: new Date().toISOString() })
            .eq('id', invoiceId)
            .then()
        }

        return {
          ...inv,
          payments: newPayments,
          total_paid: newTotalPaid,
          remaining: newRemaining,
          status: newStatus,
        }
      }
      return inv
    }))

    return data
  }

  // Ödemeyi sil
  const deletePayment = async (paymentId: string, invoiceId: string) => {
    const { error } = await supabase
      .from('invoice_payments')
      .delete()
      .eq('id', paymentId)

    if (error) throw error

    // Update local state
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const deletedPayment = inv.payments.find(p => p.id === paymentId)
        if (!deletedPayment) return inv

        const newPayments = inv.payments.filter(p => p.id !== paymentId)
        const newTotalPaid = inv.total_paid - deletedPayment.amount
        const newRemaining = inv.amount - newTotalPaid
        const newStatus = calculateInvoiceStatus(inv, newTotalPaid)

        return {
          ...inv,
          payments: newPayments,
          total_paid: newTotalPaid,
          remaining: newRemaining,
          status: newStatus,
        }
      }
      return inv
    }))
  }

  // Helper functions
  const getOverdueInvoices = useCallback(() => {
    return invoices.filter(inv => inv.status === 'overdue')
  }, [invoices])

  const getPendingInvoices = useCallback(() => {
    return invoices.filter(inv => inv.status === 'unpaid' || inv.status === 'partial')
  }, [invoices])

  const getPaidInvoices = useCallback(() => {
    return invoices.filter(inv => inv.status === 'paid')
  }, [invoices])

  const getPartialInvoices = useCallback(() => {
    return invoices.filter(inv => inv.status === 'partial')
  }, [invoices])

  const calculateStats = useCallback(() => {
    const totalReceivable = invoices.reduce((sum, inv) => sum + inv.remaining, 0)
    const totalOverdue = getOverdueInvoices().reduce((sum, inv) => sum + inv.remaining, 0)
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.total_paid, 0)

    // Bu hafta vadesi gelecekler
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const dueThisWeek = invoices
      .filter(inv => {
        if (!inv.due_date || inv.status === 'paid') return false
        const dueDate = new Date(inv.due_date)
        return dueDate >= today && dueDate <= nextWeek
      })
      .reduce((sum, inv) => sum + inv.remaining, 0)

    return {
      totalReceivable,
      totalOverdue,
      totalPaid,
      dueThisWeek,
      invoiceCount: invoices.length,
      overdueCount: getOverdueInvoices().length,
      pendingCount: getPendingInvoices().length,
      paidCount: getPaidInvoices().length,
    }
  }, [invoices, getOverdueInvoices, getPendingInvoices, getPaidInvoices])

  return {
    invoices,
    loading,
    error,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addPayment,
    deletePayment,
    getOverdueInvoices,
    getPendingInvoices,
    getPaidInvoices,
    getPartialInvoices,
    calculateStats,
    refetch: fetchInvoices,
  }
}
