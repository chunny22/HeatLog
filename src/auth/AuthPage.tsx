import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { GOALS } from '../data/goals'
import type { FitnessGoal, HeightUnit, WeightUnit } from '../types'
import { useAuth } from './AuthContext'

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-gray-900">
          {mode === 'sign-in' ? 'Sign in' : 'Create account'}
        </h1>
        <p className="mb-6 text-sm text-gray-500">Track your workouts from any device.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-indigo-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-indigo-500"
            />
          </label>

          {mode === 'sign-up' && (
            <>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Name
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-indigo-500"
                />
              </label>

              <div className="flex gap-2">
                <label className="flex flex-1 flex-col gap-1 text-sm text-gray-700">
                  Weight
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-indigo-500"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Unit
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500"
                  >
                    <option value="lb">lb</option>
                    <option value="kg">kg</option>
                  </select>
                </label>
              </div>

              <div className="flex gap-2">
                <label className="flex flex-1 flex-col gap-1 text-sm text-gray-700">
                  Height
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-indigo-500"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Unit
                  <select
                    value={heightUnit}
                    onChange={(e) => setHeightUnit(e.target.value as HeightUnit)}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500"
                  >
                    <option value="in">in</option>
                    <option value="cm">cm</option>
                  </select>
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-700">Goals (select all that apply)</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {GOALS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      title={option.description}
                      onClick={() =>
                        setGoals((prev) =>
                          prev.includes(option.id) ? prev.filter((g) => g !== option.id) : [...prev, option.id],
                        )
                      }
                      className={`rounded-lg border px-2 py-2 text-left text-xs font-medium transition-colors ${
                        goals.includes(option.id)
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {mode === 'sign-in' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
            setError(null)
            setMessage(null)
          }}
          className="mt-4 text-sm text-indigo-600 hover:underline"
        >
          {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
