import { useCallback, useState } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'

interface PendingConfirm {
  message: string
  confirmLabel?: string
  resolve: (value: boolean) => void
}

/**
 * Drop-in replacement for `window.confirm` styled to match the app instead of
 * the browser's native dialog. Usage: `if (await confirm('...')) { ... }`,
 * and render `{dialog}` once somewhere in the component's JSX.
 */
export function useConfirm() {
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const confirm = useCallback((message: string, confirmLabel?: string) => {
    return new Promise<boolean>((resolve) => {
      setPending({ message, confirmLabel, resolve })
    })
  }, [])

  const settle = (value: boolean) => {
    pending?.resolve(value)
    setPending(null)
  }

  const dialog = pending && (
    <ConfirmDialog
      message={pending.message}
      confirmLabel={pending.confirmLabel}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  )

  return { confirm, dialog }
}
