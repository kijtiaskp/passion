import { Hono } from 'hono'
import { readJson, writeJson } from '../db'

const projects = new Hono()

projects.get('/', (c) => {
  return c.json(readJson<string[]>('projects.json', []))
})

projects.post('/', async (c) => {
  const { name } = await c.req.json<{ name: string }>()
  const list = readJson<string[]>('projects.json', [])
  if (list.includes(name)) return c.json({ error: 'มีโปรเจคนี้อยู่แล้ว' }, 409)
  const updated = [...list, name]
  writeJson('projects.json', updated)
  return c.json(name, 201)
})

export default projects
