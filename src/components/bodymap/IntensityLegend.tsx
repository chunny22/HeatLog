import { muscleColor } from '../../utils/colorScale'

export function IntensityLegend() {
  const steps = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span>Less</span>
      <div className="flex overflow-hidden rounded">
        {steps.map((step) => (
          <div key={step} className="h-3 w-6" style={{ backgroundColor: muscleColor(step) }} />
        ))}
      </div>
      <span>More</span>
      <span className="ml-2 flex items-center gap-1">
        <span className="h-3 w-3 rounded bg-gray-200" /> No data
      </span>
    </div>
  )
}
