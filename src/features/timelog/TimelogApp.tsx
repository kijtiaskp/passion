import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useLogs } from './api/use-logs'
import { StatsBar } from './components/StatsBar'
import { TimesheetBar } from './components/TimesheetBar'
import { LogForm } from './components/LogForm'
import { LogTable } from './components/LogTable'
import { ActivityPanel } from './components/ActivityPanel'
import './timelog.css'

export function TimelogApp() {
  const { logs, projects, loading, selectedMonth, setSelectedMonth, addLog, cloneLog, updateLog, deleteLog, addProject } = useLogs()
  const [clock, setClock] = useState('')
  const [dateLabel, setDateLabel] = useState('')
  const [activeCol, setActiveCol] = useState(0)
  const deckRef = useRef<HTMLDivElement>(null)

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
    const work = logs.filter(l => l.cat !== 'leave')
    return {
      todayHrs: work.filter(l => new Date(l.start).toDateString() === todayStr).reduce((s, l) => s + l.hrs, 0),
      weekHrs: work.filter(l => new Date(l.start) >= weekStart).reduce((s, l) => s + l.hrs, 0),
      allHrs: work.reduce((s, l) => s + l.hrs, 0),
      leaveHrs: logs.filter(l => l.cat === 'leave').reduce((s, l) => s + l.hrs, 0),
    }
  }, [logs])

  // Track scroll position to update active column indicator
  const handleScroll = useCallback(() => {
    const deck = deckRef.current
    if (!deck) return
    const scrollLeft = deck.scrollLeft
    const colWidth = deck.offsetWidth
    setActiveCol(Math.round(scrollLeft / colWidth))
  }, [])

  const scrollToCol = useCallback((col: number) => {
    const deck = deckRef.current
    if (!deck) return
    deck.scrollTo({ left: col * deck.offsetWidth, behavior: 'smooth' })
  }, [])

  return (
    <>
      {/* Column indicator dots */}
      <div className="tl-deck-nav">
        <button
          className={`tl-deck-dot ${activeCol === 0 ? 'active' : ''}`}
          onClick={() => scrollToCol(0)}
        >
          TIMELOG
        </button>
        <button
          className={`tl-deck-dot ${activeCol === 1 ? 'active' : ''}`}
          onClick={() => scrollToCol(1)}
        >
          ACTIVITY
        </button>
      </div>

      <div className="tl-deck" ref={deckRef} onScroll={handleScroll}>
        {/* Column 1: Timelog */}
        <div className="tl-deck-col">
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
              projects={projects}
              loading={loading}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              onDelete={deleteLog}
              onEdit={updateLog}
              onClone={cloneLog}
            />
          </div>
        </div>

        {/* Column 2: Activity Log */}
        <div className="tl-deck-col">
          <div className="tl-container">
            <ActivityPanel />
          </div>
        </div>
      </div>
    </>
  )
}
