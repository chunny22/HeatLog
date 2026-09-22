import type { DayVolume } from '../../utils/dailyActivity'

interface ActivityStatTileProps {
  label: string
  day: DayVolume | null
  accent: 'indigo' | 'gray'
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function ActivityStatTile({ label, day, accent }: ActivityStatTileProps) {
  return (
    <div className="flex aspect-[4/3] flex-col justify-between rounded-xl border border-gray-200 bg-white p-4">
      <span className={`text-xs font-medium ${accent === 'indigo' ? 'text-indigo-600' : 'text-gray-500'}`}>
        {label}
      </span>
      {day ? (
        <div>
          <p className="text-2xl font-semibold text-gray-900">{Math.round(day.volume).toLocaleString()}</p>
          <p className="text-xs text-gray-400">vol on {formatDate(day.date)}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-400">No workouts yet</p>
      )}
    </div>
  )
}
