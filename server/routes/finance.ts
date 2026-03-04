import { Hono } from 'hono'
import { readJson, writeJson } from '../db'

interface FinanceMonth {
  month: string
  income: { salary: number; carryOver: number }
  creditCards: unknown[]
  expenses: unknown[]
  debts: unknown[]
  savings: unknown[]
  homeLoan: unknown[]
}

const finance = new Hono()

function monthFile(month: string) {
  return `finance/${month}.json`
}

function emptyMonth(month: string): FinanceMonth {
  return {
    month,
    income: { salary: 0, carryOver: 0 },
    creditCards: [],
    expenses: [],
    debts: [],
    savings: [],
    homeLoan: [],
  }
}

// GET /api/finance?month=2026-03
finance.get('/', (c) => {
  const month = c.req.query('month') ?? new Date().toISOString().slice(0, 7)
  return c.json(readJson<FinanceMonth>(monthFile(month), emptyMonth(month)))
})

// PUT /api/finance — save entire month data
finance.put('/', async (c) => {
  const data = await c.req.json<FinanceMonth>()
  if (!data.month) return c.json({ error: 'month field required' }, 400)
  writeJson(monthFile(data.month), data)
  return c.json(data)
})

export default finance
