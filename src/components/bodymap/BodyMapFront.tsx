import type { MuscleGroup } from '../../types'
import { BodySilhouette } from './BodySilhouette'
import { MuscleRegion, type RegionShape } from './MuscleRegion'

const REGIONS: RegionShape[] = [
  { muscle: 'front_delts', x: 56, y: 58, width: 18, height: 18 },
  { muscle: 'front_delts', x: 126, y: 58, width: 18, height: 18 },
  { muscle: 'side_delts', x: 40, y: 60, width: 14, height: 20 },
  { muscle: 'side_delts', x: 146, y: 60, width: 14, height: 20 },
  { muscle: 'upper_chest', x: 75, y: 60, width: 50, height: 10, rx: 3 },
  { muscle: 'mid_chest', x: 75, y: 72, width: 50, height: 10, rx: 3 },
  { muscle: 'lower_chest', x: 75, y: 84, width: 50, height: 10, rx: 3 },
  { muscle: 'biceps', x: 42, y: 82, width: 18, height: 38 },
  { muscle: 'biceps', x: 140, y: 82, width: 18, height: 38 },
  { muscle: 'forearms', x: 40, y: 122, width: 18, height: 44 },
  { muscle: 'forearms', x: 142, y: 122, width: 18, height: 44 },
  { muscle: 'abs', x: 80, y: 96, width: 40, height: 46, rx: 6 },
  { muscle: 'obliques', x: 70, y: 98, width: 10, height: 46 },
  { muscle: 'obliques', x: 120, y: 98, width: 10, height: 46 },
  { muscle: 'quads', x: 76, y: 176, width: 20, height: 70 },
  { muscle: 'quads', x: 104, y: 176, width: 20, height: 70 },
]

interface BodyMapFrontProps {
  normalized: Record<MuscleGroup, number>
  raw: Record<MuscleGroup, number>
}

export function BodyMapFront({ normalized, raw }: BodyMapFrontProps) {
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
