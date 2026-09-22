import type { SetEntry } from '../../types'
import { ChevronDownIcon, XIcon } from '../icons'
import { iconBtnSmClass } from '../ui'

interface SetRowProps {
  index: number
  set: SetEntry
  showIntensity: boolean
  onChange: (set: SetEntry) => void
  onRemove: () => void
}

const inputClass =
  'h-11 rounded-[14px] bg-inset text-[15px] font-semibold text-ink outline-none transition-shadow placeholder:font-normal placeholder:text-muted focus:bg-surface focus:ring-2 focus:ring-accent px-2.5 sm:px-3.5'

// Column widths, shared by the header row and every set row so they line up.
const col = {
  num: 'hidden size-9 shrink-0 sm:flex',
  reps: 'min-w-0 flex-1 sm:max-w-24',
  weight: 'min-w-0 flex-1 sm:max-w-[110px]',
  unit: 'w-[60px] shrink-0 sm:w-[76px]',
  rpe: 'min-w-0 flex-1 sm:max-w-[90px]',
}

export function SetRowHeader({ showIntensity }: { showIntensity: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-1.5 text-xs font-bold tracking-[0.06em] text-muted uppercase sm:gap-2.5"
    >
      <span className={col.num} />
      <span className={col.reps}>Reps</span>
      <span className={col.weight}>Weight</span>
      <span className={col.unit}>Unit</span>
      {showIntensity && <span className={col.rpe}>RPE</span>}
      <span className="size-9 shrink-0" />
    </div>
  )
}

export function SetRow({ index, set, showIntensity, onChange, onRemove }: SetRowProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5">
      <span
        className={`${col.num} items-center justify-center rounded-full bg-accent-soft text-[13px] font-extrabold text-accent-ink`}
      >
        {index + 1}
      </span>
      <input
        type="number"
        min={0}
        value={set.reps || ''}
        onChange={(e) => onChange({ ...set, reps: Number(e.target.value) })}
        placeholder="Reps"
        aria-label={`Set ${index + 1} reps`}
        className={`${col.reps} ${inputClass}`}
      />
      <input
        type="number"
        min={0}
        value={set.weight || ''}
        onChange={(e) => onChange({ ...set, weight: Number(e.target.value) })}
        placeholder="Weight"
        aria-label={`Set ${index + 1} weight`}
        className={`${col.weight} ${inputClass}`}
      />
      <div className={`${col.unit} relative`}>
        <select
          value={set.unit}
          onChange={(e) => onChange({ ...set, unit: e.target.value as SetEntry['unit'] })}
          aria-label={`Set ${index + 1} unit`}
          className={`w-full appearance-none pr-7 ${inputClass}`}
        >
          <option value="lb">lb</option>
          <option value="kg">kg</option>
        </select>
        <ChevronDownIcon
          size={14}
          className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-3"
        />
      </div>
      {showIntensity && (
        <input
          type="number"
          min={1}
          max={10}
          value={set.intensity || ''}
          onChange={(e) => {
            const raw = Math.round(Number(e.target.value)) || 0
            const intensity = raw === 0 ? 0 : Math.min(10, Math.max(1, raw))
            onChange({ ...set, intensity })
          }}
          placeholder="RPE"
          title="RPE (1-10)"
          aria-label={`Set ${index + 1} RPE (1-10)`}
          className={`${col.rpe} ${inputClass}`}
        />
      )}
      <button onClick={onRemove} aria-label={`Remove set ${index + 1}`} title="Remove set" className={iconBtnSmClass}>
        <XIcon size={15} />
      </button>
    </div>
  )
}
