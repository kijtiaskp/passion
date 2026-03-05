import { Hono } from 'hono'
import { readJson, writeJson } from '../db'

interface LogEntry {
  id: number
  task: string
  cat: string
  project: string
  start: string
  end: string
  hrs: number
}

const timelog = new Hono()

function monthFile(month: string) {
  return `timelog/${month}.json`
}

function monthFromDate(isoDate: string) {
  return new Date(isoDate).toISOString().slice(0, 7)
}

// GET /api/timelog?month=2026-03
timelog.get('/', (c) => {
  const month = c.req.query('month') ?? new Date().toISOString().slice(0, 7)
  return c.json(readJson<LogEntry[]>(monthFile(month), []))
})

// POST /api/timelog  — server derives month from entry.start
timelog.post('/', async (c) => {
  const entry = await c.req.json<LogEntry>()
  const month = monthFromDate(entry.start)
  const logs = readJson<LogEntry[]>(monthFile(month), [])
  writeJson(monthFile(month), [entry, ...logs])
  return c.json(entry, 201)
})

// PUT /api/timelog/:id — update an existing entry
timelog.put('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const updated = await c.req.json<LogEntry>()
  const month = updated.start.slice(0, 7)
  const logs = readJson<LogEntry[]>(monthFile(month), [])
  const idx = logs.findIndex(l => l.id === id)
  if (idx === -1) return c.json({ error: 'not found' }, 404)
  logs[idx] = { ...updated, id }
  writeJson(monthFile(month), logs)
  return c.json(logs[idx])
})

// DELETE /api/timelog/:id?month=2026-03
timelog.delete('/:id', (c) => {
  const id = Number(c.req.param('id'))
  const month = c.req.query('month')
  if (!month) return c.json({ error: 'month query required' }, 400)
  const logs = readJson<LogEntry[]>(monthFile(month), [])
  writeJson(monthFile(month), logs.filter(l => l.id !== id))
  return c.json({ ok: true })
})

export default timelog
