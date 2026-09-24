import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { MeasureField } from '../components/MeasureField'
import { PasswordField } from '../components/PasswordField'
import { ArrowLeftIcon, CheckIcon, DumbbellIcon } from '../components/icons'
import { btnPrimaryClass, chipClass, fieldClass, labelClass, segmentClass, segmentedClass } from '../components/ui'
import { GOALS } from '../data/goals'
import type { FitnessGoal, HeightUnit, WeightUnit } from '../types'
import { useAuth } from './AuthContext'

// How long the fields stay dimmed before swapping, and how long the card
// then takes to resize to its new height -- kept in sync with the CSS
// transition durations below so the dim, swap and resize all land together.
const SWAP_DELAY_MS = 150
const RESIZE_MS = 300

type Mode = 'sign-in' | 'sign-up' | 'reset'

const HEADINGS: Record<Mode, { title: string; subtitle: string }> = {
  'sign-in': { title: 'Welcome back', subtitle: 'Track your workouts from any device.' },
  'sign-up': { title: 'Create account', subtitle: 'Track your workouts from any device.' },
  reset: { title: 'Reset password', subtitle: "Enter your email and we'll send you a link to choose a new one." },
}

export function AuthPage() {
  const { session, signIn, signUp, resetPassword } = useAuth()

  // `activeTab` reflects the clicked tab instantly. `mode` is what's actually
  // rendered (title, fields, submit label) and lags behind it by
  // SWAP_DELAY_MS, so the field swap happens once the fields have faded out
  // rather than popping while still visible.
  const [activeTab, setActiveTab] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [mode, setMode] = useState<Mode>('sign-in')
  const [dimmed, setDimmed] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lb')
  const [height, setHeight] = useState('')
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('in')
  const [goals, setGoals] = useState<FitnessGoal[]>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [emailTaken, setEmailTaken] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)
  const pendingResizeRef = useRef(false)
  const timersRef = useRef<number[]>([])

  useLayoutEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach(clearTimeout)
    }
  }, [])

  // Runs once the fields underneath have actually swapped: measure the
  // card's new natural height and animate to it, then undim partway through
  // so the reveal feels responsive rather than waiting out the full resize.
  useLayoutEffect(() => {
    if (!pendingResizeRef.current) return
    const card = cardRef.current
    if (!card) return

    // scrollHeight can't be used here: it never reports less than the box's own
    // (still locked) height, so shrinking would measure as "no change". Briefly
    // release the height to read the true content height, then restore it.
    const startHeight = card.getBoundingClientRect().height
    card.style.height = 'auto'
    const targetHeight = card.getBoundingClientRect().height
    card.style.height = `${startHeight}px`
    void card.offsetHeight

    const raf = requestAnimationFrame(() => {
      card.style.height = `${targetHeight}px`

      const undim = window.setTimeout(() => setDimmed(false), SWAP_DELAY_MS)
      const settle = window.setTimeout(() => {
        if (cardRef.current) cardRef.current.style.height = 'auto'
        pendingResizeRef.current = false
      }, RESIZE_MS)
      timersRef.current.push(undim, settle)
    })

    return () => cancelAnimationFrame(raf)
  }, [mode])

  if (session) {
    return <Navigate to="/" replace />
  }

  const switchMode = (next: Mode) => {
    if (next === mode || pendingResizeRef.current) return

    if (next !== 'reset') setActiveTab(next)
    setError(null)
    setMessage(null)
    setEmailTaken(false)

    const card = cardRef.current
    if (card) {
      card.style.height = `${card.getBoundingClientRect().height}px`
    }
    pendingResizeRef.current = true
    setDimmed(true)

    const swap = window.setTimeout(() => setMode(next), SWAP_DELAY_MS)
    timersRef.current.push(swap)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setEmailTaken(false)

    if (mode === 'sign-up' && goals.length === 0) {
      setError('Please select at least one goal.')
      return
    }

    setSubmitting(true)

    const result =
      mode === 'reset'
        ? await resetPassword(email)
        : mode === 'sign-in'
          ? await signIn(email, password)
          : await signUp(email, password, {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            weight: Number(weight),
            weightUnit,
            height: Number(height),
            heightUnit,
            goals,
          })

    if (result.emailTaken) {
      setEmailTaken(true)
    } else if (result.error) {
      setError(result.error)
    } else if (mode === 'sign-up') {
      setMessage('Account created. Check your email to confirm, then sign in.')
    } else if (mode === 'reset') {
      setMessage('If an account exists for that email, a reset link is on its way. Check your inbox.')
    }
    setSubmitting(false)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-page px-4 py-12">
      <div
        ref={cardRef}
        className="flex w-full max-w-[480px] flex-col gap-6 overflow-hidden rounded-[32px] bg-surface p-6 shadow-card transition-[height] duration-300 ease-out sm:p-9"
      >
        <div className="flex flex-col items-center gap-3.5 text-center">
          <span className="flex size-[60px] items-center justify-center rounded-full bg-accent text-white">
            <DumbbellIcon size={26} />
          </span>
          <div>
            <h1 className="mb-1.5 text-[26px] font-extrabold tracking-tight text-ink">
              {HEADINGS[mode].title}
            </h1>
            <p className="text-sm text-ink-3">{HEADINGS[mode].subtitle}</p>
          </div>
        </div>

        {mode !== 'reset' && (
        <div role="tablist" aria-label="Account" className={segmentedClass}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sign-in'}
            onClick={() => switchMode('sign-in')}
            className={`${segmentClass(activeTab === 'sign-in')} h-11`}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sign-up'}
            onClick={() => switchMode('sign-up')}
            className={`${segmentClass(activeTab === 'sign-up')} h-11`}
          >
            Create account
          </button>
        </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div
            className={`flex flex-col gap-3.5 transition-opacity duration-150 ease-out ${
              dimmed ? 'pointer-events-none opacity-40' : 'opacity-100'
            }`}
          >
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
            {mode !== 'reset' && (
              <PasswordField
                label="Password"
                minLength={6}
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                value={password}
                onChange={setPassword}
              />
            )}

            {mode === 'sign-in' && (
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="-mt-3 -mb-1.5 self-end py-2.5 text-[13px] font-bold text-accent transition-colors hover:text-accent-hover"
              >
                Forgot password?
              </button>
            )}

            {mode === 'sign-up' && (
              <div className="flex animate-auth-extra-in flex-col gap-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <label className={labelClass}>
                    First name
                    <input
                      type="text"
                      required
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={fieldClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Last name
                    <input
                      type="text"
                      required
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={fieldClass}
                    />
                  </label>
                </div>

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
              </div>
            )}
          </div>

          {emailTaken && (
            <Alert tone="error">
              An account with this email already exists.
              <span className="mt-1.5 flex gap-4 text-[13px] font-extrabold">
                <button type="button" onClick={() => switchMode('sign-in')} className="underline underline-offset-4">
                  Sign in instead
                </button>
                <button type="button" onClick={() => switchMode('reset')} className="underline underline-offset-4">
                  Reset password
                </button>
              </span>
            </Alert>
          )}
          {error && <Alert tone="error">{error}</Alert>}
          {message && <Alert tone="success">{message}</Alert>}

          <button type="submit" disabled={submitting} className={`${btnPrimaryClass} mt-2.5 h-[54px] text-base`}>
            {mode === 'sign-in' ? 'Sign in' : mode === 'sign-up' ? 'Create account' : 'Send reset link'}
          </button>
          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => switchMode('sign-in')}
              className="flex items-center justify-center gap-1.5 self-center text-[13px] font-bold text-ink-3 transition-colors hover:text-ink"
            >
              <ArrowLeftIcon size={14} />
              Back to sign in
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
