import { useState, useEffect, useCallback } from 'react'
import type { LogEntry } from '../types'

const API = '/api'

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [projects, setProjects] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  // Fetch logs when month changes
  useEffect(() => {
    setLoading(true)
    fetch(`${API}/timelog?month=${selectedMonth}`)
      .then(r => r.json())
      .then(data => { setLogs(data); setLoading(false) })
  }, [selectedMonth])

  // Fetch projects once
  useEffect(() => {
    fetch(`${API}/projects`).then(r => r.json()).then(setProjects)
  }, [])

  const addLog = useCallback(async (
    task: string, cat: string, project: string, start: Date, end: Date, hrs: number
  ) => {
    const entry: LogEntry = {
      id: Date.now(),
      task,
      cat,
      project: project || '',
      start: start.toISOString(),
      end: end.toISOString(),
      hrs: Math.round(hrs * 100) / 100,
    }
    const entryMonth = entry.start.slice(0, 7)
    // Optimistic: show in current view only if same month
    if (entryMonth === selectedMonth) {
      setLogs(prev => [entry, ...prev])
    }
    await fetch(`${API}/timelog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
  }, [selectedMonth])

  const deleteLog = useCallback(async (id: number) => {
    const entry = logs.find(l => l.id === id)
    if (!entry) return
    const month = entry.start.slice(0, 7)
    setLogs(prev => prev.filter(l => l.id !== id))
    await fetch(`${API}/timelog/${id}?month=${month}`, { method: 'DELETE' })
  }, [logs])

  const addProject = useCallback(async (name: string) => {
    setProjects(prev => [...prev, name])
    await fetch(`${API}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
  }, [])

  return { logs, projects, loading, selectedMonth, setSelectedMonth, addLog, deleteLog, addProject }
}
