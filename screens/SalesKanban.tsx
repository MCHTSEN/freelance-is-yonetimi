import React, { useState, useMemo } from 'react';

interface Card {
  id: string;
  title: string;
  desc: string;
  tag?: string;
  tagColor?: string;
  tagIcon?: string;
  date?: string;
  initials?: string;
  color?: string;
  amount?: string;
  isLost?: boolean;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

interface KanbanCardProps {
  card: Card;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ card, onDelete, onDragStart }) => (
  <div 
    draggable
    onDragStart={onDragStart}
    className={`group relative bg-surface-lighter p-4 rounded-xl border border-transparent hover:border-[#324d67] cursor-grab active:cursor-grabbing shadow-sm transition-all hover:-translate-y-1 ${card.isLost ? 'opacity-50 hover:opacity-80 grayscale' : ''}`}
  >
    <div className="flex justify-between items-start mb-3">
      {card.tag ? (
        <div className={`${card.tagColor} text-xs font-bold px-2 py-1 rounded flex items-center gap-1`}>
          {card.tagIcon && <span className="material-symbols-outlined text-[12px]">{card.tagIcon}</span>}
          {card.tag}
        </div>
      ) : <div></div>}
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#92adc9] hover:text-red-400 p-1 -mr-2 -mt-2"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </div>
    <h4 className={`text-white font-bold text-base mb-1 ${card.isLost ? 'line-through decoration-slate-500' : ''}`}>{card.title}</h4>
    <p className="text-[#92adc9] text-sm mb-4 line-clamp-2">{card.desc}</p>
    {card.amount && <p className="text-white text-sm font-bold mb-3">{card.amount}</p>}
    {card.date && (
      <div className="flex items-center justify-between border-t border-[#324d67] pt-3 mt-2">
        <div className="flex items-center gap-2 text-[#92adc9] text-xs">
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          <span>{card.date}</span>
        </div>
        <div className={`size-6 rounded-full ${card.color || 'bg-slate-600'} flex items-center justify-center text-[10px] font-bold border border-[#233648]`}>
          {card.initials}
        </div>
      </div>
    )}
  </div>
);

export default function SalesKanban() {
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedItem, setDraggedItem] = useState<{ cardId: string; colId: string } | null>(null);
  
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'c1',
      title: 'Lead',
      cards: [
        { id: '1', title: 'TechStart Ltd.', desc: 'E-ticaret platformu modernizasyonu ve mobil uygulama entegrasyonu.', tag: 'Yeni Lead', tagColor: 'bg-purple-500/20 text-purple-300', date: '14 Eki', initials: 'TS', color: 'bg-blue-500' },
        { id: '2', title: 'Atlas Lojistik', desc: 'Depo yönetim sistemi (WMS) için yazılım danışmanlığı.', tag: 'Referans', tagColor: 'bg-blue-500/20 text-blue-300', date: '15 Eki', initials: 'AL', color: 'bg-orange-500' },
        { id: '3', title: 'Kahve Dünyası', desc: 'Basit bir landing page tasarımı.', tag: 'Düşük Öncelik', tagColor: 'bg-gray-700/50 text-gray-400', date: '20 Eki', initials: 'KD', color: 'bg-amber-700' },
      ]
    },
    {
      id: 'c2',
      title: 'Görüşüldü',
      cards: [
        { id: '4', title: 'FinansPort', desc: 'Teknik mülakat tamamlandı, bütçe onayı bekleniyor.', tag: 'Takip Et', tagColor: 'bg-yellow-500/20 text-yellow-300', tagIcon: 'schedule', date: 'Yarın', initials: 'FP', color: 'bg-indigo-600' },
        { id: '5', title: 'NextGen AI', desc: 'Prototip sunumu yapıldı. Feedback bekleniyor.', tag: 'Genel', tagColor: 'bg-transparent text-[#92adc9]', date: '18 Eki', initials: 'NG', color: 'bg-pink-600' },
      ]
    },
    {
      id: 'c3',
      title: 'Teklif Gönderildi',
      cards: [
        { id: '6', title: 'Creative Studio', desc: 'Kurumsal web sitesi yenileme ve SEO paketi teklifi iletildi.', tag: '45.000 ₺', tagColor: 'bg-primary/20 text-primary', tagIcon: 'attach_money', date: '10 Eki', initials: 'CS', color: 'bg-teal-600', amount: '45.000 ₺' }
      ]
    },
    {
      id: 'c4',
      title: 'Sözleşme',
      cards: [
        { id: '7', title: 'GreenEnergy A.Ş.', desc: 'IoT dashboard projesi. Sözleşme taslağı hukuk departmanında.', tag: 'İmzalanıyor', tagColor: 'bg-green-500/20 text-green-400', date: 'Onay Bekliyor', initials: 'GE', color: 'bg-green-700' }
      ]
    },
    {
      id: 'c5',
      title: 'Sonuçlanan',
      cards: [
         { id: '8', title: 'MegaMarket App', desc: 'iOS ve Android uygulama geliştirme.', tag: 'Kazanıldı', tagColor: 'bg-green-500 text-white', tagIcon: 'check', date: 'Bitti', initials: 'MM', color: 'bg-emerald-600', amount: '120.000 ₺' },
         { id: '9', title: 'Local Food', desc: 'Bütçe yetersizliği nedeniyle iptal edildi.', tag: 'Kaybedildi', tagColor: 'bg-red-500/20 text-red-400', tagIcon: 'close', isLost: true, initials: 'LF', color: 'bg-red-900' }
      ]
    }
  ]);

  const handleDeleteCard = (columnId: string, cardId: string) => {
    if (window.confirm('Bu kartı silmek istediğinize emin misiniz?')) {
      setColumns(cols => cols.map(col => {
        if (col.id === columnId) {
          return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
        }
        return col;
      }));
    }
  };

  const handleAddColumn = () => {
    const name = window.prompt('Yeni liste adı:');
    if (name) {
      setColumns([...columns, { id: `c-${Date.now()}`, title: name, cards: [] }]);
    }
  };

  const handleAddCard = (columnId: string) => {
    const title = window.prompt('Müşteri/Proje Adı:');
    if (!title) return;
    const desc = window.prompt('Açıklama:') || '';
    
    setColumns(cols => cols.map(col => {
      if (col.id === columnId) {
        return {
          ...col,
          cards: [{
            id: `new-${Date.now()}`,
            title,
            desc,
            date: 'Bugün',
            initials: title.substring(0, 2).toUpperCase(),
            color: 'bg-slate-600',
            tag: 'Yeni',
            tagColor: 'bg-slate-700 text-white'
          }, ...col.cards]
        };
      }
      return col;
    }));
  };

  const handleGlobalAdd = () => {
    handleAddCard(columns[0].id);
  };

  // --- Drag and Drop Handlers ---

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, cardId: string, colId: string) => {
    setDraggedItem({ cardId, colId });
    // Effect to make opacity slightly lower during drag (optional, native does this well usually)
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // This is necessary to allow dropping
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColId: string) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    // If dropped in the same column, do nothing (or implement reordering within column later)
    if (draggedItem.colId === targetColId) return;

    setColumns(prevColumns => {
        const sourceCol = prevColumns.find(c => c.id === draggedItem.colId);
        const targetCol = prevColumns.find(c => c.id === targetColId);

        if (!sourceCol || !targetCol) return prevColumns;

        const cardToMove = sourceCol.cards.find(c => c.id === draggedItem.cardId);
        if (!cardToMove) return prevColumns;

        // Remove from source
        const newSourceCards = sourceCol.cards.filter(c => c.id !== draggedItem.cardId);
        
        // Add to target (prepend to top)
        const newTargetCards = [cardToMove, ...targetCol.cards];

        return prevColumns.map(col => {
            if (col.id === draggedItem.colId) return { ...col, cards: newSourceCards };
            if (col.id === targetColId) return { ...col, cards: newTargetCards };
            return col;
        });
    });

    setDraggedItem(null);
  };

  // -----------------------------

  const filteredColumns = useMemo(() => {
    if (!searchQuery) return columns;
    const lowerQ = searchQuery.toLowerCase();
    return columns.map(col => ({
      ...col,
      cards: col.cards.filter(c => c.title.toLowerCase().includes(lowerQ) || c.desc.toLowerCase().includes(lowerQ))
    }));
  }, [columns, searchQuery]);

  return (
    <div className="flex flex-col w-full h-full bg-background-dark">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#233648] px-10 py-3 bg-background-dark shrink-0">
        <div className="flex items-center gap-8">
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Personal OS</h2>
          <label className="flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-[#92adc9] flex border-none bg-[#233648] items-center justify-center pl-4 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined text-[24px]">search</span>
              </div>
              <input
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#233648] focus:border-none h-full placeholder:text-[#92adc9] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </label>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <div className="flex items-center gap-9">
            <a href="#" className="text-white text-sm font-bold border-b-2 border-primary pb-0.5">Müşteriler</a>
            <a href="#" className="text-[#92adc9] hover:text-white text-sm font-medium transition-colors">Projeler</a>
            <a href="#" className="text-[#92adc9] hover:text-white text-sm font-medium transition-colors">Notlar</a>
            <a href="#" className="text-[#92adc9] hover:text-white text-sm font-medium transition-colors">Toplantılar</a>
          </div>
        </div>
      </header>

      {/* Main Board */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex flex-col gap-6 mb-6 shrink-0">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex min-w-72 flex-col gap-1">
              <h1 className="text-white text-3xl font-black leading-tight tracking-[-0.033em]">Satış Süreci</h1>
              <p className="text-[#92adc9] text-base font-normal leading-normal">Müşteri adaylarını ve teklif durumlarını yönetin</p>
            </div>
            <button 
              onClick={handleGlobalAdd}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-lg shadow-blue-900/20 active:transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px] mr-2">add</span>
              <span className="truncate">Yeni Müşteri/Teklif Ekle</span>
            </button>
          </div>
          <div className="flex gap-3 flex-wrap">
            {['Tüm Zamanlar', 'Yüksek Öncelik', 'Sadece Teklifler', 'Tarihe Göre'].map((filter) => (
              <button key={filter} className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#233648] hover:bg-[#2f455a] transition-colors pl-4 pr-2 border border-transparent hover:border-[#324d67]">
                <p className="text-white text-sm font-medium leading-normal">{filter}</p>
                <span className="material-symbols-outlined text-white text-[20px]">expand_more</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-full h-full items-start">
            
            {filteredColumns.map((col) => (
              <div 
                key={col.id} 
                className="flex flex-col w-[320px] shrink-0 gap-4"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#92adc9] uppercase tracking-wider">{col.title}</h3>
                    <span className="bg-[#233648] text-white text-xs font-bold px-2 py-0.5 rounded-full">{col.cards.length}</span>
                  </div>
                  <div className="flex gap-1">
                     <button onClick={() => handleAddCard(col.id)} className="text-[#92adc9] hover:text-white"><span className="material-symbols-outlined text-[20px]">add</span></button>
                     <button className="text-[#92adc9] hover:text-white"><span className="material-symbols-outlined text-[20px]">more_horiz</span></button>
                  </div>
                </div>
                {/* Min height ensures we can drop into an empty column */}
                <div className={`flex flex-col gap-3 min-h-[150px] rounded-xl transition-colors ${draggedItem && draggedItem.colId !== col.id ? 'bg-[#192633]/50 border-2 border-dashed border-[#233648]' : 'border-2 border-transparent'}`}>
                  {col.cards.map((card) => (
                    <KanbanCard 
                        key={card.id} 
                        card={card} 
                        onDelete={(cid) => handleDeleteCard(col.id, cid)}
                        onDragStart={(e) => handleDragStart(e, card.id, col.id)}
                        // Reset opacity on drag end
                        {...{onDragEnd: handleDragEnd}}
                    />
                  ))}
                  {col.cards.length === 0 && (
                     <div className="h-full flex items-center justify-center text-[#233648] text-sm font-medium">
                        Buraya sürükleyin
                     </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add Column */}
            <div 
              onClick={handleAddColumn}
              className="flex flex-col w-[320px] shrink-0 gap-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer group"
            >
                <div className="h-6"></div>
                <div className="flex flex-col h-[140px] border-2 border-dashed border-[#233648] group-hover:border-primary rounded-xl items-center justify-center text-[#92adc9] group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[32px] mb-2">add</span>
                    <span className="text-sm font-medium">Yeni Liste Ekle</span>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}