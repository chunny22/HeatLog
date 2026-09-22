import { RefreshIcon } from './icons'

interface DayInsightBarProps {
  insight: string | null
  loading: boolean
  error: string | null
  onRegenerate: () => void
}

export function DayInsightBar({ insight, loading, error, onRegenerate }: DayInsightBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 sm:pb-6">
      <div className="mx-auto flex max-w-3xl items-center gap-3.5 rounded-[26px] bg-coach py-3 pr-3 pl-3.5 text-zinc-100 shadow-[0_12px_32px_rgb(0_0_0/0.25)]">
        <span className="flex h-8 shrink-0 items-center rounded-full bg-accent px-3 text-xs font-extrabold tracking-[0.02em] text-white">
          AI Coach
        </span>

        <div className="min-w-0 flex-1 text-sm leading-5 text-zinc-200">
          {loading && <span className="text-zinc-400">Thinking…</span>}
          {!loading && error && <span className="text-red-300">Couldn't generate feedback: {error}</span>}
          {!loading && !error && insight && <span>{insight}</span>}
        </div>

        <button
          onClick={onRegenerate}
          disabled={loading}
          aria-label="Regenerate feedback"
          title="Regenerate"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-coach-2 text-white transition-colors hover:brightness-125 disabled:opacity-50"
        >
          <RefreshIcon className={loading ? 'animate-spin' : undefined} />
        </button>
      </div>
    </div>
  )
}
