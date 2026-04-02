import type { Difficulty } from '../types'

const difficultyStyles: Record<Difficulty, string> = {
  EASY: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  MEDIUM: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  HARD: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ${difficultyStyles[difficulty]}`}
    >
      {difficulty}
    </span>
  )
}
