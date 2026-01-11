import { useState } from 'react'
import Modal from '../components/Modal'
import { useClients } from '../hooks/useClients'
import { useCredentials, type CredentialType, type CredentialWithClient } from '../hooks/useCredentials'

const CREDENTIAL_TYPES: { value: CredentialType; label: string; icon: string; color: string; bg: string }[] = [
  { value: 'web', label: 'Web Entry', icon: 'language', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { value: 'ssh', label: 'Terminal / SSH', icon: 'terminal', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { value: 'db', label: 'Database', icon: 'database', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { value: 'api', label: 'API / Service', icon: 'api', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
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
    client_id: initialData?.client_id || preselectedClientId || '',
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
        client_id: formData.client_id || null,
        category: formData.category,
        service_name: formData.service_name,
        username: formData.username || null,
        password_encrypted: formData.password_encrypted || null,
        url: formData.url || null,
        notes: formData.notes || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Client Connection</label>
          <select
            value={formData.client_id}
            onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
            className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 font-bold appearance-none"
          >
            <option value="" className="bg-slate-900">General / No Client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id} className="bg-slate-900">
                {client.first_name} {client.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Protocol Type</label>
          <select
            value={formData.category || 'web'}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 font-bold appearance-none"
          >
            {CREDENTIAL_TYPES.map(type => (
              <option key={type.value} value={type.value} className="bg-slate-900">{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Resource Title</label>
        <input
          type="text"
          value={formData.service_name}
          onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
          className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-[1.25rem] text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-bold"
          placeholder="e.g. AWS Production Dashboard"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Endpoint URL / Host</label>
        <div className="relative">
           <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">link</span>
           <input
            type="text"
            value={formData.url || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/5 rounded-[1.25rem] text-primary text-sm focus:outline-none focus:border-primary/50 transition-all font-mono"
            placeholder="https://console.aws.amazon.com/..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
            Identity / Username
          </label>
          <input
            type="text"
            value={formData.username || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 font-mono"
            placeholder="admin"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-rose-500/80 ml-1">
            Secret / Password
          </label>
          <input
            type="password"
            value={formData.password_encrypted || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, password_encrypted: e.target.value }))}
            className="w-full px-4 py-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-rose-400 text-sm focus:outline-none focus:border-rose-500/50 font-mono"
            placeholder="••••••••••"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Security Notes</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-[1.25rem] text-slate-300 text-sm focus:outline-none focus:border-primary/50 transition-all font-medium resize-none"
          placeholder="Access restrictions, rotation policy, etc..."
          rows={3}
        />
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3">
          <span className="material-symbols-rounded text-rose-500 text-[20px]">error</span>
          <p className="text-rose-400 text-xs font-bold uppercase tracking-widest">{error}</p>
        </div>
      )}

      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 font-black uppercase tracking-widest rounded-2xl transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-4 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="material-symbols-rounded animate-spin">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-rounded font-black">{initialData ? 'verified_user' : 'encrypted'}</span>
              {initialData ? 'Update Vault' : 'Secure in Vault'}
            </>
          )}
        </button>
      </div>
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
    <div className="group relative">
      {/* Decorative Glow */}
      <div className={`absolute -inset-0.5 rounded-[2rem] bg-gradient-to-br transition-all duration-500 opacity-0 blur group-hover:opacity-100 ${typeConfig.bg.replace('bg-', 'from-').replace('/10', '/30')}`} />
      
      <div className="relative flex flex-col h-full bg-[#0a0f1a] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 group-hover:translate-y-[-4px] group-hover:border-white/10">
        {/* Card Header */}
        <div className="p-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`size-12 rounded-2xl flex items-center justify-center ${typeConfig.bg} ${typeConfig.color} shadow-inner`}>
              <span className="material-symbols-rounded text-2xl">{typeConfig.icon}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{typeConfig.label}</span>
              <h3 className="text-white font-black tracking-tight leading-tight">{cred.service_name}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={onEdit} className="size-8 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all flex items-center justify-center">
              <span className="material-symbols-rounded text-[18px]">edit_square</span>
            </button>
            <button onClick={onDelete} className="size-8 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-all flex items-center justify-center">
              <span className="material-symbols-rounded text-[18px]">delete</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-6 pt-2 space-y-4">
          {cred.url && (
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Gateway Endpoint</label>
              <a
                href={cred.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary font-mono bg-primary/5 border border-primary/10 px-4 py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all overflow-hidden"
              >
                <span className="material-symbols-rounded text-[14px]">open_in_new</span>
                <span className="truncate">{cred.url}</span>
              </a>
            </div>
          )}

          <div className="space-y-3 pt-2">
            {cred.username && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Identity / UID</label>
                <div onClick={() => copyToClipboard(cred.username!, `${cred.id}-user`)} className="bg-white/[0.02] border border-white/5 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between group/field">
                  <span className="text-white text-sm font-mono tracking-tight">{cred.username}</span>
                  <span className="material-symbols-rounded text-[14px] opacity-0 group-hover/field:opacity-100">{copiedId === `${cred.id}-user` ? 'done' : 'content_copy'}</span>
                </div>
              </div>
            )}

            {cred.password_encrypted && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-rose-500/60">Secret / Token</label>
                <div
                  className="relative h-11 bg-rose-500/5 border border-rose-500/10 rounded-xl overflow-hidden cursor-pointer group/pass"
                  onClick={() => !visibleSecrets[`${cred.id}-pass`] && toggleVisibility(`${cred.id}-pass`)}
                >
                  <div className={`absolute inset-0 flex items-center justify-between px-4 transition-all duration-300 ${visibleSecrets[`${cred.id}-pass`] ? 'opacity-100' : 'opacity-0 translate-y-2'}`}>
                    <span className="text-rose-400 text-sm font-mono truncate mr-8">{cred.password_encrypted}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); toggleVisibility(`${cred.id}-pass`) }} className="text-rose-500/60 hover:text-rose-400">
                        <span className="material-symbols-rounded text-[16px]">visibility_off</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); copyToClipboard(cred.password_encrypted!, `${cred.id}-pass`) }} className="text-rose-500/60 hover:text-rose-400">
                        <span className="material-symbols-rounded text-[16px]">{copiedId === `${cred.id}-pass` ? 'done' : 'content_copy'}</span>
                      </button>
                    </div>
                  </div>
                  
                  {!visibleSecrets[`${cred.id}-pass`] && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 text-rose-500/40 group-hover/pass:text-rose-400 transition-colors">
                       <span className="material-symbols-rounded text-[18px]">lock</span>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Unlock Protocol</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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
    if (!confirm('This action will permanently delete these credentials from the vault. Proceed?')) return
    await deleteCredential(id)
  }

  const getCredentialsByType = (type: CredentialType) => filteredCredentials.filter(c => (c.category as CredentialType) === type)

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
            <span className="text-primary text-[10px] uppercase font-black tracking-widest opacity-70 leading-none">Security Center</span>
            <h2 className="text-white text-2xl font-black tracking-tight">Identity Vault</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 text-white placeholder-slate-600 text-xs rounded-xl border border-white/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 pl-10 pr-3 py-3 outline-none transition-all"
                placeholder="Search assets..."
              />
            </div>
            <button
               onClick={() => setShowForm(true)}
               className="size-11 bg-primary hover:bg-primary-dark text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-primary/20 active:scale-90"
            >
               <span className="material-symbols-rounded font-black">add</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div
            onClick={() => setSelectedClientId(null)}
            className={`group flex items-center gap-4 px-4 py-4 rounded-[1.25rem] cursor-pointer transition-all border ${
              selectedClientId === null ? 'bg-white/10 border-primary/40 shadow-xl' : 'hover:bg-white/5 border-transparent'
            }`}
          >
            <div className={`size-10 rounded-xl flex items-center justify-center ${selectedClientId === null ? 'bg-primary text-white' : 'bg-white/5 text-slate-500 group-hover:text-white transition-colors'}`}>
              <span className="material-symbols-rounded text-xl font-black">vpn_lock</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-black">Global Vault</span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{credentials.length} Records</span>
            </div>
          </div>

          <div className="py-2 px-4">
             <div className="h-px w-full bg-white/5" />
          </div>

          {clientsWithCredentials.map(client => (
            <div
              key={client.id}
              onClick={() => setSelectedClientId(client.id)}
              className={`group flex items-center gap-4 px-4 py-4 rounded-[1.25rem] cursor-pointer transition-all border ${
                selectedClientId === client.id ? 'bg-white/10 border-primary/40 shadow-xl' : 'hover:bg-white/5 border-transparent'
              }`}
            >
              <div className={`size-10 rounded-xl flex items-center justify-center text-xs font-black ${selectedClientId === client.id ? 'bg-primary text-white' : 'bg-white/5 text-slate-500 group-hover:text-white transition-colors'}`}>
                {client.first_name[0]}{client.last_name[0]}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-white text-xs font-bold truncate">{client.first_name} {client.last_name}</span>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{getCredentialsByClient(client.id).length} Records</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
        <header className="px-10 py-10 border-b border-white/5 flex items-center justify-between">
           <div className="space-y-1">
              <div className="flex items-center gap-3">
                 <h1 className="text-4xl font-black text-white tracking-tight">
                   {selectedClientId ? clients.find(c => c.id === selectedClientId)?.company || 'Secure Client Entity' : 'Master Infrastructure'}
                 </h1>
                 <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest animate-pulse">
                    Live Encryption
                 </div>
              </div>
              <p className="text-slate-500 text-xs font-medium ml-1">
                Encryption active • {filteredCredentials.length} protected resources
              </p>
           </div>
           <button
             onClick={() => setShowForm(true)}
             className="flex items-center gap-3 px-8 h-12 bg-primary hover:bg-primary-dark text-white rounded-[1rem] text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95"
           >
             <span className="material-symbols-rounded text-[20px] font-black">add_moderator</span>
             New Protocol
           </button>
        </header>

        <div className="flex-1 overflow-y-auto px-10 py-10 pb-32">
          <div className="max-w-7xl mx-auto">
            {filteredCredentials.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-24 opacity-30">
                  <span className="material-symbols-rounded text-8xl mb-6">lock_reset</span>
                  <p className="text-xl font-black uppercase tracking-[0.3em]">No Secure Protocols Found</p>
               </div>
            ) : (
               <div className="space-y-12">
                  {CREDENTIAL_TYPES.map(type => {
                    const typeCreds = getCredentialsByType(type.value)
                    if (typeCreds.length === 0) return null
                    return (
                      <section key={type.value} className="space-y-6">
                        <div className="flex items-center gap-4 mb-2">
                           <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-white/5`} />
                           <h2 className={`text-[10px] font-black uppercase tracking-[0.4em] ${type.color} flex items-center gap-2`}>
                             <span className="material-symbols-rounded text-sm">{type.icon}</span>
                             {type.label} Channels
                           </h2>
                           <div className={`h-px flex-1 bg-gradient-to-l from-transparent to-white/5`} />
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

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Initialize Secure Protocol">
        <CredentialForm
          clients={clients}
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
          preselectedClientId={selectedClientId || undefined}
        />
      </Modal>

      <Modal isOpen={!!editingCredential} onClose={() => setEditingCredential(null)} title="Update Vault Structure">
        {editingCredential && (
          <CredentialForm
            clients={clients}
            onSubmit={handleEdit}
            onCancel={() => setEditingCredential(null)}
            initialData={editingCredential}
          />
        )}
      </Modal>
    </div>
  )
}
