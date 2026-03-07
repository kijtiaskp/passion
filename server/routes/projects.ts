import { Hono } from 'hono'
import { readJson, writeJson } from '../db'

const projects = new Hono()

// GET /api/projects
projects.get('/', (c) => {
  return c.json(readJson<string[]>('projects.json', []))
})

// POST /api/projects
projects.post('/', async (c) => {
  const { name } = await c.req.json<{ name: string }>()
  const list = readJson<string[]>('projects.json', [])
  if (list.includes(name)) return c.json({ error: 'มีโปรเจคนี้อยู่แล้ว' }, 409)
  const updated = [...list, name]
  writeJson('projects.json', updated)
  return c.json(name, 201)
})

// PATCH /api/projects — rename a project
projects.patch('/', async (c) => {
  const { oldName, newName } = await c.req.json<{ oldName: string; newName: string }>()
  const list = readJson<string[]>('projects.json', [])
  const idx = list.indexOf(oldName)
  if (idx === -1) return c.json({ error: 'not found' }, 404)
  if (list.includes(newName)) return c.json({ error: 'มีชื่อนี้อยู่แล้ว' }, 409)
  list[idx] = newName
  writeJson('projects.json', list)
  return c.json(newName)
})

// DELETE /api/projects/:name
projects.delete('/:name', (c) => {
  const name = decodeURIComponent(c.req.param('name'))
  const list = readJson<string[]>('projects.json', [])
  const updated = list.filter(p => p !== name)
  if (updated.length === list.length) return c.json({ error: 'not found' }, 404)
  writeJson('projects.json', updated)
  return c.json({ ok: true })
})

export default projects
