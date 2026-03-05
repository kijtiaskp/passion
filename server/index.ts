import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import timelog from './routes/timelog'
import projects from './routes/projects'
import finance from './routes/finance'
import activity from './routes/activity'

const app = new Hono()

app.use('*', cors({ origin: 'http://localhost:5173' }))

app.route('/api/timelog', timelog)
app.route('/api/projects', projects)
app.route('/api/finance', finance)
app.route('/api/activity', activity)

app.get('/health', (c) => c.json({ ok: true }))

const PORT = 3001

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`API server running at http://localhost:${PORT}`)
})
