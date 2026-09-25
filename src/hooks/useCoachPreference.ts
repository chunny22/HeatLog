import { useCallback, useState } from 'react'

const KEY = 'heatlog.coachHidden'

function readHidden(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

// Whether the user has hidden the AI Coach. Saved on this device only (it doesn't
// follow the account), and falls back to "shown" if storage isn't available.
export function useCoachPreference() {
  const [hidden, setHiddenState] = useState(readHidden)

  const setHidden = useCallback((next: boolean) => {
    setHiddenState(next)
    try {
      if (next) localStorage.setItem(KEY, '1')
      else localStorage.removeItem(KEY)
    } catch {
      // Private mode etc.: still works for this visit.
    }
  }, [])

  return { hidden, hide: useCallback(() => setHidden(true), [setHidden]), show: useCallback(() => setHidden(false), [setHidden]) }
}
