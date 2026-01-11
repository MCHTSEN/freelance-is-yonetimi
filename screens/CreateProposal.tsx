import { useState } from 'react';
import FormattedPriceInput from '../components/FormattedPriceInput';
import RichTextEditor from '../components/RichTextEditor';

interface LineItem {
  id: number;
  name: string;
  desc: string;
  qty: number;
  price: number;
}

export default function CreateProposal() {
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, name: 'UI/UX Design', desc: 'High-fidelity prototype design on Figma', qty: 40, price: 65 },
    { id: 2, name: 'Frontend Geliştirme', desc: 'Responsive coding with React & Tailwind', qty: 60, price: 70 },
  ]);
  const [taxRate, setTaxRate] = useState(0.20);
  const [title, setTitle] = useState("E-Commerce Platform Redesign");
  const [proposalNote, setProposalNote] = useState('');

  const total = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const vat = total * taxRate;
  const grandTotal = total + vat;

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: Date.now(),
      name: '',
      desc: '',
      qty: 1,
      price: 0
    };
    setItems([...items, newItem]);
  };

  const handleDeleteItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleUpdateItem = (id: number, field: keyof LineItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSave = () => {
    const btn = document.getElementById('save-btn');
    if(btn) btn.innerText = 'Syncing...';
    setTimeout(() => {
        if(btn) {
            btn.innerText = 'Synced!';
            setTimeout(() => btn.innerText = 'Save Draft', 2000);
        }
    }, 800);
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-transparent selection:bg-primary/30">
      <div className="max-w-6xl mx-auto px-10 py-12 space-y-12 pb-32">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-2">
              <div className="flex items-center gap-2">
                 <div className="size-2 rounded-full bg-primary animate-pulse" />
                 <span className="text-primary text-[10px] uppercase font-black tracking-widest opacity-80">Proposal Studio</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight leading-none">Drafting New Proposal</h1>
              <p className="text-slate-500 text-sm font-medium">Create and customize a professional quote for your client.</p>
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={handleSave} 
                id="save-btn" 
                className="h-12 px-8 flex items-center gap-3 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black uppercase tracking-widest text-xs"
              >
                <span className="material-symbols-rounded text-[20px]">save</span>
                Save Draft
              </button>
              <button className="h-12 px-8 flex items-center gap-3 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95">
                <span className="material-symbols-rounded text-[20px]">send</span>
                Send to Client
              </button>
           </div>
        </div>

        {/* Templates Grid */}
        <section className="space-y-6">
           <div className="flex items-center gap-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 whitespace-nowrap">Rapid Templates</h3>
              <div className="h-px w-full bg-white/5" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: 'terminal', title: 'System Architecture', desc: 'Backend systems and cloud infra.', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                { icon: 'palette', title: 'Brand Identity', desc: 'UI/UX and visual design language.', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                { icon: 'rocket_launch', title: 'Full-Stack MVP', desc: 'Rapid development for startups.', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              ].map((t, i) => (
                <button key={i} className={`group relative p-6 rounded-[2rem] bg-glass-bg border border-white/5 hover:border-primary/40 transition-all duration-500 text-left overflow-hidden shadow-xl`}>
                   <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors" />
                   <div className={`size-12 rounded-2xl flex items-center justify-center ${t.bg} ${t.color} mb-4 shadow-inner`}>
                      <span className="material-symbols-rounded text-[24px]">{t.icon}</span>
                   </div>
                   <h4 className="text-white font-bold text-base mb-1">{t.title}</h4>
                   <p className="text-slate-500 text-xs leading-relaxed">{t.desc}</p>
                </button>
              ))}
           </div>
        </section>

        {/* Core Configuration */}
        <div className="p-8 md:p-10 rounded-[2.5rem] bg-glass-bg border border-white/5 shadow-2xl space-y-10 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
           
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Proposal Subject</label>
                 <input 
                    className="h-14 w-full rounded-2xl bg-white/5 border border-white/5 px-6 text-lg text-white font-black tracking-tight focus:border-primary/50 transition-all outline-none" 
                    placeholder="Enter project name..." 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                 />
              </div>
              <div className="lg:col-span-4 space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Reference ID</label>
                 <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black opacity-50 text-sm">PR-</span>
                    <input className="h-14 w-full rounded-2xl bg-white/5 border border-white/5 pl-14 pr-6 text-sm font-black text-slate-300 focus:border-primary/50 transition-all outline-none" defaultValue="2024-V12" />
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Assign Client</label>
                 <div className="relative group">
                    <select className="h-12 w-full appearance-none rounded-xl bg-white/5 border border-white/5 px-6 text-sm font-bold text-white focus:border-primary/50 transition-all outline-none cursor-pointer pr-10">
                       <option className="bg-slate-900">Acme Global Inc.</option>
                       <option className="bg-slate-900">TechNexus Studio</option>
                       <option className="bg-slate-900">IronGate Security</option>
                    </select>
                    <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-primary transition-colors">expand_more</span>
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Proposal Date</label>
                 <input type="date" className="h-12 w-full rounded-xl bg-white/5 border border-white/5 px-4 text-sm font-bold text-white focus:border-primary/50 transition-all outline-none [color-scheme:dark]" defaultValue="2023-10-24" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Validity Expires</label>
                 <input type="date" className="h-12 w-full rounded-xl bg-white/5 border border-white/5 px-4 text-sm font-bold text-white focus:border-primary/50 transition-all outline-none [color-scheme:dark]" defaultValue="2023-11-24" />
              </div>
           </div>

           {/* Line Items Table */}
           <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black text-white tracking-tight">Financial Allocation</h3>
                 <button onClick={handleAddItem} className="px-4 py-2 flex items-center gap-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                    <span className="material-symbols-rounded text-[18px]">add_task</span>
                    Append Resource
                 </button>
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02]">
                 <table className="w-full text-left">
                    <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                       <tr>
                          <th className="px-8 py-5">Service / Milestone</th>
                          <th className="px-4 py-5 text-center">Units</th>
                          <th className="px-4 py-5 text-center">Unit Price</th>
                          <th className="px-8 py-5 text-right">Allocation</th>
                          <th className="px-4 py-5"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {items.map((item) => (
                          <tr key={item.id} className="group/row hover:bg-white/[0.02] transition-all">
                             <td className="px-8 py-6">
                                <input 
                                   className="w-full bg-transparent border-none p-0 text-white font-black tracking-tight placeholder:text-slate-700 focus:ring-0 text-base mb-1" 
                                   value={item.name} 
                                   placeholder="Title..."
                                   onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                                />
                                <input 
                                   className="w-full bg-transparent border-none p-0 text-xs text-slate-500 font-medium placeholder:text-slate-700 focus:ring-0" 
                                   value={item.desc}
                                   placeholder="Strategic description..." 
                                   onChange={(e) => handleUpdateItem(item.id, 'desc', e.target.value)}
                                />
                             </td>
                             <td className="px-4 py-6">
                                <input type="number" 
                                   className="w-20 mx-auto rounded-xl bg-white/5 border border-white/5 px-2 py-2 text-center text-sm font-bold text-white focus:border-primary/30 transition-all outline-none block" 
                                   value={item.qty} 
                                   onChange={(e) => handleUpdateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                                />
                             </td>
                             <td className="px-4 py-6">
                                <div className="relative w-32 mx-auto">
                                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xs">$</span>
                                    <FormattedPriceInput 
                                       className="w-full rounded-xl bg-white/5 border border-white/5 pl-7 pr-3 py-2 text-right text-sm font-bold text-white focus:border-primary/30 transition-all outline-none" 
                                       value={item.price} 
                                       onChange={(val) => handleUpdateItem(item.id, 'price', parseFloat(val) || 0)}
                                    />
                                </div>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <span className="text-white font-black text-base">${(item.price * item.qty).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                             </td>
                             <td className="px-4 py-6 text-center">
                                <button onClick={() => handleDeleteItem(item.id)} className="opacity-0 group-hover/row:opacity-100 text-slate-500 hover:text-rose-500 transition-all">
                                   <span className="material-symbols-rounded text-xl">delete</span>
                                </button>
                             </td>
                          </tr>
                       ))}
                       {items.length === 0 && (
                          <tr>
                             <td colSpan={5} className="py-16 text-center text-slate-500 italic font-medium uppercase tracking-widest text-xs opacity-50">Empty Manifest • Add Resources to Populate</td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>

              {/* Summary Block */}
              <div className="flex justify-end pt-4">
                 <div className="w-80 space-y-4 p-8 rounded-3xl bg-white/5 border border-white/5 shadow-inner">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Resource Base</span>
                       <span className="text-slate-300 font-bold">${total.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tax Protocol</span>
                          <select 
                             value={taxRate}
                             onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                             className="rounded-lg bg-white/5 border border-white/5 px-2 py-1 text-[10px] font-black text-primary outline-none appearance-none"
                          >
                             <option value={0.18} className="bg-slate-900">%18</option>
                             <option value={0.20} className="bg-slate-900">%20</option>
                             <option value={0} className="bg-slate-900">%0</option>
                          </select>
                       </div>
                       <span className="text-slate-300 font-bold">${vat.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-black uppercase tracking-widest text-white">Project Total</span>
                       <span className="text-2xl font-black text-primary drop-shadow-[0_0_10px_rgba(79,70,229,0.3)]">${grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Strategic Context */}
           <div className="space-y-6 pt-10">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                 <h3 className="text-xl font-black text-white tracking-tight">Semantic Project Overview</h3>
                 <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
                    <button className="px-4 py-1.5 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest transition-all">Editor</button>
                    <button className="px-4 py-1.5 rounded-lg text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Preview</button>
                 </div>
              </div>
              
              <div className="relative">
                 <RichTextEditor
                   content={`<h3 style="color: white; font-weight: 800; font-size: 1.5rem; margin-bottom: 1rem;">Executive Summary</h3><p>Detailed breakdown of proposed deliverables and system architecture refinements requested by the stakeholder.</p>`}
                   placeholder="Outline the project scope, technical requirements, and strategic vision..."
                   onChange={() => {}}
                 />
              </div>
           </div>

           {/* Personal Context */}
           <div className="space-y-3 pt-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-amber-500/80 flex items-center gap-2 ml-1">
                 <span className="material-symbols-rounded text-sm">lock_person</span> Private Archival Notes
              </label>
              <textarea 
                 value={proposalNote}
                 onChange={(e) => setProposalNote(e.target.value)}
                 className="w-full rounded-[1.5rem] bg-white/[0.03] border border-white/5 p-6 text-sm text-slate-300 font-medium placeholder:text-slate-700 focus:border-amber-500/30 transition-all h-32 outline-none resize-none" 
                 placeholder="Internal context, risk assessments, or negotiation strategy..." 
              />
           </div>
        </div>

        {/* Global Action Bar */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-8 py-4 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-110 md:scale-100">
           <button className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">Discard</button>
           <div className="w-px h-6 bg-white/10" />
           <button onClick={handleSave} className="px-8 py-2.5 rounded-xl bg-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/5 shadow-xl">Save As Template</button>
           <button className="px-10 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">Deploy Proposal</button>
        </div>
      </div>
    </div>
  );
}