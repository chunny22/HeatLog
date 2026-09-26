import type { CardioInterval, CardioLog, DistanceUnit } from '../../types'
import { copyCardioInterval, COUNT_LABELS } from '../../utils/cardio'
import { ChevronDownIcon, PlusIcon, XIcon } from '../icons'
import { btnSoftSmClass, fieldClass, iconBtnSmClass, labelClass } from '../ui'

interface CardioFormProps {
  value: CardioLog
  showIntensity: boolean
  onChange: (value: CardioLog) => void
}

export function CardioForm({ value, showIntensity, onChange }: CardioFormProps) {
  const update = (index: number, patch: Partial<CardioInterval>) => onChange({
    ...value, intervals: value.intervals.map((interval, i) => i === index ? { ...interval, ...patch } : interval),
  })
  return (
    <div className="flex flex-col gap-3">
      {value.intervals.map((interval, index) => (
        <fieldset key={index} className="min-w-0 rounded-panel border border-line p-3 sm:p-4">
          <legend className="px-1 text-xs font-bold text-ink-3">Interval {index + 1}</legend>
          <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-4">
            <label className={labelClass}>
              Duration (min)
              <input type="number" min={0} step="any" value={interval.durationMinutes || ''}
                aria-label={`Interval ${index + 1} duration in minutes`} placeholder="Minutes" className={fieldClass}
                onChange={(e) => update(index, { durationMinutes: Number(e.target.value) })} />
            </label>
            {value.tracking === 'distance' ? (
              <>
                <label className={labelClass}>
                  Distance (optional)
                  <input type="number" min={0} step="any" value={interval.distance ?? ''}
                    aria-label={`Interval ${index + 1} distance`} placeholder="Distance" className={fieldClass}
                    onChange={(e) => update(index, { distance: e.target.value === '' ? undefined : Number(e.target.value) })} />
                </label>
                <label className={labelClass}>
                  Unit
                  <span className="relative block h-12">
                    <select value={interval.distanceUnit ?? 'km'} aria-label={`Interval ${index + 1} distance unit`}
                      className={`${fieldClass.replace('px-4', 'pl-4 pr-9')} appearance-none text-left [text-align-last:left]`}
                      onChange={(e) => update(index, { distanceUnit: e.target.value as DistanceUnit })}>
                      <option value="km">km</option><option value="mi">mi</option><option value="m">m</option>
                    </select>
                    <ChevronDownIcon size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-3" />
                  </span>
                </label>
              </>
            ) : (
              <label className={labelClass}>
                {COUNT_LABELS[value.tracking]}
                <input type="number" min={0} step={1} value={interval.count ?? ''}
                  aria-label={`Interval ${index + 1} ${value.tracking}`} placeholder={COUNT_LABELS[value.tracking]}
                  className={fieldClass} onChange={(e) => update(index, { count: e.target.value === '' ? undefined : Number(e.target.value) })} />
              </label>
            )}
            {showIntensity && (
              <label className={labelClass}>
                RPE (1–10)
                <input type="number" min={1} max={10} step={1} value={interval.intensity || ''}
                  aria-label={`Interval ${index + 1} RPE (1-10)`} placeholder="RPE" className={fieldClass}
                  onChange={(e) => update(index, { intensity: e.target.value === '' ? undefined : Math.min(10, Math.max(1, Math.round(Number(e.target.value)))) })} />
              </label>
            )}
            <button type="button" className={iconBtnSmClass} aria-label={`Remove interval ${index + 1}`}
              onClick={() => onChange({ ...value, intervals: value.intervals.filter((_, i) => i !== index) })}>
              <XIcon size={15} />
            </button>
          </div>
        </fieldset>
      ))}
      <button type="button" className={`${btnSoftSmClass} self-start pl-3`} onClick={() => onChange({
        ...value, intervals: [...value.intervals, copyCardioInterval(value.intervals.at(-1) ?? { durationMinutes: 0, distanceUnit: 'km' })],
      })}>
        <PlusIcon size={16} /> Add interval
      </button>
    </div>
  )
}
