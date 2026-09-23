import { Link } from 'react-router-dom'
import type { DayVolume } from '../../utils/dailyActivity'
import { ArrowRightIcon } from '../icons'

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
  const highlight = accent === 'indigo'

  const badgeClass = `flex size-10 shrink-0 items-center justify-center rounded-full transition-colors ${
    highlight ? 'bg-white/20' : 'bg-sunken text-ink-3'
  }`

  return (
    <div
      className={`flex min-h-[168px] flex-col justify-between rounded-card p-5 sm:min-h-[190px] sm:p-6 ${
        highlight ? 'bg-accent text-white shadow-[0_8px_24px_rgb(24_24_27/0.12)]' : 'bg-surface text-ink shadow-card'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-sm font-bold ${highlight ? '' : 'text-ink-2'}`}>{label}</span>
        {day ? (
          <Link
            to={`/day/${day.date}`}
            aria-label={`${label}: view ${formatDate(day.date)}`}
            className={`${badgeClass} ${highlight ? 'hover:bg-white/30' : 'hover:bg-line'}`}
          >
            <ArrowRightIcon />
          </Link>
        ) : (
          <span className={badgeClass}>
            <ArrowRightIcon />
          </span>
        )}
      </div>
      {day ? (
        <div>
          <p className="text-[32px] leading-none font-extrabold tracking-tight sm:text-[40px]">
            {Math.round(day.volume).toLocaleString()}
          </p>
          <p className={`mt-1.5 text-[13px] font-medium ${highlight ? 'text-white/85' : 'text-ink-3'}`}>
            vol on {formatDate(day.date)}
          </p>
        </div>
      ) : (
        <p className={`text-sm ${highlight ? 'text-white/85' : 'text-muted'}`}>No workouts yet</p>
      )}
    </div>
  )
}
