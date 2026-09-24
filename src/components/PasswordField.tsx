import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from './icons'
import { fieldClass, labelClass } from './ui'

interface PasswordFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: 'current-password' | 'new-password'
  minLength?: number
}

// A password input with a button to reveal what was typed, so people can check
// it before signing in or creating an account. Always starts hidden.
export function PasswordField({ label, value, onChange, autoComplete, minLength }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <label className={labelClass}>
      {label}
      <span className="relative block">
        <input
          type={visible ? 'text' : 'password'}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} pr-12`}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          title={visible ? 'Hide password' : 'Show password'}
          // Keep focus (and the keyboard) in the input when tapping the eye.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-3 transition-colors hover:text-ink"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </span>
    </label>
  )
}
