import { useEffect, useState } from 'react'

interface ConfirmDialogProps {
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

const EXIT_ANIMATION_MS = 150

export function ConfirmDialog({
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [closing, setClosing] = useState<'confirm' | 'cancel' | null>(null)

  // Plays the exit animation first, then calls the real callback once it's
  // finished -- calling it immediately would unmount this component before
  // the animation ever gets a chance to render.
  const close = (action: 'confirm' | 'cancel') => {
    if (closing) return
    setClosing(action)
    window.setTimeout(() => {
      if (action === 'confirm') onConfirm()
      else onCancel()
    }, EXIT_ANIMATION_MS)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close('cancel')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // Re-attaches whenever `closing` changes so the guard inside `close`
    // always sees the current value -- otherwise Escape could fire a second
    // close after one was already in progress, using a stale closure.
  }, [closing, onConfirm, onCancel])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 ${
        closing ? 'dialog-backdrop-exit' : 'dialog-backdrop-enter'
      }`}
      onClick={() => close('cancel')}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className={`w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5 shadow-lg ${
          closing ? 'dialog-card-exit' : 'dialog-card-enter'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-gray-700">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => close('confirm')}
            autoFocus
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={() => close('cancel')}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
