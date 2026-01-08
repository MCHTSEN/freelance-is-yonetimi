import React, { useState, useMemo } from 'react';

interface Invoice {
    id: string;
    client: string;
    date: string;
    total: number;
    paid: number;
    status: 'Gecikmiş' | 'Bekliyor' | 'Taslak' | 'Ödendi';
    initial: string;
    color: string;
}

export default function FinanceDashboard() {
  const [filter, setFilter] = useState('Tümü');
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: '#INV-001', client: 'TechCorp', date: '10 Eki 2023', total: 15000, paid: 0, status: 'Gecikmiş', initial: 'T', color: 'bg-indigo-500' },
    { id: '#INV-002', client: 'StartupX', date: '25 Kas 2023', total: 8000, paid: 2000, status: 'Bekliyor', initial: 'S', color: 'bg-blue-500' },
    { id: '#INV-003', client: 'DesignStudio', date: '01 Ara 2023', total: 5500, paid: 0, status: 'Bekliyor', initial: 'D', color: 'bg-purple-500' },
    { id: '#INV-004', client: 'GlobalInc', date: '15 Ara 2023', total: 12000, paid: 0, status: 'Taslak', initial: 'G', color: 'bg-emerald-500' },
    { id: '#INV-000', client: 'LocalBiz', date: '01 Eyl 2023', total: 2500, paid: 2500, status: 'Ödendi', initial: 'L', color: 'bg-orange-500' },
  ]);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const filteredInvoices = useMemo(() => {
      if (filter === 'Tümü') return invoices;
      return invoices.filter(i => i.status === filter);
  }, [invoices, filter]);

  const totalReceivable = useMemo(() => invoices.reduce((acc, curr) => acc + (curr.total - curr.paid), 0), [invoices]);
  const totalOverdue = useMemo(() => invoices.filter(i => i.status === 'Gecikmiş').reduce((acc, curr) => acc + (curr.total - curr.paid), 0), [invoices]);

  const handleAddInvoice = () => {
      const newInv: Invoice = {
          id: `#INV-00${invoices.length + 5}`,
          client: 'New Client Ltd',
          date: 'Bugün',
          total: Math.floor(Math.random() * 10000) + 1000,
          paid: 0,
          status: 'Taslak',
          initial: 'N',
          color: 'bg-pink-500'
      };
      setInvoices([newInv, ...invoices]);
  };

  const markAsPaid = (id: string) => {
      setInvoices(invoices.map(inv => {
          if (inv.id === id) {
              return { ...inv, paid: inv.total, status: 'Ödendi' };
          }
          return inv;
      }));
      setActionMenuOpen(null);
  };

  const deleteInvoice = (id: string) => {
      setInvoices(invoices.filter(inv => inv.id !== id));
      setActionMenuOpen(null);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background-dark" onClick={() => setActionMenuOpen(null)}>
      <div className="px-6 py-8 md:px-10 flex flex-wrap items-end justify-between gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">Finansal Takip</h2>
          <p className="text-text-secondary text-sm md:text-base">Nakit akışınızı yönetin ve ödenmemiş faturaları takip edin.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleAddInvoice} className="flex items-center gap-2 h-10 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95 transform">
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Yeni Fatura</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-3 p-5 rounded-xl border border-border-dark bg-surface-dark shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-text-secondary text-sm font-medium">Toplam Alacak</p>
                <span className="material-symbols-outlined text-emerald-500 bg-emerald-500/10 p-1 rounded">trending_up</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-white">₺{totalReceivable.toLocaleString()}</p>
                <span className="text-emerald-500 text-xs font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded-full">+12%</span>
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
                <p className="text-2xl font-bold text-red-400">₺{totalOverdue.toLocaleString()}</p>
                <span className="text-red-400 text-xs font-medium">Acil Aksiyon</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 p-5 rounded-xl border border-border-dark bg-surface-dark shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-text-secondary text-sm font-medium">Bu Hafta Gelecek</p>
                <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded">calendar_today</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-white">₺8,200</p>
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="flex flex-col gap-4">
             <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                {['Tümü', 'Vadesi Geçmiş', 'Bekleyen', 'Taslak'].map((t) => (
                  <button key={t} onClick={() => setFilter(t)} className={`flex items-center justify-center gap-2 h-9 px-4 rounded-full border text-sm font-medium transition-colors shrink-0 ${filter === t ? 'bg-white text-slate-900 border-white' : 'bg-surface-dark border-border-dark text-slate-300 hover:bg-[#1f2b36]'}`}>
                     {t === 'Vadesi Geçmiş' && <span className="size-2 rounded-full bg-red-500"></span>}
                     {t === 'Bekleyen' && <span className="size-2 rounded-full bg-amber-500"></span>}
                     {t === 'Taslak' && <span className="size-2 rounded-full bg-slate-400"></span>}
                     {t}
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
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary">Vade Tarihi</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary text-right">Tutar</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary text-right">Alınan</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary text-right">Kalan</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary text-center">İşlem</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-border-dark text-sm">
                         {filteredInvoices.map((inv) => (
                            <tr key={inv.id} className="group hover:bg-[#1f2b36] transition-colors">
                               <td className="py-4 px-6">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                      inv.status === 'Gecikmiş' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                      inv.status === 'Bekleyen' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                      inv.status === 'Ödendi' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                      'bg-slate-700/30 text-slate-400 border-slate-700/50'
                                  }`}>
                                     {inv.status}
                                  </span>
                               </td>
                               <td className="py-4 px-6 text-slate-400 font-mono">{inv.id}</td>
                               <td className="py-4 px-6 font-medium text-white">
                                  <div className="flex items-center gap-2">
                                     <div className={`size-6 rounded ${inv.color} flex items-center justify-center text-[10px] text-white font-bold`}>{inv.initial}</div>
                                     {inv.client}
                                  </div>
                               </td>
                               <td className="py-4 px-6 text-slate-400">{inv.date}</td>
                               <td className="py-4 px-6 text-right font-bold text-white">₺{inv.total.toLocaleString()}</td>
                               <td className="py-4 px-6 text-right font-medium text-slate-400">₺{inv.paid.toLocaleString()}</td>
                               <td className="py-4 px-6 text-right font-bold text-white">₺{(inv.total - inv.paid).toLocaleString()}</td>
                               <td className="py-4 px-6 text-center relative">
                                  <div className="flex items-center justify-end gap-2">
                                     <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors">Detay</button>
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); setActionMenuOpen(actionMenuOpen === inv.id ? null : inv.id); }}
                                        className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                     >
                                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                     </button>
                                     
                                     {actionMenuOpen === inv.id && (
                                         <div className="absolute right-8 top-10 w-32 bg-surface-lighter border border-border-dark shadow-xl rounded-lg z-20 py-1 flex flex-col items-start">
                                             <button onClick={() => markAsPaid(inv.id)} className="w-full text-left px-4 py-2 text-xs hover:bg-[#1f2b36] text-white hover:text-green-400">Ödendi İşaretle</button>
                                             <button onClick={() => deleteInvoice(inv.id)} className="w-full text-left px-4 py-2 text-xs hover:bg-[#1f2b36] text-white hover:text-red-400">Sil</button>
                                         </div>
                                     )}
                                  </div>
                               </td>
                            </tr>
                         ))}
                         {filteredInvoices.length === 0 && (
                             <tr>
                                 <td colSpan={8} className="py-8 text-center text-text-secondary">Fatura bulunamadı.</td>
                             </tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}