import { useEffect, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { CheckIcon } from '../components/icons'
import { MeasureField } from '../components/MeasureField'
import {
  btnPrimaryClass,
  cardClass,
  cardTitleClass,
  chipClass,
  fieldClass,
  labelClass,
  pageClass,
  pageTitleClass,
} from '../components/ui'
import { GOALS } from '../data/goals'
import { useProfile } from '../hooks/useProfile'
import { saveWeightLog } from '../hooks/useWeightLogs'
import type { FitnessGoal, HeightUnit, WeightUnit } from '../types'
import { todayISO } from '../utils/date'

type Feedback = { tone: 'error' | 'success'; text: string } | null

export function ProfilePage() {
  const { profile, loading, error, updateProfile } = useProfile()
  const { hash } = useLocation()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lb')
  const [height, setHeight] = useState('')
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('in')
  const [goals, setGoals] = useState<FitnessGoal[]>([])
  const [detailsFeedback, setDetailsFeedback] = useState<Feedback>(null)
  const [goalsFeedback, setGoalsFeedback] = useState<Feedback>(null)
  const [savingDetails, setSavingDetails] = useState(false)
  const [savingGoals, setSavingGoals] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Fill the form once, when the profile first arrives.
  useEffect(() => {
    if (!profile || hydrated) return
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setWeight(String(profile.weight))
    setWeightUnit(profile.weightUnit)
    setHeight(String(profile.height))
    setHeightUnit(profile.heightUnit)
    setGoals(profile.goals)
    setHydrated(true)
  }, [profile, hydrated])

  useEffect(() => {
    if (hash === '#goals' && hydrated) {
      document.getElementById('goals')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [hash, hydrated])

  const saveDetails = async (e: FormEvent) => {
    e.preventDefault()
    setDetailsFeedback(null)
    setSavingDetails(true)
    const err = await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      weight: Number(weight),
      weightUnit,
      height: Number(height),
      heightUnit,
    })
    if (!err && profile && (profile.weight !== Number(weight) || profile.weightUnit !== weightUnit)) {
      await saveWeightLog(todayISO(), Number(weight), weightUnit)
    }
    setDetailsFeedback(err ? { tone: 'error', text: err } : { tone: 'success', text: 'Profile updated.' })
    setSavingDetails(false)
  }

  const saveGoals = async (e: FormEvent) => {
    e.preventDefault()
    setGoalsFeedback(null)
    if (goals.length === 0) {
      setGoalsFeedback({ tone: 'error', text: 'Please select at least one goal.' })
      return
    }
    setSavingGoals(true)
    const err = await updateProfile({ goals })
    setGoalsFeedback(err ? { tone: 'error', text: err } : { tone: 'success', text: 'Goals updated.' })
    setSavingGoals(false)
  }

  return (
    <div className={pageClass}>
      <div className="flex flex-col gap-1.5">
        <h1 className={pageTitleClass}>Profile</h1>
        <p className="text-[15px] text-ink-3">Update your details and what you're training for.</p>
      </div>

      {loading && !profile && <p className="text-sm text-muted">Loading…</p>}
      {error && <Alert tone="error">{error}</Alert>}

      {profile && (
        <>
          <form onSubmit={saveDetails} className={`${cardClass} flex flex-col gap-4`}>
            <h2 className={cardTitleClass}>Personal details</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            {detailsFeedback && <Alert tone={detailsFeedback.tone}>{detailsFeedback.text}</Alert>}
            <button type="submit" disabled={savingDetails} className={`${btnPrimaryClass} self-start`}>
              {savingDetails ? 'Saving…' : 'Save changes'}
            </button>
          </form>

          <form id="goals" onSubmit={saveGoals} className={`${cardClass} flex scroll-mt-28 flex-col gap-4`}>
            <div className="flex flex-col gap-1">
              <h2 className={cardTitleClass}>Workout goals</h2>
              <p className="text-[13px] text-ink-3">Pick all that apply. Your AI coach uses these.</p>
            </div>
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
            {goalsFeedback && <Alert tone={goalsFeedback.tone}>{goalsFeedback.text}</Alert>}
            <button type="submit" disabled={savingGoals} className={`${btnPrimaryClass} self-start`}>
              {savingGoals ? 'Saving…' : 'Save goals'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
