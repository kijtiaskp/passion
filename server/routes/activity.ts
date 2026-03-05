import { Hono } from 'hono'
import { readJson, writeJson } from '../db'

interface ActivityEntry {
  id: number
  text: string
  cat: string
  mood: string
  time: string
}

const activity = new Hono()

function dateFile(date: string) {
  return `activity/${date}.json`
}

// GET /api/activity?date=2026-03-05
activity.get('/', (c) => {
  const date = c.req.query('date') ?? new Date().toISOString().slice(0, 10)
  return c.json(readJson<ActivityEntry[]>(dateFile(date), []))
})

// POST /api/activity
activity.post('/', async (c) => {
  const entry = await c.req.json<ActivityEntry>()
  const date = entry.time.slice(0, 10)
  const entries = readJson<ActivityEntry[]>(dateFile(date), [])
  writeJson(dateFile(date), [entry, ...entries])
  return c.json(entry, 201)
})

// DELETE /api/activity/:id?date=2026-03-05
activity.delete('/:id', (c) => {
  const id = Number(c.req.param('id'))
  const date = c.req.query('date')
  if (!date) return c.json({ error: 'date query required' }, 400)
  const entries = readJson<ActivityEntry[]>(dateFile(date), [])
  writeJson(dateFile(date), entries.filter(e => e.id !== id))
  return c.json({ ok: true })
})

export default activity
