import {
    AlertCircle,
    ChevronRight,
    Loader2,
    Lock,
    Mail,
    ShieldCheck,
    UserPlus,
    Zap
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden font-display selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full opacity-30 dark:opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[150px] rounded-full opacity-30 dark:opacity-50 animate-pulse" />
      
      <div className="w-full max-w-[440px] relative z-10 flex flex-col gap-10">
        {/* Brand System */}
        <div className="text-center space-y-6">
          <div className="inline-flex relative group">
             <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <div className="relative size-20 rounded-3xl bg-gradient-to-tr from-primary via-indigo-600 to-indigo-400 p-[1px] shadow-2xl">
                <div className="w-full h-full rounded-[23px] bg-slate-950 flex items-center justify-center">
                   <Zap className="size-8 text-primary fill-primary/20" />
                </div>
             </div>
          </div>
          <div className="space-y-2">
             <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none">FREE.OS</h1>
             <div className="flex items-center justify-center gap-2">
                <div className="h-px w-4 bg-primary/40" />
                <p className="text-primary/70 dark:text-primary/60 font-black uppercase text-xs tracking-[0.4em]">Integrated Workspace</p>
                <div className="h-px w-4 bg-primary/40" />
             </div>
          </div>
        </div>

        {/* Enhanced Auth Card */}
        <Card className="bg-card/40 dark:bg-white/[0.02] backdrop-blur-2xl border-border/50 dark:border-white/[0.05] rounded-[2.5rem] shadow-2xl overflow-hidden">
          <CardContent className="p-10">
            <div className="mb-10 space-y-2 text-left">
               <h2 className="text-2xl font-bold text-foreground tracking-tight">
                 {isSignUp ? 'Yeni Kayıt' : 'Yetkilendirme'}
               </h2>
               <p className="text-muted-foreground text-xs font-medium leading-relaxed">
                 {isSignUp ? 'Sistem yöneticisi profilinizi oluşturun.' : 'Devam etmek için güvenli giriş yapın.'}
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2.5">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">E-Posta Kimliği</Label>
                <div className="relative group">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                   <Input
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="h-14 pl-12 bg-background/50 border-border rounded-2xl text-foreground placeholder:text-muted-foreground/30 focus:border-primary/40 focus:ring-primary/20 transition-all font-bold"
                     placeholder="admin@workspace.os"
                     required
                   />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Erişim Anahtarı</Label>
                <div className="relative group">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                   <Input
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="h-14 pl-12 bg-background/50 border-border rounded-2xl text-foreground placeholder:text-muted-foreground/30 focus:border-primary/40 focus:ring-primary/20 transition-all font-bold"
                     placeholder="••••••••"
                     required
                     minLength={6}
                   />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                   <AlertCircle className="size-4 text-destructive shrink-0" />
                   <p className="text-destructive/80 text-xs font-bold uppercase tracking-wider leading-tight">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-xs font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3 active:scale-[0.98] group"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    {isSignUp ? <UserPlus className="size-4" /> : <ShieldCheck className="size-4" />}
                    <span>{isSignUp ? 'KAYDI TAMAMLA' : 'SİSTEME GİRİŞ'}</span>
                    <ChevronRight className="size-3 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-10 py-4 border-t border-border/20 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                }}
                className="text-muted-foreground/60 hover:text-primary transition-all text-xs font-black uppercase tracking-[0.2em]"
              >
                {isSignUp ? 'Hesaba Dön' : 'Yeni Kayıt'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Console Meta */}
        <div className="flex flex-col items-center gap-5">
           <div className="flex items-center gap-3 opacity-20 dark:opacity-40 group">
             <div className="h-px w-10 bg-foreground transition-all group-hover:w-20" />
             <p className="text-xs font-black uppercase tracking-[0.6em] text-foreground">CORE CORE v1.0</p>
             <div className="h-px w-10 bg-foreground transition-all group-hover:w-20" />
           </div>
           <div className="flex gap-6 opacity-30">
              <div className="size-1 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <div className="size-1 rounded-full bg-border" />
              <div className="size-1 rounded-full bg-border" />
           </div>
        </div>
      </div>
    </div>
  )
}
