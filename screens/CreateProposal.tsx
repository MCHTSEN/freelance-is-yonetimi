import React, { useState } from 'react';

interface LineItem {
  id: number;
  name: string;
  desc: string;
  qty: number;
  price: number;
}

export default function CreateProposal() {
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, name: 'UI/UX Tasarımı', desc: 'Figma üzerinde high-fidelity prototip tasarımı', qty: 40, price: 65 },
    { id: 2, name: 'Frontend Geliştirme', desc: 'React ve Tailwind CSS ile responsive kodlama', qty: 60, price: 70 },
  ]);
  const [taxRate, setTaxRate] = useState(0.18);
  const [title, setTitle] = useState("E-Ticaret Sitesi Yenileme");

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
    // Simulate API call
    const btn = document.getElementById('save-btn');
    if(btn) btn.innerText = 'Kaydediliyor...';
    setTimeout(() => {
        if(btn) {
            btn.innerText = 'Kaydedildi!';
            setTimeout(() => btn.innerText = 'Taslağı Kaydet', 2000);
        }
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto w-full">
      <div className="w-full max-w-[1024px] flex flex-col gap-8 pb-12">
        {/* Page Heading & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
              <span>Teklifler</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Yeni Oluştur</span>
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-white">Yeni Teklif Oluştur</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSave} id="save-btn" className="group flex h-10 items-center justify-center gap-2 rounded-lg bg-surface-dark border border-surface-lighter px-4 text-sm font-bold text-white hover:bg-surface-lighter transition-all">
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Taslağı Kaydet</span>
            </button>
            <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-blue-600 px-4 text-sm font-bold text-white transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span>PDF İndir</span>
            </button>
          </div>
        </div>

        {/* Templates */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">dashboard</span>
              Hızlı Başlangıç Şablonları
            </h3>
            <a href="#" className="text-sm font-medium text-primary hover:underline">Tümünü Gör</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: 'code', title: 'Web Geliştirme', desc: 'Standart kurumsal web sitesi geliştirme.', color: 'text-blue-500 bg-blue-500/10' },
              { icon: 'search', title: 'SEO Danışmanlığı', desc: 'Aylık SEO optimizasyonu ve raporlama.', color: 'text-purple-500 bg-purple-500/10' },
              { icon: 'smartphone', title: 'Mobil Uygulama', desc: 'iOS ve Android için MVP geliştirme.', color: 'text-orange-500 bg-orange-500/10' },
            ].map((t, i) => (
              <div key={i} className="group relative flex flex-col overflow-hidden rounded-xl bg-surface-dark border border-surface-lighter p-4 shadow-sm hover:border-primary/50 transition-all cursor-pointer">
                 <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                </div>
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${t.color}`}>
                  <span className="material-symbols-outlined">{t.icon}</span>
                </div>
                <p className="mb-1 text-base font-bold text-white">{t.title}</p>
                <p className="text-sm text-text-secondary line-clamp-2">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Main Form */}
        <div className="flex flex-col gap-6 rounded-2xl bg-surface-dark border border-surface-lighter p-6 shadow-sm">
          {/* Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-200">Teklif Başlığı</label>
              <input 
                className="h-12 w-full rounded-lg border-surface-lighter bg-[#111a22] px-4 text-base text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                placeholder="Örn: E-Ticaret Sitesi" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-200">Teklif No</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">#</span>
                <input className="h-12 w-full rounded-lg border-surface-lighter bg-[#111a22] pl-8 pr-4 text-base font-mono text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" defaultValue="TK-2023-084" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-200">Müşteri</label>
              <div className="relative">
                <select className="h-12 w-full appearance-none rounded-lg border-surface-lighter bg-[#111a22] px-4 text-base text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                  <option>Acme Corp Inc.</option>
                  <option>TechStart Ltd.</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>
             <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-200">Oluşturma Tarihi</label>
              <input type="date" className="h-12 w-full rounded-lg border-surface-lighter bg-[#111a22] px-4 text-base text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [color-scheme:dark]" defaultValue="2023-10-24" />
            </div>
             <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-200">Geçerlilik Tarihi</label>
              <input type="date" className="h-12 w-full rounded-lg border-surface-lighter bg-[#111a22] px-4 text-base text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [color-scheme:dark]" defaultValue="2023-11-24" />
            </div>
          </div>

          <hr className="border-surface-lighter my-2" />

          {/* Line Items */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Hizmet ve Ürünler</h3>
              <button 
                onClick={handleAddItem}
                className="text-sm font-medium text-primary hover:text-blue-400 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Kalem Ekle
              </button>
            </div>
            
            <div className="w-full overflow-x-auto rounded-lg border border-surface-lighter">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-[#111a22] text-text-secondary font-medium">
                  <tr>
                    <th className="px-4 py-3 w-[40%]">Hizmet / Açıklama</th>
                    <th className="px-4 py-3 w-[15%]">Miktar</th>
                    <th className="px-4 py-3 w-[20%]">Birim Fiyat</th>
                    <th className="px-4 py-3 w-[20%] text-right">Toplam</th>
                    <th className="px-4 py-3 w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-lighter bg-surface-dark">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="group">
                      <td className="p-3">
                         <input 
                            className="w-full bg-transparent border-none p-0 text-white font-medium placeholder:text-slate-500 focus:ring-0" 
                            value={item.name} 
                            placeholder="Hizmet adı..."
                            onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                         />
                         <input 
                            className="w-full bg-transparent border-none p-0 text-xs text-text-secondary focus:ring-0 mt-1 placeholder:text-slate-600" 
                            value={item.desc}
                            placeholder="Detaylı açıklama..." 
                            onChange={(e) => handleUpdateItem(item.id, 'desc', e.target.value)}
                         />
                      </td>
                       <td className="p-3">
                        <input type="number" 
                            className="w-full rounded bg-[#111a22] border border-surface-lighter px-2 py-1 text-center text-white focus:border-primary focus:ring-1 focus:ring-primary" 
                            value={item.qty} 
                            onChange={(e) => handleUpdateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-3">
                         <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                          <input type="number" 
                            className="w-full rounded bg-[#111a22] border border-surface-lighter pl-5 pr-2 py-1 text-right text-white focus:border-primary focus:ring-1 focus:ring-primary" 
                            value={item.price} 
                            onChange={(e) => handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </td>
                      <td className="p-3 text-right font-medium text-white">${(item.price * item.qty).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                       <td className="p-3 text-center">
                        <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                        <td colSpan={5} className="p-6 text-center text-text-secondary italic">Henüz hizmet eklenmedi.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end pt-4">
              <div className="w-full max-w-[300px] flex flex-col gap-3">
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Ara Toplam</span>
                  <span>${total.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                 <div className="flex justify-between text-sm text-text-secondary items-center">
                  <div className="flex items-center gap-2">
                    <span>KDV</span>
                    <select 
                        value={taxRate}
                        onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                        className="rounded bg-[#111a22] border border-surface-lighter px-1 py-0.5 text-xs text-white"
                    >
                      <option value={0.18}>%18</option>
                      <option value={0.20}>%20</option>
                      <option value={0}>%0</option>
                    </select>
                  </div>
                  <span>${vat.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="h-px bg-surface-lighter w-full my-1"></div>
                <div className="flex justify-between text-lg font-bold text-white">
                  <span>Genel Toplam</span>
                  <span className="text-primary">${grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>
          </div>
          
           <hr className="border-surface-lighter my-2" />
           
           {/* Editor Mock */}
           <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Teklif İçeriği</h3>
                <div className="flex rounded-lg bg-[#111a22] p-1">
                  <button className="rounded-md bg-surface-lighter shadow-sm px-3 py-1 text-xs font-medium text-white">Editör</button>
                  <button className="rounded-md px-3 py-1 text-xs font-medium text-text-secondary hover:text-white">Önizleme</button>
                </div>
              </div>
              <div className="rounded-xl border border-surface-lighter bg-[#111a22] overflow-hidden flex flex-col">
                <div className="flex items-center gap-1 border-b border-surface-lighter p-2 flex-wrap">
                  {['format_bold', 'format_italic', 'format_underlined', 'format_h1', 'format_list_bulleted', 'link', 'image'].map((icon, i) => (
                     <button key={i} className="p-1.5 rounded hover:bg-surface-lighter text-text-secondary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    </button>
                  ))}
                </div>
                <div className="p-4 text-slate-200 leading-relaxed outline-none min-h-[200px]" contentEditable suppressContentEditableWarning>
                   <h3 className="text-xl font-bold mb-3">Proje Kapsamı</h3>
                  <p className="mb-4 text-text-secondary">Bu teklif, Acme Corp için geliştirilecek e-ticaret web sitesinin tasarım ve kodlama aşamalarını kapsamaktadır.</p>
                  <h4 className="text-lg font-bold mb-2">Teslimatlar</h4>
                  <ul className="list-disc pl-5 mb-4 text-text-secondary">
                    <li>Tüm sayfa tasarımları (Figma)</li>
                    <li>Responsive HTML/CSS/JS kod yapısı</li>
                    <li>Admin paneli entegrasyonu</li>
                  </ul>
                </div>
              </div>
           </div>
           
           {/* Private Note */}
           <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-yellow-500">lock</span>
              Kendime Notlar (Müşteri görmez)
            </label>
            <textarea className="w-full rounded-lg border-surface-lighter bg-[#111a22] p-3 text-sm text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-20 resize-none" placeholder="Bu teklif hakkında hatırlamanız gereken özel detaylar..."></textarea>
          </div>

        </div>
        
         <div className="flex items-center justify-end gap-4">
            <button className="flex h-10 items-center justify-center rounded-lg px-6 text-sm font-medium text-text-secondary hover:text-white transition-colors">İptal Et</button>
            <button onClick={handleSave} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-surface-dark border border-surface-lighter px-6 text-sm font-bold text-white hover:bg-surface-lighter transition-all">Taslağı Kaydet</button>
            <button className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-blue-600 px-8 text-sm font-bold text-white transition-all shadow-lg shadow-primary/30">Teklifi Tamamla</button>
        </div>

      </div>
    </div>
  );
}