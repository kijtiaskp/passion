import { useState, useEffect, useMemo } from 'react'
import { useLogs } from './api/use-logs'
import { StatsBar } from './components/StatsBar'
import { TimesheetBar } from './components/TimesheetBar'
import { LogForm } from './components/LogForm'
import { LogTable } from './components/LogTable'
import './timelog.css'

export function TimelogApp() {
  const { logs, projects, loading, selectedMonth, setSelectedMonth, addLog, deleteLog, addProject } = useLogs()
  const [clock, setClock] = useState('')
  const [dateLabel, setDateLabel] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setClock(now.toLocaleTimeString('th-TH'))
      setDateLabel(now.toLocaleDateString('th-TH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const stats = useMemo(() => {
    const now = new Date()
    const todayStr = now.toDateString()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    return {
      todayHrs: logs.filter(l => new Date(l.start).toDateString() === todayStr).reduce((s, l) => s + l.hrs, 0),
      weekHrs: logs.filter(l => new Date(l.start) >= weekStart).reduce((s, l) => s + l.hrs, 0),
      allHrs: logs.reduce((s, l) => s + l.hrs, 0),
    }
  }, [logs])

  return (
    <div className="tl-container">
      <header className="tl-header">
        <div className="tl-logo">TIME<span>LOG</span></div>
        <div className="tl-clock">
          <span className="tl-clock-big">{clock}</span>
          <span>{dateLabel}</span>
        </div>
      </header>
      <StatsBar stats={stats} />
      <TimesheetBar todayHrs={stats.todayHrs} />
      <LogForm projects={projects} onAddLog={addLog} onAddProject={addProject} />
      <LogTable
        logs={logs}
        loading={loading}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onDelete={deleteLog}
      />
    </div>
  )
}
