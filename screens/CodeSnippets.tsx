import React, { useState } from 'react';

const SNIPPETS_DATA = [
    {
        id: 1,
        title: 'AWS S3 Bucket Policy',
        project: 'E-Commerce API',
        lang: 'JSON',
        color: 'amber',
        desc: 'This policy allows read-only access to the public assets bucket. Ensure that this is only applied to the production environment.',
        code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::example-bucket/*"
    }
  ]
}`,
        envVars: {
            AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
            AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
        }
    },
    {
        id: 2,
        title: 'React Custom Hook: useFetch',
        project: 'Dashboard App',
        lang: 'TypeScript',
        color: 'blue',
        desc: 'A reusable hook for fetching data with loading and error states.',
        code: `import { useState, useEffect } from 'react';

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, [url]);

  return { data, loading };
}`,
        envVars: {
            API_BASE_URL: 'https://api.dashboard.com/v1',
            API_TIMEOUT: '5000'
        }
    },
    {
        id: 3,
        title: 'Docker Compose Setup',
        project: 'Microservices',
        lang: 'YAML',
        color: 'purple',
        desc: 'Standard setup for Node.js and Postgres containers.',
        code: `version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
  db:
    image: postgres:13
    environment:
      POSTGRES_PASSWORD: example`,
        envVars: {
            POSTGRES_DB: 'main_db',
            POSTGRES_USER: 'admin'
        }
    }
];

export default function CodeSnippets() {
  const [revealed, setRevealed] = useState(false);
  const [activeSnippetId, setActiveSnippetId] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const activeSnippet = SNIPPETS_DATA.find(s => s.id === activeSnippetId) || SNIPPETS_DATA[0];

  const handleCopy = () => {
      navigator.clipboard.writeText(activeSnippet.code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = () => {
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="flex w-full h-full">
        {/* Sidebar */}
        <aside className="w-80 flex flex-col border-r border-border-dark bg-surface-dark shrink-0">
           <div className="p-4 border-b border-border-dark space-y-3">
              <div className="relative">
                 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
                 <input className="w-full bg-[#192633] text-white placeholder-text-secondary text-sm rounded-lg border border-border-dark focus:border-primary focus:ring-1 focus:ring-primary pl-10 pr-3 py-2.5 outline-none transition-all" placeholder="Search notes, snippets, keys..." />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                 <button className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-semibold whitespace-nowrap">All</button>
                 <button className="px-3 py-1.5 rounded-full bg-border-dark text-text-secondary hover:text-white text-xs font-medium whitespace-nowrap transition-colors">Snippets</button>
                 <button className="px-3 py-1.5 rounded-full bg-border-dark text-text-secondary hover:text-white text-xs font-medium whitespace-nowrap transition-colors">Env Vars</button>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-3 space-y-6">
              <div>
                 <h3 className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-[#587593]">Recent</h3>
                 <div className="space-y-1">
                    {SNIPPETS_DATA.map(snippet => (
                        <div 
                            key={snippet.id} 
                            onClick={() => { setActiveSnippetId(snippet.id); setRevealed(false); }}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSnippetId === snippet.id ? 'bg-[#1f2e3d] border border-primary/30 shadow-sm relative overflow-hidden' : 'hover:bg-border-dark/50'}`}
                        >
                            {activeSnippetId === snippet.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                            <span className={`material-symbols-outlined text-[20px] ${activeSnippetId === snippet.id ? 'text-primary' : 'text-text-secondary'}`}>
                                {activeSnippetId === snippet.id ? 'description' : 'code'}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${activeSnippetId === snippet.id ? 'text-white' : 'text-slate-300'}`}>{snippet.title}</p>
                                <p className="text-text-secondary text-xs truncate">{snippet.project}</p>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
           </div>
        </aside>

        {/* Editor */}
        <div className="flex-1 flex flex-col bg-background-dark min-w-0 relative">
            <div className="flex items-center justify-between px-8 py-4 border-b border-border-dark bg-surface-dark/50 backdrop-blur-sm sticky top-0 z-10">
               <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                     <span>Projects</span>
                     <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                     <span>{activeSnippet.project}</span>
                     <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                     <span className="text-primary font-medium">Snippets</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <h1 className="text-2xl font-bold text-white tracking-tight">{activeSnippet.title}</h1>
                     <span className={`px-2 py-0.5 rounded bg-${activeSnippet.color}-500/10 text-${activeSnippet.color}-400 border border-${activeSnippet.color}-500/20 text-[10px] font-bold uppercase tracking-wide`}>{activeSnippet.lang}</span>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button className="flex items-center justify-center size-9 rounded text-text-secondary hover:bg-border-dark transition-colors"><span className="material-symbols-outlined text-[20px]">lock</span></button>
                  <button className="flex items-center justify-center size-9 rounded text-text-secondary hover:bg-border-dark transition-colors"><span className="material-symbols-outlined text-[20px]">ios_share</span></button>
                  <div className="h-6 w-px bg-border-dark mx-1"></div>
                  <button onClick={handleSave} className="flex items-center justify-center gap-2 px-4 h-9 rounded bg-white text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50" disabled={isSaving}>
                     <span className="material-symbols-outlined text-[18px]">save</span> {isSaving ? 'Saving...' : 'Save'}
                  </button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8 md:px-12 lg:px-20">
               <div className="max-w-4xl mx-auto space-y-6">
                  <p className="text-slate-300 leading-relaxed">
                     {activeSnippet.desc}
                  </p>
                  
                  <div className="rounded-xl overflow-hidden border border-border-dark bg-[#0d1117] shadow-sm">
                     <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-800">
                        <span className="text-xs font-mono text-slate-400">snippet.txt</span>
                        <button onClick={handleCopy} className={`text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs ${isCopied ? 'text-green-400' : ''}`}>
                           <span className="material-symbols-outlined text-[14px]">{isCopied ? 'check' : 'content_copy'}</span> {isCopied ? 'Copied!' : 'Copy'}
                        </button>
                     </div>
                     <div className="p-4 overflow-x-auto">
                        <pre className="font-mono text-sm leading-6">
                           <code className="language-json">
                              {activeSnippet.code}
                           </code>
                        </pre>
                     </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed pt-2">
                     Below are the environment variables required. <strong className="text-rose-500">Do not share these outside the organization.</strong>
                  </p>

                  <div className="group relative rounded-xl border border-rose-900/30 bg-rose-900/10 p-5">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="p-1.5 rounded bg-rose-900/40 text-rose-400">
                           <span className="material-symbols-outlined text-[20px]">lock</span>
                        </div>
                        <div>
                           <h3 className="text-sm font-bold text-white">Protected Environment Variables</h3>
                           <p className="text-xs text-text-secondary">Click to reveal sensitive content</p>
                        </div>
                     </div>
                     <div className="relative rounded-lg bg-[#0d1117] border border-slate-800 overflow-hidden min-h-[100px]" onClick={() => setRevealed(!revealed)}>
                        {!revealed && (
                           <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0d1117]/80 backdrop-blur-sm cursor-pointer hover:bg-[#0d1117]/60 transition-all">
                              <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">visibility_off</span>
                              <span className="text-sm font-medium text-slate-300">Tap to reveal</span>
                           </div>
                        )}
                        <div className={`p-4 font-mono text-sm space-y-2 select-none ${revealed ? '' : 'filter blur-sm'}`}>
                           {Object.entries(activeSnippet.envVars).map(([key, value]) => (
                               <div key={key} className="flex gap-4">
                                  <span className="text-sky-400">{key}</span>
                                  <span className="text-slate-400">=</span>
                                  <span className="text-green-300">{value}</span>
                               </div>
                           ))}
                        </div>
                     </div>
                  </div>

               </div>
            </div>
            
            <div className="h-8 border-t border-border-dark bg-surface-dark flex items-center justify-between px-4 text-[11px] text-text-secondary select-none">
               <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 hover:text-primary cursor-pointer"><span className="material-symbols-outlined text-[14px]">account_tree</span> main</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check_circle</span> All changes saved</span>
               </div>
               <div className="flex items-center gap-4">
                  <span>UTF-8</span>
                  <span>JavaScript/JSON</span>
               </div>
            </div>

        </div>
    </div>
  );
}