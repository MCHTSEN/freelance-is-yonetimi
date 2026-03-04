import {
    CheckCircle2,
    Clock,
    Code,
    FileText,
    Layers,
    Loader2,
    Plus,
    Save,
    Search,
    Trash2,
    Users
} from 'lucide-react'
import { useMemo, useState } from 'react'
import RichTextEditor from '../components/RichTextEditor'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../components/ui/select'
import { useClients } from '../hooks/useClients'
import { NoteWithRelations, useNotes } from '../hooks/useNotes'
import { cn } from '../lib/utils'

type NoteTypeFilter = 'all' | 'meeting' | 'technical' | 'general'

const NOTE_TYPES = [
  { value: 'meeting', label: 'Toplantı', icon: Users, variant: 'default' as const },
  { value: 'technical', label: 'Teknik', icon: Code, variant: 'secondary' as const },
  { value: 'general', label: 'Genel', icon: FileText, variant: 'outline' as const },
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
      if (newNote) handleSelectNote(newNote as NoteWithRelations)
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex w-full h-full overflow-hidden bg-background">
      {/* Sidebar - Note List */}
      <aside className="w-80 flex flex-col border-r bg-card/30 shrink-0 z-20">
        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <span className="text-primary text-xs uppercase font-bold tracking-[0.2em] opacity-80">Bilgi Bankası</span>
            <h2 className="text-2xl font-bold tracking-tight">Toplantı Notları</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-background/50"
                placeholder="Ara..."
              />
            </div>
            <Button
              onClick={handleNewNote}
              size="icon"
              className="h-10 w-10 shrink-0"
            >
              <Plus className="size-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Button
              variant={typeFilter === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter('all')}
              className="text-xs font-bold uppercase h-8"
            >
              Tümü
            </Button>
            {NOTE_TYPES.map(type => (
              <Button
                key={type.value}
                variant={typeFilter === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(type.value as NoteTypeFilter)}
                className="text-xs font-bold uppercase h-8 gap-1.5"
              >
                <type.icon className="size-3" />
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 px-4 opacity-30">
              <Layers className="size-10 mx-auto mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Not bulunamadı</p>
            </div>
          ) : (
            filteredNotes.map(note => {
              const typeConfig = getTypeConfig(note.type)
              const isSelected = selectedNote?.id === note.id
              return (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={cn(
                    "group flex flex-col gap-3 px-4 py-4 rounded-xl cursor-pointer transition-all border",
                    isSelected
                      ? "bg-primary/5 border-primary/30 shadow-sm"
                      : "hover:bg-accent/50 border-transparent"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={typeConfig.variant} className="text-xs px-1.5 py-0">
                      {typeConfig.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">
                      {formatDate(note.created_at)}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className={cn(
                      "text-sm font-bold truncate tracking-tight transition-colors",
                      isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                    )}>
                      {note.title || 'Başlıksız Not'}
                    </h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                      {note.clients ? `${note.clients.first_name} ${note.clients.last_name}` : 'Genel'}
                    </p>
                  </div>
                  
                  {note.content && (
                    <div
                      className="text-sm text-muted-foreground line-clamp-2 leading-relaxed opacity-70"
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

      {/* Main Content - Editor */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {selectedNote ? (
          <>
            {/* Note Header */}
            <header className="flex items-center justify-between px-8 py-6 border-b bg-card/30 backdrop-blur-md sticky top-0 z-30">
              <div className="flex-1 mr-8">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  onBlur={handleUpdateNote}
                  className="w-full bg-transparent text-3xl font-bold tracking-tight border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
                  placeholder="Başlık..."
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDeleteNote}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                </Button>
                <Button
                  onClick={handleUpdateNote}
                  className="gap-2 px-6"
                >
                  <Save className="size-4" />
                  Kaydet
                </Button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-8 py-8">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border bg-card/20 border-border/40">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Kategori</Label>
                    <Select
                      value={noteType}
                      onValueChange={(val: any) => {
                        setNoteType(val)
                        setTimeout(handleUpdateNote, 0)
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NOTE_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Müşteri</Label>
                    <Select
                      value={selectedClientId}
                      onValueChange={(val) => {
                        setSelectedClientId(val)
                        setTimeout(handleUpdateNote, 0)
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Seçiniz..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Müşteri Seçin</SelectItem>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.first_name} {client.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Tarih</Label>
                    <Input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => {
                        setMeetingDate(e.target.value)
                        setTimeout(handleUpdateNote, 0)
                      }}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <RichTextEditor
                    content={noteContent}
                    onChange={(content) => setNoteContent(content)}
                    placeholder="Yazmaya başlayın..."
                  />
                </div>
              </div>
            </div>

            <footer className="h-10 border-t bg-card/50 flex items-center justify-between px-6 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3" />
                  Son düzenleme: {new Date().toLocaleTimeString('tr-TR')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                <span>Eşitlendi</span>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-accent/5">
            <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
               <FileText className="size-10 text-primary opacity-40" />
            </div>
            <h3 className="text-2xl font-bold mb-2 tracking-tight">Bir Not Seçin</h3>
            <p className="text-muted-foreground mb-8 max-w-sm text-center text-sm">
              Fikirlerinizi, toplantı tutanaklarınızı veya teknik dokümanlarınızı buradan yönetin.
            </p>
            <Button
              onClick={handleNewNote}
              size="lg"
              className="gap-2 px-8"
            >
              <Plus className="size-4" />
              Yeni Not Oluştur
            </Button>
          </div>
        )}
      </div>

      {/* New Note Dialog */}
      <Dialog open={showNewNoteModal} onOpenChange={setShowNewNoteModal}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Yeni Not Başlat</DialogTitle>
            <DialogDescription>Yeni bir not oluşturarak bilgilerinizi düzenlemeye başlayın.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label>Not Başlığı</Label>
              <Input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Örn: Proje Taslakları"
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <div className="grid grid-cols-3 gap-2">
                {NOTE_TYPES.map(type => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={noteType === type.value ? "default" : "outline"}
                    onClick={() => setNoteType(type.value as 'meeting' | 'technical' | 'general')}
                    className="flex flex-col items-center gap-2 h-20 p-2"
                  >
                    <type.icon className="size-5" />
                    <span className="text-xs font-bold uppercase">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Müşteri</Label>
                <Select
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Yok" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Yok</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tarih</Label>
                <Input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowNewNoteModal(false)}
                className="flex-1"
              >
                Vazgeç
              </Button>
              <Button
                onClick={handleSaveNewNote}
                className="flex-1 gap-2"
              >
                <CheckCircle2 className="size-4" />
                Notu Oluştur
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
