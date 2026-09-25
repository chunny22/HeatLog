import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { computeMuscleVolume, normalizeVolumes } from '../../utils/muscleVolume'
import { BodyMapFront } from './BodyMapFront'

it('renders separate chest regions with distinct incline-press intensity and labels', () => {
  const raw = computeMuscleVolume([{
    id: 'incline', date: '2026-09-25', status: 'completed',
    entries: [{ exerciseId: 'incline-bench-press', sets: [{ reps: 5, weight: 100, unit: 'lb' }] }],
  }])
  const markup = renderToStaticMarkup(<BodyMapFront raw={raw} normalized={normalizeVolumes(raw)} />)
  const regions = [...markup.matchAll(/<rect\b[^>]*style="([^"]+)"[^>]*><title>([^<]+)<\/title><\/rect>/g)]
  const upper = regions.find((region) => region[2].startsWith('Upper Chest:'))
  const mid = regions.find((region) => region[2].startsWith('Mid Chest:'))
  const lower = regions.find((region) => region[2].startsWith('Lower Chest:'))
  expect(upper?.[2]).toBe('Upper Chest: 500 vol')
  expect(mid?.[2]).toBe('Mid Chest: 250 vol')
  expect(lower?.[2]).toBe('Lower Chest: 250 vol')
  expect(upper?.[1]).not.toBe(mid?.[1])
  expect(upper?.[1]).not.toBe(lower?.[1])
})
