import { useMemo, useState } from 'react'
import Modal from '../components/Modal'
import RichTextEditor from '../components/RichTextEditor'
import { useClients } from '../hooks/useClients'
import { NoteWithRelations, useNotes } from '../hooks/useNotes'

type NoteTypeFilter = 'all' | 'meeting' | 'technical' | 'general'

const NOTE_TYPES = [
  { value: 'meeting', label: 'Toplantı', icon: 'groups', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 'technical', label: 'Teknik', icon: 'code_blocks', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { value: 'general', label: 'Genel', icon: 'description', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
]

export default function MeetingNotes() {
  const [selectedNote, setSelectedNote] = useState<NoteWithRelations | null>(null)
  const [showNewNoteModal, setShowNewNoteModal] = useState(false)
  const [typeFilter, setTypeFilter] = useState<NoteTypeFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteType, setNoteType] = useState<'meeting' | 'technical' | 'general'>('meeting')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [meetingDate, setMeetingDate] = useState('')

  const { notes, loading, addNote, updateNote, deleteNote } = useNotes()
  const { clients } = useClients()

  const filteredNotes = useMemo(() => {
    let result = notes

    if (typeFilter !== 'all') {
      result = result.filter(n => n.type === typeFilter)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        n.clients?.first_name?.toLowerCase().includes(q) ||
        n.clients?.company?.toLowerCase().includes(q)
      )
    }

    return result
  }, [notes, typeFilter, searchQuery])

  const handleSelectNote = (note: NoteWithRelations) => {
    setSelectedNote(note)
    setNoteTitle(note.title || '')
    setNoteContent(note.content || '')
    setNoteType((note.type as 'meeting' | 'technical' | 'general') || 'general')
    setSelectedClientId(note.client_id || '')
    setMeetingDate(note.meeting_date ? note.meeting_date.split('T')[0] : '')
  }

  const handleNewNote = () => {
    setSelectedNote(null)
    setNoteTitle('')
    setNoteContent('')
    setNoteType('meeting')
    setSelectedClientId('')
    setMeetingDate(new Date().toISOString().split('T')[0])
    setShowNewNoteModal(true)
  }

  const handleSaveNewNote = async () => {
    try {
      const newNote = await addNote({
        title: noteTitle || 'Adsız Not',
        content: noteContent,
        type: noteType,
        client_id: selectedClientId || null,
        meeting_date: meetingDate ? new Date(meetingDate).toISOString() : null,
      })
      setShowNewNoteModal(false)
      handleSelectNote(newNote as NoteWithRelations)
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  const handleUpdateNote = async () => {
    if (!selectedNote) return
    try {
      await updateNote(selectedNote.id, {
        title: noteTitle,
        content: noteContent,
        type: noteType,
        client_id: selectedClientId || null,
        meeting_date: meetingDate ? new Date(meetingDate).toISOString() : null,
      })
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  const handleDeleteNote = async () => {
    if (!selectedNote) return
    if (!window.confirm('Bu notu silmek istediğinize emin misiniz?')) return
    try {
      await deleteNote(selectedNote.id)
      setSelectedNote(null)
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getTypeConfig = (type: string | null) => {
    return NOTE_TYPES.find(t => t.value === type) || NOTE_TYPES[2]
  }

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <span className="material-symbols-rounded text-primary text-4xl animate-spin">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* Glassmorphic Sidebar */}
      <aside className="w-80 flex flex-col border-r border-white/5 bg-glass-bg backdrop-blur-3xl shrink-0 z-20">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-1 mb-2">
            <span className="text-primary text-[10px] uppercase font-black tracking-widest opacity-70 leading-none">Bilgi Bankası</span>
            <h2 className="text-white text-2xl font-black tracking-tight">Toplantı Notları</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 text-white placeholder-slate-600 text-xs rounded-xl border border-white/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 pl-10 pr-3 py-3 outline-none transition-all"
                placeholder="Notlarda ara..."
              />
            </div>
            <button
              onClick={handleNewNote}
              className="size-11 bg-primary hover:bg-primary-dark text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-primary/20 active:scale-90"
            >
              <span className="material-symbols-rounded font-black">add</span>
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                typeFilter === 'all' ? 'bg-white text-slate-900 border-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'
              }`}
            >
              Tümü
            </button>
            {NOTE_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => setTypeFilter(type.value as NoteTypeFilter)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border flex items-center gap-2 ${
                  typeFilter === type.value ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'
                }`}
              >
                <span className="material-symbols-rounded text-[14px]">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 px-4 opacity-30">
              <span className="material-symbols-rounded text-6xl mb-4">description_off</span>
              <p className="text-sm font-black uppercase tracking-widest">Not bulunamadı</p>
            </div>
          ) : (
            filteredNotes.map(note => {
              const typeConfig = getTypeConfig(note.type)
              const isSelected = selectedNote?.id === note.id
              return (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`group flex flex-col gap-3 px-5 py-5 rounded-[1.5rem] cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-white/10 border-primary/40 shadow-xl'
                      : 'hover:bg-white/5 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${typeConfig.color}`}>
                      {typeConfig.label}
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {formatDate(note.created_at)}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className={`text-sm font-bold truncate tracking-tight transition-colors ${
                      isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}>
                      {note.title || 'Başlıksız Not'}
                    </h3>
                    {note.clients ? (
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1 opacity-80">
                        {note.clients.first_name} {note.clients.last_name}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 opacity-60">Genel</p>
                    )}
                  </div>
                  
                  {note.content && (
                    <div
                      className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: note.content.replace(/<[^>]*>/g, ' ').substring(0, 100)
                      }}
                    />
                  )}
                </div>
              )
            })
          )}
        </div>
      </aside>

      {/* Editor Panel */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {selectedNote ? (
          <>
            {/* Note Header */}
            <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-background-dark/30 backdrop-blur-md sticky top-0 z-30">
              <div className="flex-1 mr-8">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  onBlur={handleUpdateNote}
                  className="w-full bg-transparent text-3xl font-black text-white tracking-tight border-none focus:outline-none focus:ring-0 placeholder-slate-700"
                  placeholder="Not başlığı..."
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-xl border border-white/5">
                  <button
                    onClick={handleDeleteNote}
                    className="flex items-center justify-center size-9 rounded-lg text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-all active:scale-95"
                    title="Delete Note"
                  >
                    <span className="material-symbols-rounded text-[20px]">delete</span>
                  </button>
                </div>
                
                <button
                  onClick={handleUpdateNote}
                  className="flex items-center justify-center gap-3 px-8 h-12 bg-primary hover:bg-primary-dark text-white rounded-[1rem] text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95"
                >
                  <span className="material-symbols-rounded text-[20px] font-black">save</span>
                   Kaydet
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-10 py-10">
              <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                  <div className="flex-1 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                       <span className="material-symbols-rounded text-sm">settings</span> Metadata
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Note Type Select */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                        <span className="material-symbols-rounded text-slate-500 text-[18px]">category</span>
                        <select
                          value={noteType}
                          onChange={(e) => {
                            setNoteType(e.target.value as 'meeting' | 'technical' | 'general')
                            setTimeout(handleUpdateNote, 0)
                          }}
                          className="bg-transparent text-xs font-bold text-slate-300 focus:outline-none appearance-none pr-4"
                        >
                          {NOTE_TYPES.map(t => (
                            <option key={t.value} value={t.value} className="bg-slate-900">{t.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Client Select */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                        <span className="material-symbols-rounded text-slate-500 text-[18px]">person</span>
                        <select
                          value={selectedClientId}
                          onChange={(e) => {
                            setSelectedClientId(e.target.value)
                            setTimeout(handleUpdateNote, 0)
                          }}
                          className="bg-transparent text-xs font-bold text-slate-300 focus:outline-none appearance-none pr-4"
                        >
                          <option value="" className="bg-slate-900">Müşteri Seçin</option>
                          {clients.map(client => (
                            <option key={client.id} value={client.id} className="bg-slate-900">
                              {client.first_name} {client.last_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Date Picker */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                        <span className="material-symbols-rounded text-slate-500 text-[18px]">event</span>
                        <input
                          type="date"
                          value={meetingDate}
                          onChange={(e) => {
                            setMeetingDate(e.target.value)
                            setTimeout(handleUpdateNote, 0)
                          }}
                          className="bg-transparent text-xs font-bold text-slate-300 focus:outline-none [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <RichTextEditor
                    content={noteContent}
                    onChange={(content) => setNoteContent(content)}
                    placeholder="Not yazmaya başlayın..."
                  />
                </div>
              </div>
            </div>

            <div className="h-8 border-t border-white/5 bg-white/5 flex items-center justify-between px-4 text-[11px] text-slate-500 select-none">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">history</span>
                  Son senkronizasyon: {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <span>Senkronizasyon Aktif</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-background-dark/30">
            <div className="relative mb-8">
               <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
               <span className="material-symbols-rounded text-slate-400 text-[120px] relative z-10 opacity-40">edit_note</span>
            </div>
            <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Bir Not Seçin</h3>
            <p className="text-slate-400 mb-8 max-w-sm text-center font-medium opacity-80">Fikirlerinizi, toplantı tutanaklarını veya teknik dokümanları premium çalışma alanınızda saklayın.</p>
            <button
              onClick={handleNewNote}
              className="px-10 py-4 bg-white text-slate-900 hover:bg-slate-100 font-black uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-white/5 active:scale-95"
            >
              Yeni Not Oluştur
            </button>
          </div>
        )}
      </div>

      {/* New Note Modal */}
      <Modal
        isOpen={showNewNoteModal}
        onClose={() => setShowNewNoteModal(false)}
        title="Yeni Varlık Başlat"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Not Başlığı</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-[1.25rem] text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-bold"
              placeholder="Örn: Sistem Mimarisi Güncellemesi"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Kategori</label>
            <div className="grid grid-cols-3 gap-3">
              {NOTE_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setNoteType(type.value as 'meeting' | 'technical' | 'general')}
                  className={`px-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-3 border ${
                    noteType === type.value
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : 'bg-white/5 text-slate-500 border-white/5 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-rounded text-2xl">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Müşteri Bağlantısı</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 font-bold appearance-none"
                >
                  <option value="" className="bg-slate-900">Yok</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id} className="bg-slate-900">
                      {client.first_name} {client.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Zaman Damgası</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 font-bold [color-scheme:dark]"
                />
              </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowNewNoteModal(false)}
              className="flex-1 py-4 bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 font-black uppercase tracking-widest rounded-2xl transition-all"
            >
               Vazgeç
            </button>
            <button
              type="button"
              onClick={handleSaveNewNote}
              className="flex-1 py-4 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-rounded font-black">add</span>
              Notu Oluştur
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
