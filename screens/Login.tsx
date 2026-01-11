import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password)

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[150px] rounded-full animate-float" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center size-20 rounded-[2rem] bg-gradient-to-tr from-primary to-indigo-600 p-0.5 shadow-2xl shadow-primary/20">
             <div className="w-full h-full rounded-[1.8rem] bg-slate-900 flex items-center justify-center">
                <span className="material-symbols-rounded text-white text-4xl font-light">terminal</span>
             </div>
          </div>
          <div className="space-y-1">
             <h1 className="text-4xl font-black text-white tracking-tight leading-none">Freelance OS</h1>
             <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em]">Integrated Work Management</p>
          </div>
        </div>

        {/* Auth Container */}
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
          <div className="mb-8 space-y-1">
             <h2 className="text-2xl font-black text-white tracking-tight">
               {isSignUp ? 'Initialize Instance' : 'Authentication Required'}
             </h2>
             <p className="text-slate-500 text-xs font-medium">
               {isSignUp ? 'Create your master account' : 'Please verify your identity to proceed'}
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Universal Identity</label>
              <div className="relative group">
                 <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-[20px] group-focus-within:text-primary transition-colors">alternate_email</span>
                 <input
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:border-primary/50 font-bold transition-all"
                   placeholder="identity@freelance.os"
                   required
                 />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Access Protocol</label>
              <div className="relative group">
                 <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-[20px] group-focus-within:text-primary transition-colors">lock</span>
                 <input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:border-primary/50 font-bold transition-all"
                   placeholder="••••••••"
                   required
                   minLength={6}
                 />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3">
                 <span className="material-symbols-rounded text-rose-500 text-[20px]">error_outline</span>
                 <p className="text-rose-400 text-xs font-bold uppercase tracking-widest leading-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-dark disabled:bg-primary/30 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? (
                <span className="material-symbols-rounded animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-rounded text-[20px] font-black">
                    {isSignUp ? 'person_add' : 'verified_user'}
                  </span>
                  {isSignUp ? 'Begin Initialization' : 'Authorize Access'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
              }}
              className="group text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
            >
              {isSignUp
                ? 'Back to Secure Login'
                : 'Need New Instance? Register'}
            </button>
          </div>
        </div>

        {/* Global Footer */}
        <div className="mt-10 flex flex-col items-center gap-4">
           <div className="flex items-center gap-3 text-slate-700">
             <div className="h-px w-8 bg-slate-800" />
             <p className="text-[10px] font-black uppercase tracking-[0.5em]">Freelance OS Console v1.0</p>
             <div className="h-px w-8 bg-slate-800" />
           </div>
           <div className="flex gap-4">
              <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <div className="size-1.5 rounded-full bg-slate-800" />
              <div className="size-1.5 rounded-full bg-slate-800" />
           </div>
        </div>
      </div>
    </div>
  )
}
