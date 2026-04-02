import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { DifficultyBadge } from '../components/DifficultyBadge'
import { PageShell } from '../components/PageShell'
import { getProblems } from '../lib/api'

const PAGE_SIZE = 10

export function ProblemListPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const start = (page - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE

  const query = useQuery({
    queryKey: ['problems', page],
    queryFn: () => getProblems(start, end),
  })

  if (query.error) {
    toast.error((query.error as Error).message || 'Failed to fetch problems')
  }

  return (
    <PageShell
      title="Problems"
      rightAction={
        <Link
          to="/add"
          className="rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-4 py-2 font-medium text-indigo-200 transition hover:scale-105 hover:shadow-glow"
        >
          Add Problem
        </Link>
      }
    >
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass overflow-hidden rounded-2xl shadow-soft"
      >
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-700/70 text-left text-sm text-slate-400">
              <th className="px-5 py-4 font-medium">Title</th>
              <th className="px-5 py-4 font-medium">Difficulty</th>
              <th className="px-5 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {query.isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-800/70">
                  <td className="px-5 py-5">
                    <div className="h-5 w-40 animate-pulse rounded bg-slate-700/40" />
                  </td>
                  <td className="px-5 py-5">
                    <div className="h-5 w-20 animate-pulse rounded bg-slate-700/40" />
                  </td>
                  <td className="px-5 py-5">
                    <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-700/40" />
                  </td>
                </tr>
              ))}

            {!query.isLoading && query.data?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-slate-400">
                  No problems available yet.
                </td>
              </tr>
            )}

            {query.data?.map((problem) => (
              <motion.tr
                key={problem.id}
                whileHover={{ scale: 1.01 }}
                className="cursor-pointer border-b border-slate-800/70 transition hover:bg-slate-800/40"
                onClick={() => navigate(`/problem/${problem.id}`)}
              >
                <td className="px-5 py-5 font-medium text-slate-100">
                  {problem.title}
                </td>
                <td className="px-5 py-5">
                  <DifficultyBadge difficulty={problem.difficulty} />
                </td>
                <td className="px-5 py-5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/problem/${problem.id}`)
                    }}
                    className="rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-200 transition hover:scale-105 hover:shadow-glow"
                  >
                    Solve
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.section>

      <div className="mt-5 flex items-center justify-end gap-3">
        <button
          disabled={page <= 1}
          onClick={() => setParams({ page: String(Math.max(1, page - 1)) })}
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-sm text-slate-400">Page {page}</span>
        <button
          disabled={Boolean(query.data && query.data.length < PAGE_SIZE)}
          onClick={() => setParams({ page: String(page + 1) })}
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </PageShell>
  )
}
