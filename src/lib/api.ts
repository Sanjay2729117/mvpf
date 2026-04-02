import type {
  ProblemDetail,
  ProblemListItem,
  RunResponse,
  SubmitResponse,
  TestCase,
} from '../types'

/* =========================
   🌐 BASE URL
========================= */
const API_BASE = 'https://supreme-space-telegram-66vgvgqq6pgc549x-8084.app.github.dev/api/v1'

/* =========================
   🔥 ERROR CLASS
========================= */
export class ApiError extends Error {
  status: number
  data?: any

  constructor(status: number, message: string, data?: any) {
    super(message)
    this.status = status
    this.data = data
  }
}

/* =========================
   🔥 REQUEST FUNCTION
========================= */
async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const controller = new AbortController()

  const timeout = setTimeout(() => {
    controller.abort()
  }, 10000) // 10s timeout

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    })

    const contentType = res.headers.get('content-type')

    let data: any

    if (contentType?.includes('application/json')) {
      data = await res.json()
    } else {
      data = await res.text()
    }

    if (!res.ok) {
      throw new ApiError(
        res.status,
        data?.message || data || 'Request failed',
        data
      )
    }

    return data as T
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout ⏳')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

/* =========================
   🔥 TYPES
========================= */
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export type SubmissionPayload = {
  problemId: string
  code: string
  language: string
}

export type CreateProblemPayload = {
  title: string
  description: string
  difficulty: Difficulty
  inputFormat: string
  outputFormat: string
  sampleInput: string
  sampleOutput: string
  tags: string[]
  isPublic: boolean
  testCases: TestCase[]
}

/* =========================
   📘 PROBLEM APIs
========================= */
export const problemApi = {
  getAll: (start = 0, end = 10) =>
    request<ProblemListItem[]>(
      `/problems?start=${start}&end=${end}`
    ),

  getById: (id: string) =>
    request<ProblemDetail>(`/problems/${id}`),

  create: (payload: CreateProblemPayload) =>
    request<ProblemDetail>('/problems', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

/* =========================
   🚀 SUBMISSION APIs
========================= */
export const submissionApi = {
  run: (payload: SubmissionPayload) =>
    request<RunResponse>('/submissions/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  submit: (payload: SubmissionPayload) =>
    request<SubmitResponse>('/submissions/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

/* =========================
   🔄 LEGACY EXPORTS
========================= */
export const getProblems = problemApi.getAll
export const getProblemById = problemApi.getById
export const runSubmission = submissionApi.run
export const submitSolution = submissionApi.submit
export const createProblem = problemApi.create