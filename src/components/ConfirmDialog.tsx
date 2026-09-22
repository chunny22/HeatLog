import { useEffect, useState } from 'react'
import { TrashIcon } from './icons'
import { btnDangerClass, btnSecondaryClass } from './ui'

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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 px-4 dark:bg-black/65 ${
        closing ? 'dialog-backdrop-exit' : 'dialog-backdrop-enter'
      }`}
      onClick={() => close('cancel')}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-describedby="confirm-dialog-message"
        className={`flex w-full max-w-[400px] flex-col items-center gap-4 rounded-card bg-surface p-7 text-center shadow-pop ${
          closing ? 'dialog-card-exit' : 'dialog-card-enter'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
          <TrashIcon size={24} />
        </span>
        <p id="confirm-dialog-message" className="text-[15px] leading-[22px] font-medium text-ink-2">
          {message}
        </p>
        <div className="mt-1 grid w-full grid-cols-2 gap-2.5">
          <button type="button" onClick={() => close('cancel')} className={btnSecondaryClass}>
            {cancelLabel}
          </button>
          <button type="button" onClick={() => close('confirm')} autoFocus className={btnDangerClass}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
