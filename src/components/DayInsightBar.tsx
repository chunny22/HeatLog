interface DayInsightBarProps {
  insight: string | null
  loading: boolean
  error: string | null
  onRegenerate: () => void
}

export function DayInsightBar({ insight, loading, error, onRegenerate }: DayInsightBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-indigo-200 bg-indigo-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <span className="shrink-0 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
          AI Coach
        </span>

        <div className="min-w-0 flex-1 text-sm text-gray-700">
          {loading && <span className="text-gray-400">Thinking…</span>}
          {!loading && error && <span className="text-red-600">Couldn't generate feedback: {error}</span>}
          {!loading && !error && insight && <span>{insight}</span>}
        </div>

        <button
          onClick={onRegenerate}
          disabled={loading}
          title="Regenerate"
          className="shrink-0 rounded-lg px-2 py-1 text-sm text-indigo-600 hover:bg-indigo-100 disabled:opacity-50"
        >
          ↻
        </button>
      </div>
    </div>
  )
}
