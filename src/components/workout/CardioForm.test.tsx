import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { newCardioLog } from '../../utils/cardio'
import { CardioForm } from './CardioForm'

it.each([
  ['treadmill-run', 'distance'], ['cycling', 'distance'], ['rowing-machine', 'distance'], ['elliptical', 'distance'],
  ['stair-climber', 'steps'], ['jump-rope', 'jumps'], ['burpees', 'reps'], ['mountain-climbers', 'reps'],
])('renders appropriate inputs for %s without weight controls', (id, measurement) => {
  const html = renderToStaticMarkup(<CardioForm value={newCardioLog(id, 'kg')} showIntensity onChange={() => {}} />)
  expect(html).toContain('Interval 1 duration in minutes')
  expect(html).toContain(`Interval 1 ${measurement}`)
  expect(html).toContain('Interval 1 RPE (1-10)')
  expect(html).not.toContain('>Weight<')
  expect(html).not.toContain('value="lb"')
  expect(html).not.toContain('value="kg"')
  if (measurement !== 'reps') expect(html).not.toContain('>Reps<')
})

it('hides effort while planning cardio', () => {
  const html = renderToStaticMarkup(<CardioForm value={newCardioLog('cycling', 'kg')} showIntensity={false} onChange={() => {}} />)
  expect(html).not.toContain('RPE')
})
