import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import type { LogEntry } from '../types'
import mockTimelog from '../../../../mock/timelog/2026-03.json'
import mockProjects from '../../../../mock/projects.json'

const API = '/api'

function currentMonth() {
  return format(new Date(), 'yyyy-MM')
}

export function useLogs(initialMonth?: string) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [projects, setProjects] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || currentMonth)

  // Fetch logs when month changes
  useEffect(() => {
    setLoading(true)
    fetch(`${API}/timelog?month=${selectedMonth}`)
      .then(r => r.json())
      .then(data => { setLogs(data); setLoading(false) })
      .catch(() => { setLogs(mockTimelog as LogEntry[]); setLoading(false) })
  }, [selectedMonth])

  // Fetch projects once
  useEffect(() => {
    fetch(`${API}/projects`).then(r => r.json()).then(setProjects)
      .catch(() => setProjects(mockProjects))
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

  const cloneLog = useCallback(async (source: LogEntry) => {
    const origStart = new Date(source.start)
    const origEnd = new Date(source.end)
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), origStart.getHours(), origStart.getMinutes())
    const end   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), origEnd.getHours(), origEnd.getMinutes())
    const hrs = Math.round((end.getTime() - start.getTime()) / 36000) / 100
    await addLog(source.task, source.cat, source.project, start, end, hrs)
  }, [addLog])

  const updateLog = useCallback(async (updated: LogEntry) => {
    const month = updated.start.slice(0, 7)
    setLogs(prev => prev.map(l => l.id === updated.id ? updated : l))
    await fetch(`${API}/timelog/${updated.id}?month=${month}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
  }, [])

  const addProject = useCallback(async (name: string) => {
    setProjects(prev => [...prev, name])
    await fetch(`${API}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
  }, [])

  const renameProject = useCallback(async (oldName: string, newName: string) => {
    setProjects(prev => prev.map(p => p === oldName ? newName : p))
    await fetch(`${API}/projects`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldName, newName }),
    })
  }, [])

  const deleteProject = useCallback(async (name: string) => {
    setProjects(prev => prev.filter(p => p !== name))
    await fetch(`${API}/projects/${encodeURIComponent(name)}`, { method: 'DELETE' })
  }, [])

  return { logs, projects, loading, selectedMonth, setSelectedMonth, addLog, cloneLog, updateLog, deleteLog, addProject, renameProject, deleteProject }
}
