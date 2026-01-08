import React, { useState } from 'react';

interface Credential {
  id: string;
  type: 'web' | 'ssh' | 'db' | 'api';
  title: string;
  username?: string;
  password?: string;
  url?: string;
  host?: string;
  port?: string;
  key?: string;
  notes?: string;
}

interface Client {
  id: string;
  name: string;
  project: string;
  initials: string;
  color: string;
  credentials: Credential[];
}

const MOCK_DATA: Client[] = [
  {
    id: '1',
    name: 'TechStart Ltd.',
    project: 'E-Commerce Platform',
    initials: 'TS',
    color: 'bg-indigo-500',
    credentials: [
      { id: 'c1', type: 'web', title: 'WordPress Admin', url: 'https://techstart.com/wp-admin', username: 'admin_ts', password: 'secure_password_123!' },
      { id: 'c2', type: 'ssh', title: 'Production Server', host: '192.168.1.55', port: '22', username: 'root', key: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----' },
      { id: 'c3', type: 'api', title: 'Stripe Live Keys', username: 'pk_live_51H...', password: 'sk_live_51H...' }
    ]
  },
  {
    id: '2',
    name: 'Acme Corp',
    project: 'Corporate Website',
    initials: 'AC',
    color: 'bg-emerald-500',
    credentials: [
      { id: 'c4', type: 'web', title: 'CPanel', url: 'https://cpanel.acmecorp.com', username: 'acme_master', password: 'orange-banana-123' },
      { id: 'c5', type: 'db', title: 'MySQL Production', host: 'db.acmecorp.com', port: '3306', username: 'app_user', password: 'db_password_x99' }
    ]
  },
  {
    id: '3',
    name: 'Global Ventures',
    project: 'Mobile App API',
    initials: 'GV',
    color: 'bg-rose-500',
    credentials: [
      { id: 'c6', type: 'ssh', title: 'Staging Droplet', host: '10.0.0.4', port: '22', username: 'deploy', password: 'temp_password' }
    ]
  }
];

interface CredentialCardProps {
  cred: Credential;
  visibleSecrets: Record<string, boolean>;
  toggleVisibility: (id: string) => void;
  copiedId: string | null;
  copyToClipboard: (text: string, id: string) => void;
}

const CredentialCard: React.FC<CredentialCardProps> = ({ 
  cred, 
  visibleSecrets, 
  toggleVisibility, 
  copiedId, 
  copyToClipboard 
}) => (
  <div className="bg-surface-dark border border-border-dark rounded-xl p-5 shadow-sm hover:border-primary/30 transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`size-10 rounded-lg flex items-center justify-center ${
          cred.type === 'web' ? 'bg-blue-500/10 text-blue-400' :
          cred.type === 'ssh' ? 'bg-orange-500/10 text-orange-400' :
          cred.type === 'db' ? 'bg-purple-500/10 text-purple-400' :
          'bg-emerald-500/10 text-emerald-400'
        }`}>
          <span className="material-symbols-outlined text-[20px]">
            {cred.type === 'web' ? 'language' :
             cred.type === 'ssh' ? 'terminal' :
             cred.type === 'db' ? 'database' : 'api'}
          </span>
        </div>
        <div>
          <h3 className="text-white font-bold text-base leading-tight">{cred.title}</h3>
          <span className="text-text-secondary text-xs font-medium uppercase tracking-wide">{cred.type === 'web' ? 'Web Login' : cred.type.toUpperCase()} Access</span>
        </div>
      </div>
      <button className="text-text-secondary hover:text-white transition-colors">
        <span className="material-symbols-outlined text-[20px]">more_vert</span>
      </button>
    </div>

    <div className="space-y-3">
      {cred.url && (
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-[#587593]">Login URL</label>
          <a href={cred.url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm truncate flex items-center gap-1">
            {cred.url} <span className="material-symbols-outlined text-[12px]">open_in_new</span>
          </a>
        </div>
      )}

      {cred.host && (
        <div className="grid grid-cols-2 gap-4">
           <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-[#587593]">Host</label>
            <div className="group/field flex items-center justify-between bg-[#111a22] rounded px-2 py-1.5 border border-transparent hover:border-border-dark transition-colors">
              <span className="text-slate-300 text-sm font-mono truncate">{cred.host}</span>
              <button 
                onClick={() => copyToClipboard(cred.host!, `${cred.id}-host`)}
                className="opacity-0 group-hover/field:opacity-100 text-text-secondary hover:text-white transition-opacity"
              >
                <span className="material-symbols-outlined text-[14px]">{copiedId === `${cred.id}-host` ? 'check' : 'content_copy'}</span>
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-[#587593]">Port</label>
            <span className="text-slate-300 text-sm font-mono bg-[#111a22] rounded px-2 py-1.5">{cred.port}</span>
          </div>
        </div>
      )}

      {cred.username && (
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-[#587593]">{cred.type === 'api' ? 'API Key / ID' : 'Username'}</label>
          <div className="group/field flex items-center justify-between bg-[#111a22] rounded px-3 py-2 border border-transparent hover:border-border-dark transition-colors">
            <span className="text-white text-sm font-mono truncate select-all">{cred.username}</span>
            <button 
              onClick={() => copyToClipboard(cred.username!, `${cred.id}-user`)}
              className="opacity-0 group-hover/field:opacity-100 text-text-secondary hover:text-white transition-opacity"
            >
              <span className="material-symbols-outlined text-[16px]">{copiedId === `${cred.id}-user` ? 'check' : 'content_copy'}</span>
            </button>
          </div>
        </div>
      )}

      {cred.password && (
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-[#587593]">{cred.type === 'api' ? 'API Secret' : 'Password'}</label>
          <div className="group/field relative flex items-center justify-between bg-[#111a22] rounded px-3 py-2 border border-transparent hover:border-border-dark transition-colors overflow-hidden">
             <span className={`text-sm font-mono truncate transition-all ${visibleSecrets[`${cred.id}-pass`] ? 'text-white' : 'blur-sm text-slate-500 select-none'}`}>
               {visibleSecrets[`${cred.id}-pass`] ? cred.password : '••••••••••••••••'}
             </span>
             
             <div className="flex items-center gap-2 pl-2 bg-[#111a22]">
                <button 
                  onClick={() => toggleVisibility(`${cred.id}-pass`)}
                  className="text-text-secondary hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">{visibleSecrets[`${cred.id}-pass`] ? 'visibility_off' : 'visibility'}</span>
                </button>
                <button 
                  onClick={() => copyToClipboard(cred.password!, `${cred.id}-pass`)}
                  className="text-text-secondary hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">{copiedId === `${cred.id}-pass` ? 'check' : 'content_copy'}</span>
                </button>
             </div>
          </div>
        </div>
      )}

      {cred.key && (
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-[10px] uppercase font-bold text-[#587593]">Private Key</label>
          <div className="relative group/field">
             <div className={`bg-[#111a22] rounded-lg p-3 text-[10px] font-mono text-slate-400 leading-tight border border-transparent hover:border-border-dark transition-colors h-20 overflow-hidden relative cursor-pointer ${visibleSecrets[`${cred.id}-key`] ? '' : 'blur-md opacity-50'}`} onClick={() => toggleVisibility(`${cred.id}-key`)}>
               {cred.key}
             </div>
             {!visibleSecrets[`${cred.id}-key`] && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="flex items-center gap-1 text-xs font-bold text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                     <span className="material-symbols-outlined text-[14px]">lock</span> Click to Reveal
                  </span>
               </div>
             )}
             {visibleSecrets[`${cred.id}-key`] && (
               <button 
                  onClick={() => copyToClipboard(cred.key!, `${cred.id}-key`)}
                  className="absolute top-2 right-2 p-1.5 bg-surface-lighter rounded text-white hover:bg-primary transition-colors shadow-lg"
                >
                  <span className="material-symbols-outlined text-[16px]">{copiedId === `${cred.id}-key` ? 'check' : 'content_copy'}</span>
                </button>
             )}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default function CustomerCredentials() {
  const [selectedClientId, setSelectedClientId] = useState<string>(MOCK_DATA[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeClient = MOCK_DATA.find(c => c.id === selectedClientId) || MOCK_DATA[0];

  const filteredClients = MOCK_DATA.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleVisibility = (id: string) => {
    setVisibleSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex w-full h-full">
        {/* Sidebar */}
        <aside className="w-80 flex flex-col border-r border-border-dark bg-surface-dark shrink-0">
           <div className="p-4 border-b border-border-dark space-y-3">
              <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Clients</h2>
                  <button className="text-primary hover:text-blue-400"><span className="material-symbols-outlined">add_circle</span></button>
              </div>
              <div className="relative">
                 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
                 <input 
                    className="w-full bg-[#192633] text-white placeholder-text-secondary text-sm rounded-lg border border-border-dark focus:border-primary focus:ring-1 focus:ring-primary pl-10 pr-3 py-2.5 outline-none transition-all" 
                    placeholder="Search clients..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {filteredClients.map(client => (
                  <div 
                    key={client.id} 
                    onClick={() => setSelectedClientId(client.id)}
                    className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
                        selectedClientId === client.id 
                        ? 'bg-[#1f2e3d] border border-primary/30 shadow-md' 
                        : 'hover:bg-[#1f2e3d] border border-transparent'
                    }`}
                  >
                    <div className={`size-10 rounded-full ${client.color} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                        {client.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${selectedClientId === client.id ? 'text-white' : 'text-slate-300'}`}>{client.name}</p>
                        <p className="text-text-secondary text-xs truncate">{client.project}</p>
                    </div>
                    {selectedClientId === client.id && (
                        <span className="material-symbols-outlined text-primary text-[20px]">chevron_right</span>
                    )}
                  </div>
              ))}
           </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-background-dark min-w-0 overflow-hidden">
            {/* Header */}
            <header className="px-8 py-6 border-b border-border-dark bg-surface-dark/50 backdrop-blur-sm flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className={`size-12 rounded-xl ${activeClient.color} flex items-center justify-center text-white font-black text-lg shadow-lg`}>
                     {activeClient.initials}
                  </div>
                  <div>
                     <h1 className="text-2xl font-black text-white leading-tight tracking-tight">{activeClient.name}</h1>
                     <div className="flex items-center gap-2 text-text-secondary text-sm">
                        <span className="material-symbols-outlined text-[16px]">folder_open</span>
                        <span>{activeClient.project}</span>
                        <span className="mx-1">•</span>
                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold uppercase">Active</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button className="flex h-9 items-center justify-center gap-2 px-4 rounded-lg bg-surface-lighter text-white text-sm font-bold hover:bg-[#2f455a] transition-colors border border-border-dark">
                     <span className="material-symbols-outlined text-[18px]">share</span> Share
                  </button>
                  <button className="flex h-9 items-center justify-center gap-2 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20">
                     <span className="material-symbols-outlined text-[18px]">add</span> Add New
                  </button>
               </div>
            </header>

            {/* Credentials Grid */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
               <div className="max-w-6xl mx-auto">
                   
                   {/* Web Logins */}
                   <div className="mb-8">
                        <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-text-secondary">language</span> Web Access
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {activeClient.credentials.filter(c => c.type === 'web').map(cred => (
                                <CredentialCard 
                                    key={cred.id} 
                                    cred={cred} 
                                    visibleSecrets={visibleSecrets}
                                    toggleVisibility={toggleVisibility}
                                    copiedId={copiedId}
                                    copyToClipboard={copyToClipboard}
                                />
                            ))}
                            <button className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-dark bg-transparent p-5 hover:border-primary hover:bg-primary/5 transition-all text-text-secondary hover:text-primary min-h-[180px]">
                                <span className="material-symbols-outlined text-3xl">add</span>
                                <span className="text-sm font-bold">Add Web Login</span>
                            </button>
                        </div>
                   </div>

                   {/* Server/SSH */}
                   <div className="mb-8">
                        <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-text-secondary">dns</span> Server & SSH
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {activeClient.credentials.filter(c => c.type === 'ssh').map(cred => (
                                <CredentialCard 
                                    key={cred.id} 
                                    cred={cred} 
                                    visibleSecrets={visibleSecrets}
                                    toggleVisibility={toggleVisibility}
                                    copiedId={copiedId}
                                    copyToClipboard={copyToClipboard}
                                />
                            ))}
                             {activeClient.credentials.filter(c => c.type === 'ssh').length === 0 && (
                                <div className="col-span-full p-8 rounded-xl border border-dashed border-border-dark bg-[#111a22] flex flex-col items-center justify-center text-center">
                                    <div className="size-12 rounded-full bg-surface-lighter flex items-center justify-center mb-3">
                                        <span className="material-symbols-outlined text-text-secondary text-xl">terminal</span>
                                    </div>
                                    <p className="text-text-secondary text-sm">No server credentials added yet.</p>
                                    <button className="mt-3 text-primary text-sm font-bold hover:underline">Add Server</button>
                                </div>
                            )}
                        </div>
                   </div>
                   
                   {/* Databases & APIs */}
                   <div className="mb-8">
                        <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-text-secondary">database</span> Database & API
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {activeClient.credentials.filter(c => c.type === 'db' || c.type === 'api').map(cred => (
                                <CredentialCard 
                                    key={cred.id} 
                                    cred={cred} 
                                    visibleSecrets={visibleSecrets}
                                    toggleVisibility={toggleVisibility}
                                    copiedId={copiedId}
                                    copyToClipboard={copyToClipboard}
                                />
                            ))}
                        </div>
                   </div>

               </div>
            </div>
        </div>
    </div>
  );
}