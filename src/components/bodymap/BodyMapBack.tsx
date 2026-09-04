import type { MuscleGroup } from '../../types'
import { BodySilhouette } from './BodySilhouette'
import { MuscleRegion, type RegionShape } from './MuscleRegion'

const REGIONS: RegionShape[] = [
  { muscle: 'rear_delts', x: 56, y: 58, width: 18, height: 18 },
  { muscle: 'rear_delts', x: 126, y: 58, width: 18, height: 18 },
  { muscle: 'traps', x: 78, y: 58, width: 44, height: 24, rx: 8 },
  { muscle: 'upper_back', x: 75, y: 84, width: 50, height: 34, rx: 8 },
  { muscle: 'lats', x: 66, y: 86, width: 12, height: 50 },
  { muscle: 'lats', x: 122, y: 86, width: 12, height: 50 },
  { muscle: 'lower_back', x: 82, y: 122, width: 36, height: 24, rx: 6 },
  { muscle: 'triceps', x: 42, y: 82, width: 18, height: 38 },
  { muscle: 'triceps', x: 140, y: 82, width: 18, height: 38 },
  { muscle: 'glutes', x: 78, y: 172, width: 44, height: 30, rx: 10 },
  { muscle: 'hamstrings', x: 76, y: 204, width: 20, height: 44 },
  { muscle: 'hamstrings', x: 104, y: 204, width: 20, height: 44 },
  { muscle: 'calves', x: 76, y: 252, width: 20, height: 44 },
  { muscle: 'calves', x: 104, y: 252, width: 20, height: 44 },
]

interface BodyMapBackProps {
  normalized: Record<MuscleGroup, number>
  raw: Record<MuscleGroup, number>
}

export function BodyMapBack({ normalized, raw }: BodyMapBackProps) {
  return (
    <svg viewBox="0 0 200 320" className="w-full max-w-[220px]">
      <BodySilhouette />
      {REGIONS.map((shape, i) => (
        <MuscleRegion
          key={i}
          shape={shape}
          normalizedVolume={normalized[shape.muscle] ?? 0}
          rawVolume={raw[shape.muscle] ?? 0}
        />
      ))}
    </svg>
  )
}
