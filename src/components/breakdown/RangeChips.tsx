import { RANGE_OPTIONS, type Range } from '../../utils/range'
import { SlidingSegmented } from '../SlidingSegmented'

export function RangeChips({ value, onChange }: { value: Range; onChange: (range: Range) => void }) {
  return (
    <SlidingSegmented
      kind="buttons"
      ariaLabel="Time range"
      options={RANGE_OPTIONS}
      value={value}
      onChange={onChange}
      optionClassName="h-8 px-3.5 text-xs font-bold"
    />
  )
}

export function StatBox({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: 'good' }) {
  return (
    <div className="flex flex-col gap-1 rounded-panel bg-inset px-4 py-3.5">
      <span className="text-xs font-bold text-muted">{label}</span>
      <span className="text-[22px] leading-tight font-extrabold tracking-tight text-ink">{value}</span>
      {note && <span className={`text-xs font-bold ${tone === 'good' ? 'text-success-ink' : 'text-muted'}`}>{note}</span>}
    </div>
  )
}
