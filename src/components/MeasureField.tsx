import { SlidingSegmented } from './SlidingSegmented'
import { labelClass } from './ui'

// A number field with a small unit toggle (lb/kg, in/cm) inside it.
export function MeasureField<U extends string>({
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
        <SlidingSegmented
          kind="buttons"
          ariaLabel={`${label} unit`}
          options={units.map((u) => ({ value: u, label: u }))}
          value={unit}
          onChange={onUnitChange}
          trackClassName="bg-track p-[3px]"
          optionClassName="h-8 w-[38px] text-[13px] font-bold"
        />
      </span>
    </label>
  )
}
