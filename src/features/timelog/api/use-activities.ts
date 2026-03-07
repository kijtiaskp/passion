import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import type { ActivityEntry, ActivityCategory, Mood } from '../types'

const API = '/api'

function todayStr() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function useActivities() {
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(todayStr)

  useEffect(() => {
    setLoading(true)
    fetch(`${API}/activity?date=${selectedDate}`)
      .then(r => r.json())
      .then(data => { setActivities(data); setLoading(false) })
  }, [selectedDate])

  const addActivity = useCallback(async (
    text: string, cat: ActivityCategory, mood: Mood, time: Date
  ) => {
    const entry: ActivityEntry = {
      id: Date.now(),
      text,
      cat,
      mood,
      time: time.toISOString(),
    }
    const entryDate = entry.time.slice(0, 10)
    if (entryDate === selectedDate) {
      setActivities(prev => [entry, ...prev])
    }
    await fetch(`${API}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
  }, [selectedDate])

  const deleteActivity = useCallback(async (id: number) => {
    const entry = activities.find(a => a.id === id)
    if (!entry) return
    const date = entry.time.slice(0, 10)
    setActivities(prev => prev.filter(a => a.id !== id))
    await fetch(`${API}/activity/${id}?date=${date}`, { method: 'DELETE' })
  }, [activities])

  return { activities, loading, selectedDate, setSelectedDate, addActivity, deleteActivity }
}
