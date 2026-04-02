import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function PageShell({
  title,
  rightAction,
  children,
}: {
  title: string
  rightAction?: ReactNode
  children: ReactNode
}) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl p-6 md:p-10">
      <header className="mb-6 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-slate-100">
          CodeArena
        </Link>
        <div className="text-sm text-slate-400">{rightAction}</div>
      </header>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
          {title}
        </h1>
      </div>
      {children}
    </main>
  )
}
