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
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <span className="material-symbols-rounded text-primary text-3xl">terminal</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">Freelance OS</h1>
          <p className="text-text-secondary mt-2">Kişisel iş yönetim sisteminiz</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-8">
          <h2 className="text-xl font-medium text-white mb-6">
            {isSignUp ? 'Hesap Oluştur' : 'Giriş Yap'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                placeholder="ornek@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="material-symbols-rounded animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-rounded text-xl">
                    {isSignUp ? 'person_add' : 'login'}
                  </span>
                  {isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
              }}
              className="text-text-secondary hover:text-primary transition-colors text-sm"
            >
              {isSignUp
                ? 'Zaten hesabınız var mı? Giriş yapın'
                : 'Hesabınız yok mu? Kayıt olun'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-text-secondary text-xs mt-6">
          Freelance OS v1.0 - Tüm verileriniz güvende
        </p>
      </div>
    </div>
  )
}
