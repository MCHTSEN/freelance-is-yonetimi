import { ReactNode, useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-glass-bg backdrop-blur-3xl border border-glass-border rounded-3xl w-full max-w-lg mx-4 shadow-glass animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute -top-12 -right-12 size-32 bg-primary/20 rounded-full blur-3xl" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-4 relative z-10">
          <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="size-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center border border-white/10"
          >
            <span className="material-symbols-rounded text-2xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 pt-4 relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}
