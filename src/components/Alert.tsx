import type { ReactNode } from 'react'
import { AlertIcon, CheckIcon } from './icons'

interface AlertProps {
  tone: 'error' | 'success'
  children: ReactNode
}

export function Alert({ tone, children }: AlertProps) {
  const isError = tone === 'error'
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-center gap-3 rounded-[18px] py-3 pr-4 pl-3 text-sm font-semibold ${
        isError ? 'bg-danger-soft text-danger-ink' : 'bg-success-soft text-success-ink'
      }`}
    >
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-white ${
          isError ? 'bg-danger' : 'bg-success'
        }`}
      >
        {isError ? <AlertIcon size={16} strokeWidth={2.5} /> : <CheckIcon size={16} strokeWidth={2.5} />}
      </span>
      <span>{children}</span>
    </div>
  )
}
