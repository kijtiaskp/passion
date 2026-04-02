import { Hono } from 'hono'
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { readJson, writeJson } from '../db'

const IMG_DIR = join(process.cwd(), 'data', 'finance', 'images')
mkdirSync(IMG_DIR, { recursive: true })

interface FinanceMonth {
  month: string
  income: { salary: number; carryOver: number }
  creditCards: unknown[]
  expenses: unknown[]
  debts: unknown[]
  savings: unknown[]
  homeLoan: unknown[]
  studentLoans: unknown[]
  bankBalances: unknown[]
  bills: unknown[]
}

const COLLECTIONS = ['creditCards', 'expenses', 'debts', 'savings', 'homeLoan', 'studentLoans', 'bankBalances', 'bills'] as const
type Collection = (typeof COLLECTIONS)[number]

function isCollection(key: string): key is Collection {
  return (COLLECTIONS as readonly string[]).includes(key)
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
    studentLoans: [],
    bankBalances: [],
    bills: [],
  }
}

function readMonth(month: string): FinanceMonth {
  return readJson<FinanceMonth>(monthFile(month), emptyMonth(month))
}

function saveMonth(data: FinanceMonth) {
  writeJson(monthFile(data.month), data)
}

// GET /api/finance?month=2026-03
finance.get('/', (c) => {
  const month = c.req.query('month') ?? new Date().toISOString().slice(0, 7)
  return c.json(readMonth(month))
})

// PUT /api/finance — save entire month data (legacy, kept for compatibility)
finance.put('/', async (c) => {
  const data = await c.req.json<FinanceMonth>()
  if (!data.month) return c.json({ error: 'month field required' }, 400)
  saveMonth(data)
  return c.json(data)
})

// PATCH /api/finance/:month/income
finance.patch('/:month/income', async (c) => {
  const month = c.req.param('month')
  const changes = await c.req.json<Partial<FinanceMonth['income']>>()
  const data = readMonth(month)
  data.income = { ...data.income, ...changes }
  saveMonth(data)
  return c.json(data.income)
})

// POST /api/finance/:month/bills-with-expenses — atomic add bill + expenses
finance.post('/:month/bills-with-expenses', async (c) => {
  const month = c.req.param('month')
  const { bill, expenses } = await c.req.json<{ bill: { id?: number }; expenses: Array<{ id?: number; billId?: number }> }>()
  const billId = bill.id || Date.now()
  bill.id = billId
  const newExpenses = expenses.map((item, i) => ({ ...item, billId, id: item.id || billId + i + 1 }))
  const data = readMonth(month)
  ;(data.bills as unknown[]).push(bill)
  ;(data.expenses as unknown[]).push(...newExpenses)
  saveMonth(data)
  return c.json({ bill, expenses: newExpenses })
})

// DELETE /api/finance/:month/bills-with-expenses/:id — delete bill + its expenses
finance.delete('/:month/bills-with-expenses/:id', async (c) => {
  const month = c.req.param('month')
  const id = Number(c.req.param('id'))
  const data = readMonth(month)
  data.bills = (data.bills as Array<{ id: number }>).filter(b => b.id !== id)
  data.expenses = (data.expenses as Array<{ id: number; billId?: number }>).filter(e => e.billId !== id)
  saveMonth(data)
  return c.json({ ok: true })
})

// PATCH /api/finance/:month/expenses-by-bill/:billId — update all expenses of a bill
finance.patch('/:month/expenses-by-bill/:billId', async (c) => {
  const month = c.req.param('month')
  const billId = Number(c.req.param('billId'))
  const changes = await c.req.json()
  const data = readMonth(month)
  data.expenses = (data.expenses as Array<{ id: number; billId?: number }>).map(
    e => e.billId === billId ? { ...e, ...changes } : e
  )
  saveMonth(data)
  return c.json({ ok: true })
})

// POST /api/finance/:month/:collection — add item
finance.post('/:month/:collection', async (c) => {
  const { month, collection } = c.req.param()
  if (!isCollection(collection)) return c.json({ error: 'invalid collection' }, 400)
  const item = await c.req.json<{ id?: number }>()
  if (!item.id) item.id = Date.now()
  const data = readMonth(month)
  ;(data[collection] as unknown[]).push(item)
  saveMonth(data)
  return c.json(item)
})

// PATCH /api/finance/:month/:collection/:id — update item
finance.patch('/:month/:collection/:id', async (c) => {
  const { month, collection } = c.req.param()
  const id = Number(c.req.param('id'))
  if (!isCollection(collection)) return c.json({ error: 'invalid collection' }, 400)
  const changes = await c.req.json()
  const data = readMonth(month)
  const list = data[collection] as Array<{ id: number }>
  const idx = list.findIndex(item => item.id === id)
  if (idx === -1) return c.json({ error: 'not found' }, 404)
  list[idx] = { ...list[idx], ...changes }
  saveMonth(data)
  return c.json(list[idx])
})

// DELETE /api/finance/:month/:collection/:id — delete item
finance.delete('/:month/:collection/:id', async (c) => {
  const { month, collection } = c.req.param()
  const id = Number(c.req.param('id'))
  if (!isCollection(collection)) return c.json({ error: 'invalid collection' }, 400)
  const data = readMonth(month)
  const list = data[collection] as Array<{ id: number }>
  data[collection] = list.filter(item => item.id !== id) as never
  saveMonth(data)
  return c.json({ ok: true })
})

// POST /api/finance/upload-image
finance.post('/upload-image', async (c) => {
  const body = await c.req.parseBody()
  const file = body['file']
  if (!(file instanceof File)) {
    return c.json({ error: 'file is required' }, 400)
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${Date.now()}.${ext}`
  const buffer = await file.arrayBuffer()
  writeFileSync(join(IMG_DIR, filename), Buffer.from(buffer))

  return c.json({ filename })
})

// GET /api/finance/images/:filename
finance.get('/images/:filename', (c) => {
  const filename = c.req.param('filename')
  const filepath = join(IMG_DIR, filename)

  if (!existsSync(filepath)) {
    return c.notFound()
  }

  const data = readFileSync(filepath)
  const ext = filename.split('.').pop()?.toLowerCase()
  const contentType = ext === 'png' ? 'image/png'
    : ext === 'webp' ? 'image/webp'
    : ext === 'gif' ? 'image/gif'
    : 'image/jpeg'

  return new Response(data, {
    headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000' },
  })
})

export default finance
