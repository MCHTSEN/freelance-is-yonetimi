import {
    Check,
    Copy,
    Database,
    Edit2,
    ExternalLink,
    Eye,
    EyeOff,
    Globe,
    Key,
    Loader2,
    Lock,
    Plus,
    Search,
    Shield,
    ShieldCheck,
    Terminal,
    Trash2,
    Zap
} from 'lucide-react'
import { useState } from 'react'
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
import { useCredentials, type CredentialType, type CredentialWithClient } from '../hooks/useCredentials'
import { cn } from '../lib/utils'

const CREDENTIAL_TYPES: { value: CredentialType; label: string; icon: any; variant: "default" | "secondary" | "destructive" | "outline" | null | undefined }[] = [
  { value: 'web', label: 'Web Girişi', icon: Globe, variant: 'default' },
  { value: 'ssh', label: 'Terminal / SSH', icon: Terminal, variant: 'secondary' },
  { value: 'db', label: 'Veritabanı', icon: Database, variant: 'outline' },
  { value: 'api', label: 'API / Servis', icon: Zap, variant: 'default' },
]

function CredentialForm({
  clients,
  onSubmit,
  onCancel,
  initialData,
  preselectedClientId,
}: {
  clients: { id: string; first_name: string; last_name: string; company: string | null }[]
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  initialData?: CredentialWithClient
  preselectedClientId?: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    client_id: initialData?.client_id || preselectedClientId || 'none',
    category: initialData?.category || 'web',
    service_name: initialData?.service_name || '',
    username: initialData?.username || '',
    password_encrypted: initialData?.password_encrypted || '',
    url: initialData?.url || '',
    notes: initialData?.notes || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await onSubmit({
        client_id: formData.client_id === 'none' ? null : formData.client_id,
        category: formData.category,
        service_name: formData.service_name,
        username: formData.username || null,
        password_encrypted: formData.password_encrypted || null,
        url: formData.url || null,
        notes: formData.notes || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Müşteri</Label>
          <Select
            value={formData.client_id}
            onValueChange={(val) => setFormData(prev => ({ ...prev, client_id: val }))}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Müşteri Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Genel / Müşterisiz</SelectItem>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Kategori</Label>
          <Select
            value={formData.category}
            onValueChange={(val: any) => setFormData(prev => ({ ...prev, category: val }))}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CREDENTIAL_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Servis / Kaynak Adı</Label>
        <Input
          value={formData.service_name}
          onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
          placeholder="örn. AWS Console, Production DB"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Bağlantı URL / Host</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            className="pl-9 font-mono text-xs"
            placeholder="https://console.aws.amazon.com/..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Kullanıcı Adı</Label>
          <Input
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="font-mono text-xs"
            placeholder="admin"
          />
        </div>
        <div className="space-y-2">
          <Label>Şifre</Label>
          <Input
            type="password"
            value={formData.password_encrypted}
            onChange={(e) => setFormData(prev => ({ ...prev, password_encrypted: e.target.value }))}
            className="font-mono text-xs"
            placeholder="••••••••••"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notlar</Label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Ek güvenlik detayları..."
        />
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Shield className="size-4" />
          {error}
        </div>
      )}

      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={onCancel} className="flex-1">İptal</Button>
        <Button type="submit" disabled={loading} className="flex-1 gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : (
            <>
              <ShieldCheck className="size-4" />
              {initialData ? 'Güncelle' : 'Kaydet'}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

const CredentialCard = ({
  cred,
  visibleSecrets,
  toggleVisibility,
  copiedId,
  copyToClipboard,
  onEdit,
  onDelete,
}: {
  cred: CredentialWithClient
  visibleSecrets: Record<string, boolean>
  toggleVisibility: (id: string) => void
  copiedId: string | null
  copyToClipboard: (text: string, id: string) => void
  onEdit: () => void
  onDelete: () => void
}) => {
  const typeConfig = CREDENTIAL_TYPES.find(t => t.value === (cred.category as CredentialType)) || CREDENTIAL_TYPES[0]

  return (
    <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <typeConfig.icon className="size-5" />
             </div>
             <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{typeConfig.label}</span>
                <h3 className="text-sm font-bold truncate leading-tight">{cred.service_name}</h3>
             </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
              <Edit2 className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={onDelete}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-4 space-y-4">
        {cred.url && (
          <a
            href={cred.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group/link"
          >
             <div className="flex-1 flex items-center gap-2 text-sm font-mono text-primary bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-lg overflow-hidden transition-colors group-hover/link:bg-primary group-hover/link:text-white">
                <ExternalLink className="size-3 shrink-0" />
                <span className="truncate">{cred.url}</span>
             </div>
          </a>
        )}

        <div className="grid gap-2">
          {cred.username && (
            <div 
              onClick={() => copyToClipboard(cred.username!, `${cred.id}-user`)}
              className="flex items-center justify-between p-2.5 bg-muted/30 border border-border/20 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-muted-foreground mb-0.5">Kullanıcı Adı</p>
                <p className="text-xs font-mono font-medium truncate">{cred.username}</p>
              </div>
              {copiedId === `${cred.id}-user` ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100" />}
            </div>
          )}

          {cred.password_encrypted && (
            <div className="flex items-center justify-between p-2.5 bg-destructive/5 border border-destructive/10 rounded-lg group/pass">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase text-destructive/60 mb-0.5">Şifre</p>
                <p className="text-xs font-mono font-medium truncate text-destructive/80">
                  {visibleSecrets[`${cred.id}-pass`] ? cred.password_encrypted : '••••••••••••'}
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0 ml-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                  onClick={() => toggleVisibility(`${cred.id}-pass`)}
                >
                  {visibleSecrets[`${cred.id}-pass`] ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                  onClick={() => copyToClipboard(cred.password_encrypted!, `${cred.id}-pass`)}
                >
                  {copiedId === `${cred.id}-pass` ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CustomerCredentials() {
  const { credentials, loading, addCredential, updateCredential, deleteCredential, getCredentialsByClient } = useCredentials()
  const { clients } = useClients()
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCredential, setEditingCredential] = useState<CredentialWithClient | null>(null)

  const clientsWithCredentials = clients.filter(client =>
    credentials.some(cred => cred.client_id === client.id)
  )

  const filteredCredentials = credentials.filter(cred => {
    const matchesClient = !selectedClientId || cred.client_id === selectedClientId
    const matchesSearch = searchQuery === '' ||
      cred.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.username?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesClient && matchesSearch
  })

  const toggleVisibility = (id: string) => {
    setVisibleSecrets(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleAdd = async (data: any) => {
    await addCredential(data)
    setShowForm(false)
  }

  const handleEdit = async (data: any) => {
    if (!editingCredential) return
    await updateCredential(editingCredential.id, data)
    setEditingCredential(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu işlem bu bilgileri kasadan kalıcı olarak silecektir. Devam edilsin mi?')) return
    await deleteCredential(id)
  }

  const getCredentialsByType = (type: CredentialType) => filteredCredentials.filter(c => (c.category as CredentialType) === type)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* Sidebar - Clients */}
      <aside className="w-80 flex flex-col border-r bg-card/30 shrink-0 z-20">
        <div className="p-6 space-y-6">
          <div className="space-y-1">
             <span className="text-primary text-xs uppercase font-bold tracking-[0.2em] opacity-80">Güvenlik Merkezi</span>
             <h2 className="text-2xl font-bold tracking-tight">Kimlik Kasası</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-background/50"
                placeholder="Ara..."
              />
            </div>
            <Button
              onClick={() => setShowForm(true)}
              size="icon"
              className="h-10 w-10 shrink-0"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div
            onClick={() => setSelectedClientId(null)}
            className={cn(
              "group flex items-center gap-4 px-4 py-4 rounded-xl cursor-pointer transition-all border",
              selectedClientId === null ? "bg-primary/5 border-primary/30 shadow-sm" : "hover:bg-accent/50 border-transparent"
            )}
          >
            <div className={cn(
              "size-10 rounded-xl flex items-center justify-center transition-colors",
              selectedClientId === null ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
            )}>
              <Lock className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold">Genel Kasa</span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{credentials.length} Kayıt</span>
            </div>
          </div>

          <div className="py-2 px-1">
             <div className="h-px w-full bg-border/40" />
          </div>

          {clientsWithCredentials.map(client => (
            <div
              key={client.id}
              onClick={() => setSelectedClientId(client.id)}
              className={cn(
                "group flex items-center gap-4 px-4 py-4 rounded-xl cursor-pointer transition-all border",
                selectedClientId === client.id ? "bg-primary/5 border-primary/30 shadow-sm" : "hover:bg-accent/50 border-transparent"
              )}
            >
              <div className={cn(
                "size-10 rounded-xl flex items-center justify-center text-xs font-black transition-colors",
                selectedClientId === client.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-white"
              )}>
                {client.first_name[0]}{client.last_name?.[0] || client.first_name[1] || ''}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold truncate">{client.first_name} {client.last_name}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{getCredentialsByClient(client.id).length} Kayıt</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Board */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <header className="px-8 py-8 border-b flex items-center justify-between shrink-0">
           <div className="space-y-1">
              <div className="flex items-center gap-3">
                 <h1 className="text-3xl font-bold tracking-tight">
                   {selectedClientId ? clients.find(c => c.id === selectedClientId)?.company || 'Müşteri Kasası' : 'Ana Altyapı'}
                 </h1>
                 <Badge variant="outline" className="gap-1.5 text-blue-500 border-blue-200">
                    <ShieldCheck className="size-3" />
                    AES-256
                 </Badge>
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                {filteredCredentials.length} korunan kimlik bilgisi
              </p>
           </div>
           <Button onClick={() => setShowForm(true)} className="gap-2">
             <Key className="size-4" />
             Yeni Kayıt
           </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {filteredCredentials.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-24 opacity-30 text-center">
                  <Lock className="size-20 mb-6 text-muted-foreground" />
                  <p className="text-xl font-bold uppercase tracking-widest">Kasa Boş</p>
                  <p className="text-sm">Henüz bir kimlik bilgisi eklenmemiş.</p>
               </div>
            ) : (
               <div className="space-y-12">
                  {CREDENTIAL_TYPES.map(type => {
                    const typeCreds = getCredentialsByType(type.value)
                    if (typeCreds.length === 0) return null
                    return (
                      <section key={type.value} className="space-y-6">
                        <div className="flex items-center gap-4">
                           <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                             <type.icon className="size-3.5" />
                             {type.label}
                           </h2>
                           <div className="h-px flex-1 bg-border/40" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {typeCreds.map(cred => (
                            <CredentialCard
                              key={cred.id}
                              cred={cred}
                              visibleSecrets={visibleSecrets}
                              toggleVisibility={toggleVisibility}
                              copiedId={copiedId}
                              copyToClipboard={copyToClipboard}
                              onEdit={() => setEditingCredential(cred)}
                              onDelete={() => handleDelete(cred.id)}
                            />
                          ))}
                        </div>
                      </section>
                    )
                  })}
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog 
        open={showForm || !!editingCredential} 
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false)
            setEditingCredential(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCredential ? 'Kayıt Güncelle' : 'Yeni Kimlik Ekle'}</DialogTitle>
            <DialogDescription>Girdiğiniz tüm bilgiler uçtan uca şifrelenerek saklanır.</DialogDescription>
          </DialogHeader>
          <CredentialForm
            clients={clients}
            onSubmit={editingCredential ? handleEdit : handleAdd}
            onCancel={() => { setShowForm(false); setEditingCredential(null); }}
            initialData={editingCredential || undefined}
            preselectedClientId={selectedClientId || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
