import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageShell } from '../components/PageShell'
import { createProblem } from '../lib/api'
import type { Difficulty } from '../types'

type TestCaseForm = {
  input: string
  expectedOutput: string
  isHidden: boolean
}

export function AddProblemPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM')
  const [inputFormat, setInputFormat] = useState('')
  const [outputFormat, setOutputFormat] = useState('')
  const [sampleInput, setSampleInput] = useState('')
  const [sampleOutput, setSampleOutput] = useState('')
  const [tags, setTags] = useState('array')
  const [isPublic, setIsPublic] = useState(true)
  const [testCases, setTestCases] = useState<TestCaseForm[]>([
    { input: '', expectedOutput: '', isHidden: false },
  ])

  const mutation = useMutation({
    mutationFn: createProblem,
    onSuccess: () => {
      toast.success('Problem created')
      navigate('/')
    },
    onError: (error) => toast.error((error as Error).message),
  })

  return (
    <PageShell title="Add Problem">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate({
            title,
            description,
            difficulty,
            inputFormat,
            outputFormat,
            sampleInput,
            sampleOutput,
            tags: tags.split(',').map((t) => t.trim()),
            isPublic,
            testCases: testCases.map((t, i) => ({
              ...t,
              orderIndex: i + 1,
            })),
          })
        }}
        className="glass mx-auto max-w-4xl space-y-4 rounded-2xl p-6"
      >
        <Input label="Title" value={title} onChange={setTitle} />
        <TextArea label="Description" value={description} onChange={setDescription} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 outline-none focus:border-indigo-400 focus:shadow-glow"
            >
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
            </select>
          </div>
          <Input label="Tags (comma-separated)" value={tags} onChange={setTags} />
        </div>
        <TextArea label="Input Format" value={inputFormat} onChange={setInputFormat} />
        <TextArea label="Output Format" value={outputFormat} onChange={setOutputFormat} />
        <TextArea label="Sample Input" value={sampleInput} onChange={setSampleInput} />
        <TextArea label="Sample Output" value={sampleOutput} onChange={setSampleOutput} />

        <div className="rounded-xl border border-slate-700 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium text-slate-100">Test Cases</h3>
            <button
              type="button"
              onClick={() =>
                setTestCases((prev) => [
                  ...prev,
                  { input: '', expectedOutput: '', isHidden: false },
                ])
              }
              className="rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-3 py-1.5 text-sm text-indigo-200"
            >
              Add Case
            </button>
          </div>
          <div className="space-y-3">
            {testCases.map((testCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-slate-700 p-3"
              >
                <p className="mb-2 text-xs text-slate-400">Case {index + 1}</p>
                <TextArea
                  label="Input"
                  value={testCase.input}
                  onChange={(value) =>
                    setTestCases((prev) =>
                      prev.map((t, i) => (i === index ? { ...t, input: value } : t)),
                    )
                  }
                />
                <TextArea
                  label="Expected Output"
                  value={testCase.expectedOutput}
                  onChange={(value) =>
                    setTestCases((prev) =>
                      prev.map((t, i) =>
                        i === index ? { ...t, expectedOutput: value } : t,
                      ),
                    )
                  }
                />
                <div className="mt-2 flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={testCase.isHidden}
                      onChange={(e) =>
                        setTestCases((prev) =>
                          prev.map((t, i) =>
                            i === index ? { ...t, isHidden: e.target.checked } : t,
                          ),
                        )
                      }
                    />
                    Hidden
                  </label>
                  <button
                    type="button"
                    disabled={testCases.length === 1}
                    onClick={() =>
                      setTestCases((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="rounded border border-rose-500/40 px-2 py-1 text-rose-300 disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Public problem
        </label>

        <motion.button
          whileHover={{ scale: 1.05 }}
          type="submit"
          className="rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-5 py-2.5 font-medium text-indigo-100"
        >
          {mutation.isPending ? 'Saving...' : 'Create Problem'}
        </motion.button>
      </form>
    </PageShell>
  )
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-slate-300">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 outline-none transition focus:border-indigo-400 focus:shadow-glow"
      />
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-slate-300">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-24 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 outline-none transition focus:border-indigo-400 focus:shadow-glow"
      />
    </div>
  )
}
