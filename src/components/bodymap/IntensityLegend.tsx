import { muscleColor } from '../../utils/colorScale'

export function IntensityLegend() {
  const steps = [0.001, 0.25, 0.5, 0.75, 1]

  return (
    <div className="flex items-center gap-2 rounded-full bg-inset px-3 py-1.5 text-xs font-semibold text-ink-3">
      <span>Less</span>
      <div className="flex gap-[3px]">
        {steps.map((step) => (
          <span key={step} className="size-3.5 rounded-full" style={{ backgroundColor: muscleColor(step) }} />
        ))}
      </div>
      <span>More</span>
      <span className="h-3.5 w-px bg-line" />
      <span className="flex items-center gap-1.5">
        <span className="size-3.5 rounded-full" style={{ backgroundColor: muscleColor(0) }} /> No data
      </span>
    </div>
  )
}
