export type Expense = {
  _id?: string
  amount: number
  category: string
  payment_mode: string
  tags: string[]
  remarks?: string
  date?: string
  type?: "expense" | "investment"
}

export type Income = {
  amount: number
  source?: string
  month?: string // YYYY-MM
}

export type Stats = {
  mtdIncome: number
  ytdIncome: number
  mtdInvestments: number
  ytdInvestments: number
  mtdExpenses: number
  ytdExpenses: number
}

export type AnalyticsBreakdown = {
  byCategory: { name: string; total: number }[]
  byPaymentMode: { name: string; total: number }[]
  byTag: { name: string; total: number }[]
}

export type AnalyticsTimeseriesPoint = {
  date: string // YYYY-MM-DD
  total: number
}
