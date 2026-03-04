import { useState, useEffect, useRef } from 'react'

type AddLogFn = (task: string, cat: string, project: string, start: Date, end: Date, hrs: number) => void

export function useTimer(addLog: AddLogFn) {
  const [timerStart, setTimerStart] = useState<Date | null>(null)
  const [timerDisplay, setTimerDisplay] = useState('00:00:00')
  const [timerTask, setTimerTask] = useState('')
  const [timerProject, setTimerProject] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (timerStart) {
      intervalRef.current = setInterval(() => {
        const d = Math.floor((Date.now() - timerStart.getTime()) / 1000)
        setTimerDisplay(
          `${String(Math.floor(d / 3600)).padStart(2, '0')}:${String(Math.floor((d % 3600) / 60)).padStart(2, '0')}:${String(d % 60).padStart(2, '0')}`
        )
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timerStart])

  const start = (task: string, project: string) => {
    setTimerTask(task)
    setTimerProject(project)
    setTimerStart(new Date())
    setTimerDisplay('00:00:00')
  }

  const stop = (cat: string) => {
    if (!timerStart) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    const end = new Date()
    addLog(timerTask, cat, timerProject, timerStart, end, (end.getTime() - timerStart.getTime()) / 3600000)
    setTimerStart(null)
    setTimerDisplay('00:00:00')
    setTimerTask('')
    setTimerProject('')
  }

  return {
    isRunning: timerStart !== null,
    timerDisplay,
    timerTask,
    timerProject,
    start,
    stop,
  }
}
