export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface ProblemListItem {
  id: string
  title: string
  difficulty: Difficulty
}

export interface TestCase {
  input: string
  expectedOutput: string
  isHidden?: boolean
  orderIndex?: number
}

export interface ProblemDetail {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  inputFormat: string
  outputFormat: string
  sampleInput: string
  sampleOutput: string
  testCases: TestCase[]
}

export interface RunResultItem {
  input: string
  output: string
  expectedOutput: string
  passed: boolean
  status: string
}

export interface RunResponse {
  type: 'RUN'
  passed: number
  total: number
  results: RunResultItem[]
}

export interface SubmitResultItem {
  testCase: number
  status: string
}

export interface SubmitResponse {
  type: 'SUBMIT'
  status: string
  passed: number
  total: number
  results: SubmitResultItem[]
}
