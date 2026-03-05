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
  bankBalances: unknown[]
  bills: unknown[]
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
    bankBalances: [],
    bills: [],
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
