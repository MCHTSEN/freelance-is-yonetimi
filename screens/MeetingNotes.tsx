import React, { useState, useEffect } from 'react';

interface Event {
    id: string;
    title: string;
    color: string;
    active?: boolean;
    description?: string;
}

interface ActionItem {
    id: string;
    text: string;
    completed: boolean;
}

export default function MeetingNotes() {
  const [selectedDay, setSelectedDay] = useState(9);
  const [noteTitle, setNoteTitle] = useState('Fintech App - Sprint Review');
  const [noteContent, setNoteContent] = useState(`API endpointlerinde yaşanan gecikme için cache mekanizması kurulacak.`);
  const [actions, setActions] = useState<ActionItem[]>([
      { id: '1', text: "Login animasyonunu 0.5s'ye düşür", completed: true },
      { id: '2', text: "Redis kurulumunu tamamla", completed: false }
  ]);
  const [isSaved, setIsSaved] = useState(true);

  // Auto-save effect simulation
  useEffect(() => {
    setIsSaved(false);
    const timer = setTimeout(() => setIsSaved(true), 1500);
    return () => clearTimeout(timer);
  }, [noteTitle, noteContent, actions]);

  const days = Array.from({ length: 35 }, (_, i) => {
    const day = i - 4; // Start from previous month
    
    // In a real app, this would come from a DB based on the date
    const events: Event[] = 
      day === 3 ? [{ id: 'e1', title: 'SaaS Projesi - Kickoff', color: 'purple' }] : 
      day === 5 ? [{ id: 'e2', title: 'Müşteri X - Demo', color: 'green' }] :
      day === 9 ? [{ id: 'e3', title: 'Fintech App - Sprint Review', color: 'blue', active: true }] :
      day === 10 ? [{ id: 'e4', title: 'Vergi Dairesi', color: 'orange' }] : [];

    return {
      day: day > 0 && day <= 31 ? day : day <= 0 ? 31 + day : day - 31,
      isCurrentMonth: day > 0 && day <= 31,
      events,
      fullDate: day // Simplification for demo
    };
  });

  const toggleAction = (id: string) => {
    setActions(actions.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  const handleDayClick = (day: number) => {
      setSelectedDay(day);
      // Reset demo data for effect
      if (day !== 9) {
          setNoteTitle('Yeni Toplantı Notu');
          setNoteContent('');
          setActions([]);
      } else {
          setNoteTitle('Fintech App - Sprint Review');
          setNoteContent(`API endpointlerinde yaşanan gecikme için cache mekanizması kurulacak.`);
          setActions([
            { id: '1', text: "Login animasyonunu 0.5s'ye düşür", completed: true },
            { id: '2', text: "Redis kurulumunu tamamla", completed: false }
        ]);
      }
  };

  return (
    <div className="flex flex-col w-full h-full bg-background-dark overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 flex items-center justify-between border-b border-surface-lighter px-6 shrink-0 bg-[#111a22]/95 backdrop-blur-sm z-10">
         <div className="flex flex-1 max-w-lg">
           <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-text-secondary">search</span>
              </div>
              <input className="block w-full pl-10 pr-3 py-2 rounded-lg bg-surface-dark border-none text-white placeholder-text-secondary focus:ring-2 focus:ring-primary focus:bg-[#111a22] transition-all text-sm" placeholder="Toplantı, not veya müşteri ara..." />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-surface-lighter bg-[#111a22] text-[10px] text-text-secondary">⌘K</kbd>
              </div>
           </div>
         </div>
         <div className="flex items-center gap-4 ml-6">
            <button className="relative p-2 text-text-secondary hover:text-white transition-colors hover:bg-surface-dark rounded-full">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-[#111a22]"></span>
            </button>
            <button className="p-2 text-text-secondary hover:text-white transition-colors hover:bg-surface-dark rounded-full">
              <span className="material-symbols-outlined">settings</span>
            </button>
         </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Controls */}
        <div className="px-6 py-6 flex flex-col gap-6 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Toplantılar ve Notlar</h2>
              <p className="text-text-secondary mt-1">Tüm planlamalarını ve toplantı notlarını buradan yönet.</p>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={() => { setSelectedDay(new Date().getDate()); setNoteTitle('Adsız Toplantı'); }} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all">
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Yeni Toplantı</span>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
             <div className="flex items-center bg-surface-dark rounded-lg p-1 border border-surface-lighter">
               {['Ay', 'Hafta', 'Gün', 'Ajanda'].map((v, i) => (
                 <button key={v} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${i === 1 ? 'bg-[#111a22] text-white shadow-sm border border-surface-lighter' : 'text-text-secondary hover:text-white'}`}>{v}</button>
               ))}
             </div>
             <div className="flex items-center gap-2">
                <button className="size-8 flex items-center justify-center rounded-lg hover:bg-surface-dark text-white border border-transparent hover:border-surface-lighter transition-all">
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <span className="text-white font-semibold text-lg min-w-[140px] text-center">Ekim 2023</span>
                <button className="size-8 flex items-center justify-center rounded-lg hover:bg-surface-dark text-white border border-transparent hover:border-surface-lighter transition-all">
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
             </div>
          </div>
        </div>

        {/* Split View */}
        <div className="flex-1 flex gap-6 min-h-0 px-6 pb-6 overflow-hidden">
           {/* Calendar */}
           <div className="flex-1 flex flex-col bg-surface-dark rounded-xl border border-surface-lighter shadow-sm overflow-hidden min-w-[500px]">
              <div className="grid grid-cols-7 border-b border-surface-lighter bg-[#1c2936]">
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d, i) => (
                  <div key={d} className={`py-3 text-center text-xs font-semibold uppercase tracking-wider ${i > 4 ? 'text-red-400' : 'text-text-secondary'}`}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 grid-rows-5 flex-1 bg-[#111a22]">
                {days.map((d, i) => {
                  const isSelected = d.day === selectedDay && d.isCurrentMonth;
                  return (
                  <div 
                    key={i} 
                    onClick={() => d.isCurrentMonth && handleDayClick(d.day)}
                    className={`border-b border-r border-surface-lighter p-2 min-h-[100px] relative group transition-colors cursor-pointer
                        ${!d.isCurrentMonth ? 'bg-[#111a22]/50 cursor-default' : 'hover:bg-surface-dark/30'} 
                        ${isSelected ? 'bg-surface-dark/60 ring-inset ring-2 ring-primary/50' : ''}`
                    }
                  >
                    <span className={`text-sm font-medium ${!d.isCurrentMonth ? 'text-text-secondary/30' : 'text-text-secondary'} ${isSelected ? 'flex items-center justify-center size-6 rounded-full bg-primary text-white shadow-lg' : ''}`}>
                      {d.day}
                    </span>
                    {d.events.map((ev, k) => (
                      <div key={k} className={`mt-2 px-2 py-1 rounded border-l-2 cursor-pointer transition-colors ${ev.active || isSelected ? 'bg-blue-500/30 border-primary ring-1 ring-primary shadow-lg shadow-primary/10' : `bg-${ev.color}-500/20 border-${ev.color}-500 hover:bg-${ev.color}-500/30`}`}>
                        <p className={`text-xs font-semibold truncate ${ev.active || isSelected ? 'text-white' : `text-${ev.color}-200`}`}>{ev.title}</p>
                      </div>
                    ))}
                  </div>
                )})}
              </div>
           </div>

           {/* Editor */}
           <div className="w-[450px] flex flex-col bg-surface-dark rounded-xl border border-surface-lighter shadow-2xl shrink-0 overflow-hidden ring-1 ring-white/5">
              <div className="p-4 border-b border-surface-lighter flex items-start justify-between bg-[#1c2936]">
                 <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">Toplantı Notu</span>
                    </div>
                    <input 
                        className="bg-transparent border-none p-0 text-white text-lg font-bold w-full focus:ring-0 placeholder-gray-500" 
                        value={noteTitle} 
                        onChange={(e) => setNoteTitle(e.target.value)}
                    />
                    <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                       <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          <span>{selectedDay} Eki, 14:30 - 16:00</span>
                       </div>
                       <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#233648] text-white">
                          <span className="material-symbols-outlined text-[14px]">folder</span>
                          <span>Fintech Projesi</span>
                       </div>
                    </div>
                 </div>
                 <button className="p-1.5 hover:bg-[#233648] rounded text-text-secondary hover:text-white transition-colors"><span className="material-symbols-outlined text-[20px]">close</span></button>
              </div>
              
              <div className="px-3 py-2 bg-[#111a22] border-b border-surface-lighter flex items-center gap-1 overflow-x-auto">
                 {['format_bold', 'format_italic', 'title', 'format_list_bulleted', 'check_box', 'code'].map((ic, i) => (
                    <button key={i} className="p-1.5 rounded hover:bg-[#233648] text-text-secondary hover:text-white"><span className="material-symbols-outlined text-[20px]">{ic}</span></button>
                 ))}
                 <div className="flex-1"></div>
                 <button className="px-2 py-1 rounded bg-[#233648] text-xs text-text-secondary hover:text-white">Markdown</button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-[#111a22] font-mono text-sm">
                 <div className="prose prose-invert prose-sm max-w-none">
                    <h1 className="text-white font-bold text-lg mb-2">Gündem</h1>
                    <ul className="list-disc pl-4 text-gray-300 mb-4">
                      <li>Önceki sprintin değerlendirilmesi</li>
                      <li>Backend API hataları</li>
                      <li>Yeni tasarım onay süreci</li>
                    </ul>
                    <h2 className="text-white font-bold text-base mb-2 mt-4">Notlar</h2>
                    <textarea 
                        className="w-full bg-transparent text-gray-400 mb-4 resize-none outline-none min-h-[80px]" 
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                    />
                    
                    <h2 className="text-white font-bold text-base mb-2 mt-4 flex items-center justify-between">
                        Aksiyonlar
                        <button onClick={() => setActions([...actions, {id: Date.now().toString(), text: 'Yeni görev', completed: false}])} className="text-xs text-primary hover:underline">Ekle +</button>
                    </h2>
                    <ul className="space-y-2">
                       {actions.map(action => (
                           <li key={action.id} className={`flex items-center gap-2 group cursor-pointer ${action.completed ? 'text-text-secondary line-through opacity-60' : 'text-white'}`} onClick={() => toggleAction(action.id)}>
                               <span className={`material-symbols-outlined text-[18px] ${action.completed ? 'text-green-500' : 'text-gray-500 group-hover:text-white'}`}>
                                   {action.completed ? 'check_box' : 'check_box_outline_blank'}
                               </span> 
                               <span>{action.text}</span>
                           </li>
                       ))}
                    </ul>
                 </div>
              </div>

              <div className="p-4 border-t border-surface-lighter bg-[#1c2936] flex justify-between items-center">
                 <div className="text-xs text-text-secondary flex items-center">
                    {isSaved ? (
                        <><span className="inline-block size-2 rounded-full bg-green-500 mr-1"></span> Kaydedildi</>
                    ) : (
                        <><span className="inline-block size-2 rounded-full bg-yellow-500 mr-1 animate-pulse"></span> Kaydediliyor...</>
                    )}
                 </div>
                 <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg border border-surface-lighter text-text-secondary hover:text-white hover:bg-[#233648] text-xs font-bold transition-colors">E-posta Olarak Gönder</button>
                    <button className="px-4 py-1.5 rounded-lg bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-primary/20 transition-colors">Tamamla</button>
                 </div>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
}