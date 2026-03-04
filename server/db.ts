import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'

const DATA_DIR = join(process.cwd(), 'data')

mkdirSync(join(DATA_DIR, 'timelog'), { recursive: true })

export function readJson<T>(filename: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf-8'))
  } catch {
    return fallback
  }
}

export function writeJson(filename: string, data: unknown): void {
  const fullPath = join(DATA_DIR, filename)
  mkdirSync(dirname(fullPath), { recursive: true })
  writeFileSync(fullPath, JSON.stringify(data, null, 2))
}

// ── One-time migration: timelog.json → timelog/YYYY-MM.json ──
const oldFile = join(DATA_DIR, 'timelog.json')
if (existsSync(oldFile)) {
  try {
    const logs: Array<{ start: string }> = JSON.parse(readFileSync(oldFile, 'utf-8'))
    if (logs.length > 0) {
      const byMonth: Record<string, typeof logs> = {}
      logs.forEach(log => {
        const month = new Date(log.start).toISOString().slice(0, 7)
        if (!byMonth[month]) byMonth[month] = []
        byMonth[month].push(log)
      })
      Object.entries(byMonth).forEach(([month, monthLogs]) => {
        writeJson(`timelog/${month}.json`, monthLogs)
      })
      console.log(`Migrated ${logs.length} entries → monthly files`)
    }
    unlinkSync(oldFile)
  } catch (e) {
    console.error('Migration failed:', e)
  }
}
