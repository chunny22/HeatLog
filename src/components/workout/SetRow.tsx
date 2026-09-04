import type { SetEntry } from '../../types'

interface SetRowProps {
  index: number
  set: SetEntry
  showIntensity: boolean
  onChange: (set: SetEntry) => void
  onRemove: () => void
}

const inputClass =
  'rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-indigo-500'

export function SetRow({ index, set, showIntensity, onChange, onRemove }: SetRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-5 shrink-0 text-xs text-gray-400">#{index + 1}</span>
      <input
        type="number"
        min={0}
        value={set.reps || ''}
        onChange={(e) => onChange({ ...set, reps: Number(e.target.value) })}
        placeholder="Reps"
        className={`w-16 ${inputClass}`}
      />
      <input
        type="number"
        min={0}
        value={set.weight || ''}
        onChange={(e) => onChange({ ...set, weight: Number(e.target.value) })}
        placeholder="Weight"
        className={`w-20 ${inputClass}`}
      />
      <select
        value={set.unit}
        onChange={(e) => onChange({ ...set, unit: e.target.value as SetEntry['unit'] })}
        className={`px-1.5 ${inputClass}`}
      >
        <option value="lb">lb</option>
        <option value="kg">kg</option>
      </select>
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
          className={`w-16 ${inputClass}`}
        />
      )}
      <button onClick={onRemove} className="ml-auto text-xs text-red-500 hover:underline">
        Remove
      </button>
    </div>
  )
}
