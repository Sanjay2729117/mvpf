import Editor from '@monaco-editor/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { DifficultyBadge } from '../components/DifficultyBadge'
import { PageShell } from '../components/PageShell'
import { getProblemById, runSubmission, submitSolution } from '../lib/api'

/* =========================
   TYPES (ALIGNED WITH BACKEND)
========================= */
interface RunResultItem {
  input: string
  output: string
  expectedOutput: string
  passed: boolean
  status: string
}

interface RunResponse {
  type: 'RUN'
  passed: number
  total: number
  results: RunResultItem[]
}

interface SubmitResultItem {
  testCase: number
  status: string
  input?: string
  expectedOutput?: string
  userOutput?: string // Backend uses userOutput for SUBMIT
}

interface SubmitResponse {
  type: 'SUBMIT'
  status: string
  passed: number
  total: number
  results: SubmitResultItem[]
}

const starters: Record<string, string> = {
  java: `import java.util.*;\nclass Main {\n  public static void main(String[] args){\n    Scanner sc = new Scanner(System.in);\n  }\n}`,
  python: `# Python starter\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  return 0;\n}`,
}

export function ProblemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [language, setLanguage] = useState<'java' | 'python' | 'cpp'>('java')
  const [code, setCode] = useState(starters.java)
  const [activeTab, setActiveTab] = useState<'run' | 'submit' | null>(null)
  const [runResult, setRunResult] = useState<RunResponse | null>(null)
  const [submitResult, setSubmitResult] = useState<SubmitResponse | null>(null)

  const detailQuery = useQuery({
    queryKey: ['problem', id],
    queryFn: () => getProblemById(id!),
    enabled: !!id,
  })

  const runMutation = useMutation({
    mutationFn: runSubmission,
    onSuccess: (data: RunResponse) => {
      setRunResult(data)
      setSubmitResult(null)
      setActiveTab('run')
    },
    onError: (error: any) => toast.error(error.message),
  })

  const submitMutation = useMutation({
    mutationFn: submitSolution,
    onSuccess: (data: SubmitResponse) => {
      setSubmitResult(data)
      setRunResult(null)
      setActiveTab('submit')

      if (data.status.toLowerCase() === 'accepted' || data.passed === data.total) {
        toast.success('Accepted! 🎉')
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
      } else {
        toast.error(`Failed: ${data.status}`)
      }
    },
    onError: (error: any) => toast.error(error.message),
  })

  if (!id || detailQuery.isLoading) return <PageShell title="Loading..."><div className="h-96 animate-pulse bg-slate-800 rounded-xl" /></PageShell>
  const problem = detailQuery.data!

  return (
    <PageShell 
      title={problem.title}
      rightAction={<button onClick={() => navigate('/')} className="text-sm opacity-70 hover:opacity-100">Back to List</button>}
    >
      <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
        
        {/* LEFT: Problem Description */}
        <div className="glass p-6 rounded-xl overflow-y-auto custom-scrollbar">
          <div className="flex gap-3 items-center mb-4">
            <h2 className="text-2xl font-bold">{problem.title}</h2>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>

          <div className="prose prose-invert max-w-none text-slate-300">
            <p className="mb-6">{problem.description}</p>
            
            <h3 className="text-white text-lg font-semibold">Input Format</h3>
            <p className="bg-slate-800/50 p-3 rounded-lg mb-4">{problem.inputFormat}</p>

            <h3 className="text-white text-lg font-semibold">Output Format</h3>
            <p className="bg-slate-800/50 p-3 rounded-lg mb-4">{problem.outputFormat}</p>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Sample Input</h4>
                <pre className="bg-black/40 p-3 rounded text-sm border border-white/5">{problem.sampleInput}</pre>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Sample Output</h4>
                <pre className="bg-black/40 p-3 rounded text-sm border border-white/5">{problem.sampleOutput}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Editor & Results */}
        <div className="flex flex-col gap-4">
          <div className="glass p-2 rounded-xl flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center p-2">
              <select 
                className="bg-slate-800 border-none text-sm rounded px-2 py-1 outline-none"
                value={language}
                onChange={(e) => {
                  const lang = e.target.value as any
                  setLanguage(lang)
                  setCode(starters[lang])
                }}
              >
                <option value="java">Java 17</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++ 17</option>
              </select>

              <div className="flex gap-2">
                <button 
                  disabled={runMutation.isPending}
                  onClick={() => runMutation.mutate({ problemId: problem.id, code, language })}
                  className="px-4 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {runMutation.isPending ? 'Running...' : 'Run Code'}
                </button>
                <button 
                  disabled={submitMutation.isPending}
                  onClick={() => submitMutation.mutate({ problemId: problem.id, code, language })}
                  className="px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>

            <div className="flex-1 border-t border-white/5 pt-2 overflow-hidden rounded-b-xl">
              <Editor
                height="100%"
                theme="vs-dark"
                language={language === 'python' ? 'python' : language}
                value={code}
                onChange={(v) => setCode(v || '')}
                options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 10 } }}
              />
            </div>
          </div>

          {/* RESULTS PANEL */}
          <AnimatePresence mode="wait">
            {(runResult || submitResult) && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass rounded-xl p-4 max-h-64 overflow-y-auto border-t-2 border-indigo-500/30"
              >
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold flex items-center gap-2">
                     {activeTab === 'run' ? 'Console Results' : 'Submission Verdict'}
                     <span className={`text-xs px-2 py-0.5 rounded ${
                       (runResult?.passed === runResult?.total || submitResult?.status === 'Accepted') 
                       ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                     }`}>
                       {activeTab === 'run' ? `${runResult?.passed}/${runResult?.total}` : submitResult?.status}
                     </span>
                   </h3>
                </div>

                <div className="space-y-3">
                  {activeTab === 'run' && runResult?.results.map((res, i) => (
                    <TestCaseCard key={i} index={i+1} status={res.status} input={res.input} expected={res.expectedOutput} actual={res.output} />
                  ))}
                  {activeTab === 'submit' && submitResult?.results.map((res, i) => (
                    <TestCaseCard 
                        key={i} 
                        index={res.testCase} 
                        status={res.status} 
                        input={res.input} 
                        expected={res.expectedOutput} 
                        actual={res.userOutput} // Note: SUBMIT uses userOutput
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageShell>
  )
}

/* =========================
   SUB-COMPONENT: TEST CASE CARD
========================= */
function TestCaseCard({ index, status, input, expected, actual }: any) {
  const isPassed = status === 'Passed'
  return (
    <div className={`p-3 rounded-lg border ${isPassed ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-mono opacity-60">Case {index}</span>
        <span className={`text-xs font-bold ${isPassed ? 'text-green-400' : 'text-red-400'}`}>{status}</span>
      </div>
      {!isPassed && input && (
        <div className="grid grid-cols-1 gap-2 text-[13px] font-mono">
          <div className="flex gap-2"><span className="text-slate-500 w-16">Input:</span> <span className="text-slate-300">{input}</span></div>
          <div className="flex gap-2"><span className="text-slate-500 w-16">Expected:</span> <span className="text-green-400">{expected}</span></div>
          <div className="flex gap-2"><span className="text-slate-500 w-16">Actual:</span> <span className="text-red-400">{actual || '""'}</span></div>
        </div>
      )}
    </div>
  )
}