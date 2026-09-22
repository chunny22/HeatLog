import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { CheckIcon, DumbbellIcon } from '../components/icons'
import { btnPrimaryClass, chipClass, fieldClass, labelClass, segmentClass, segmentedClass } from '../components/ui'
import { GOALS } from '../data/goals'
import type { FitnessGoal, HeightUnit, WeightUnit } from '../types'
import { useAuth } from './AuthContext'

// A number field with a small unit toggle (lb/kg, in/cm) inside it.
function MeasureField<U extends string>({
  label,
  value,
  onValueChange,
  unit,
  units,
  onUnitChange,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  unit: U
  units: U[]
  onUnitChange: (unit: U) => void
}) {
  return (
    <label className={labelClass}>
      {label}
      <span className="flex h-12 items-center gap-2 rounded-field bg-inset pr-[5px] pl-4 transition-shadow focus-within:bg-surface focus-within:ring-2 focus-within:ring-accent">
        <input
          type="number"
          required
          min={0}
          step="0.1"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="w-0 min-w-0 flex-1 bg-transparent text-[15px] font-medium text-ink outline-none"
        />
        <span role="group" aria-label={`${label} unit`} className="flex rounded-full bg-track p-[3px]">
          {units.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => onUnitChange(u)}
              aria-pressed={unit === u}
              className={`h-8 w-[38px] rounded-full text-[13px] font-bold transition-colors ${
                unit === u ? 'bg-selected text-ink shadow-raised' : 'text-ink-3 hover:text-ink'
              }`}
            >
              {u}
            </button>
          ))}
        </span>
      </span>
    </label>
  )
}

export function AuthPage() {
  const { session, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lb')
  const [height, setHeight] = useState('')
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('in')
  const [goals, setGoals] = useState<FitnessGoal[]>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (session) {
    return <Navigate to="/" replace />
  }

  const switchMode = (next: 'sign-in' | 'sign-up') => {
    setMode(next)
    setError(null)
    setMessage(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (mode === 'sign-up' && goals.length === 0) {
      setError('Please select at least one goal.')
      return
    }

    setSubmitting(true)

    const result =
      mode === 'sign-in'
        ? await signIn(email, password)
        : await signUp(email, password, {
            fullName,
            weight: Number(weight),
            weightUnit,
            height: Number(height),
            heightUnit,
            goals,
          })

    if (result.error) {
      setError(result.error)
    } else if (mode === 'sign-up') {
      setMessage('Account created. Check your email to confirm, then sign in.')
    }
    setSubmitting(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4 py-12">
      <div
        className={`flex w-full flex-col gap-6 rounded-[32px] bg-surface p-6 shadow-card sm:p-9 ${
          mode === 'sign-up' ? 'max-w-[480px]' : 'max-w-[420px]'
        }`}
      >
        <div className="flex flex-col items-center gap-3.5 text-center">
          <span className="flex size-[60px] items-center justify-center rounded-full bg-accent text-white">
            <DumbbellIcon size={26} />
          </span>
          <div>
            <h1 className="mb-1.5 text-[26px] font-extrabold tracking-tight text-ink">
              {mode === 'sign-in' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-sm text-ink-3">Track your workouts from any device.</p>
          </div>
        </div>

        <div role="tablist" aria-label="Account" className={segmentedClass}>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'sign-in'}
            onClick={() => switchMode('sign-in')}
            className={`${segmentClass(mode === 'sign-in')} h-11`}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'sign-up'}
            onClick={() => switchMode('sign-up')}
            className={`${segmentClass(mode === 'sign-up')} h-11`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <label className={labelClass}>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Password
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
            />
          </label>

          {mode === 'sign-up' && (
            <>
              <label className={labelClass}>
                Name
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={fieldClass}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <MeasureField
                  label="Weight"
                  value={weight}
                  onValueChange={setWeight}
                  unit={weightUnit}
                  units={['lb', 'kg']}
                  onUnitChange={setWeightUnit}
                />
                <MeasureField
                  label="Height"
                  value={height}
                  onValueChange={setHeight}
                  unit={heightUnit}
                  units={['in', 'cm']}
                  onUnitChange={setHeightUnit}
                />
              </div>

              <fieldset className="mt-2.5 flex flex-col gap-2.5">
                <legend className="mb-2.5 text-[13px] font-bold text-ink-2">
                  Your goals <span className="font-medium text-ink-3">· pick all that apply</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((option) => {
                    const selected = goals.includes(option.id)
                    return (
                      <button
                        key={option.id}
                        type="button"
                        title={option.description}
                        aria-pressed={selected}
                        onClick={() =>
                          setGoals((prev) =>
                            prev.includes(option.id) ? prev.filter((g) => g !== option.id) : [...prev, option.id],
                          )
                        }
                        className={`${chipClass(selected)} ${selected ? 'pl-3' : ''}`}
                      >
                        {selected && <CheckIcon size={15} strokeWidth={2.5} />}
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            </>
          )}

          {error && <Alert tone="error">{error}</Alert>}
          {message && <Alert tone="success">{message}</Alert>}

          <button type="submit" disabled={submitting} className={`${btnPrimaryClass} mt-2.5 h-[54px] text-base`}>
            {mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
