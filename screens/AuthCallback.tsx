import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase will automatically handle the OAuth callback
        // and set the session from the URL hash
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (data.session) {
          // Successfully authenticated, redirect to dashboard
          navigate('/', { replace: true })
        } else {
          // No session found, redirect to login
          navigate('/login', { replace: true })
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err instanceof Error ? err.message : 'Kimlik doğrulama hatası')
      }
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
        <div className="bg-surface-dark rounded-xl border border-border-dark p-8 max-w-md w-full text-center">
          <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-red-400">error</span>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Kimlik Doğrulama Hatası</h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg text-white font-medium transition-colors"
          >
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-rounded text-primary text-4xl animate-spin">progress_activity</span>
        <p className="text-text-secondary">Kimlik doğrulanıyor...</p>
      </div>
    </div>
  )
}
