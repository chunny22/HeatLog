import { useRef, useState, type PointerEvent } from 'react'
import { dragDistance, shouldDismiss } from '../utils/swipe'
import { RefreshIcon, SparkleIcon, XIcon } from './icons'

// Sits just above the phone tab bar (~71px plus its safe-area padding), and at
// the very bottom of the screen on larger displays where there is no tab bar.
const POSITION = 'bottom-[calc(79px+max(env(safe-area-inset-bottom),12px))] sm:bottom-0'

interface DayInsightBarProps {
  insight: string | null
  loading: boolean
  error: string | null
  onRegenerate: () => void
  onHide: () => void
}

export function DayInsightBar({ insight, loading, error, onRegenerate, onHide }: DayInsightBarProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const dismiss = () => {
    if (leaving) return
    setLeaving(true)
    // Let the slide-away play before the bar is removed.
    window.setTimeout(onHide, 250)
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    startY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    setDragY(dragDistance(startY.current, e.clientY))
  }

  const endDrag = () => {
    if (!dragging) return
    setDragging(false)
    const height = cardRef.current?.getBoundingClientRect().height ?? 0
    if (shouldDismiss(dragY, height)) dismiss()
    else setDragY(0)
  }

  const offset = leaving ? '140%' : `${dragY}px`
  const opacity = leaving ? 0 : Math.max(0.5, 1 - dragY / 240)

  return (
    <div className={`fixed inset-x-0 z-20 px-4 pb-0 sm:pb-6 ${POSITION}`}>
      <div className="animate-coach-in mx-auto max-w-3xl">
        <div
          ref={cardRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{ transform: `translateY(${offset})`, opacity }}
          className={`relative flex touch-none items-center gap-3 rounded-[26px] bg-coach py-3 pr-2.5 pl-3.5 text-zinc-100 shadow-[0_12px_32px_rgb(0_0_0/0.25)] select-none ${
            dragging ? '' : 'transition-[transform,opacity] duration-300 ease-out'
          }`}
        >
          <span aria-hidden="true" className="absolute top-1.5 left-1/2 h-1 w-9 -translate-x-1/2 rounded-full bg-white/25" />

          <span className="flex h-8 shrink-0 items-center rounded-full bg-accent px-3 text-xs font-extrabold tracking-[0.02em] text-white">
            AI Coach
          </span>

          <div className="min-w-0 flex-1 text-sm leading-5 text-zinc-200">
            {loading && <span className="text-zinc-400">Thinking…</span>}
            {!loading && error && <span className="text-red-300">Couldn't generate feedback: {error}</span>}
            {!loading && !error && insight && <span>{insight}</span>}
          </div>

          <div className="flex shrink-0 flex-col gap-1">
            <button
              onClick={dismiss}
              aria-label="Hide AI Coach"
              title="Hide"
              className="flex size-9 items-center justify-center rounded-full bg-coach-2 text-white transition-colors hover:brightness-125"
            >
              <XIcon size={16} />
            </button>
            <button
              onClick={onRegenerate}
              disabled={loading}
              aria-label="Regenerate feedback"
              title="Regenerate"
              className="flex size-9 items-center justify-center rounded-full bg-coach-2 text-white transition-colors hover:brightness-125 disabled:opacity-50"
            >
              <RefreshIcon size={16} className={loading ? 'animate-spin' : undefined} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Shown in the bar's place once it has been hidden, so it can be brought back.
export function CoachButton({ onShow }: { onShow: () => void }) {
  return (
    <div className={`pointer-events-none fixed inset-x-0 z-20 px-4 pb-0 sm:pb-6 ${POSITION}`}>
      <div className="mx-auto flex max-w-3xl justify-end">
        <button
          onClick={onShow}
          aria-label="Show AI Coach"
          className="animate-coach-in pointer-events-auto flex h-11 items-center gap-2 rounded-full bg-coach py-1 pr-4 pl-1.5 text-sm font-extrabold text-white shadow-[0_8px_22px_rgb(0_0_0/0.25)] transition-colors hover:brightness-125"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-accent">
            <SparkleIcon size={16} />
          </span>
          AI Coach
        </button>
      </div>
    </div>
  )
}
