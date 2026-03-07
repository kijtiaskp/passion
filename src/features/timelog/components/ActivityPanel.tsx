import { useState, useMemo } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { th } from 'date-fns/locale'
import { Icons } from '../../../components/icons'
import { useActivities } from '../api/use-activities'
import { activityCategories, activityCatIcons, activityFilterOptions, moodOptions, moodIcons } from '../constants'
import { formatTime } from '../utils'
import type { ActivityCategory, Mood } from '../types'

function todayStr() {
  return format(new Date(), 'yyyy-MM-dd')
}

function nowTimeStr() {
  return format(new Date(), 'HH:mm')
}

export function ActivityPanel() {
  const { activities, loading, selectedDate, setSelectedDate, addActivity, deleteActivity } = useActivities()

  // Form state
  const [text, setText] = useState('')
  const [cat, setCat] = useState<ActivityCategory>('food')
  const [mood, setMood] = useState<Mood>('good')
  const [time, setTime] = useState(nowTimeStr)

  // Filter
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return activities
    return activities.filter(a => a.cat === filter)
  }, [activities, filter])

  const handleSubmit = () => {
    if (!text.trim()) return
    const [hh, mm] = time.split(':').map(Number)
    const dt = new Date(selectedDate)
    dt.setHours(hh, mm, 0, 0)
    addActivity(text.trim(), cat, mood, dt)
    setText('')
    setTime(nowTimeStr())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  // Date navigation
  const changeDate = (delta: number) => {
    const d = new Date(selectedDate + 'T00:00:00')
    const next = delta > 0 ? addDays(d, delta) : subDays(d, -delta)
    setSelectedDate(format(next, 'yyyy-MM-dd'))
  }

  const isToday = selectedDate === todayStr()

  const dateLabel = format(new Date(selectedDate + 'T00:00:00'), 'EEE d MMM yyyy', { locale: th })

  return (
    <div className="act-panel">
      <header className="tl-header">
        <div className="tl-logo">ACTIVITY<span>LOG</span></div>
      </header>

      {/* Date Navigator */}
      <div className="act-date-nav">
        <button className="month-nav-btn" onClick={() => changeDate(-1)}>&#8249;</button>
        <span className="month-nav-label">{dateLabel}</span>
        <button className="month-nav-btn" onClick={() => changeDate(1)} disabled={isToday}>&#8250;</button>
      </div>

      {/* Input Form */}
      <div className="act-form">
        <div className="act-form-top">
          <input
            className="act-text-input"
            type="text"
            placeholder="ทำอะไรอยู่..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="act-form-options">
          {/* Category selector */}
          <div className="act-selector">
            <span className="act-selector-label">หมวด</span>
            <div className="act-chips">
              {activityCategories.map(c => (
                <button
                  key={c.value}
                  className={`act-chip ${cat === c.value ? 'active' : ''}`}
                  onClick={() => setCat(c.value)}
                  title={c.label}
                >
                  {c.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Mood selector */}
          <div className="act-selector">
            <span className="act-selector-label">อารมณ์</span>
            <div className="act-chips">
              {moodOptions.map(m => (
                <button
                  key={m.value}
                  className={`act-chip ${mood === m.value ? 'active' : ''}`}
                  onClick={() => setMood(m.value)}
                  title={m.label}
                >
                  {m.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="act-form-bottom">
          <input
            type="time"
            className="act-time-input"
            value={time}
            onChange={e => setTime(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSubmit}>+ เพิ่ม</button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="filter-bar">
        {activityFilterOptions.map(f => (
          <button
            key={f.value}
            className={`filter-btn ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.icon && <span>{f.icon}</span>} {f.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="empty-state">กำลังโหลด...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon" style={{ fontSize: 32 }}>📝</div>
          ยังไม่มีกิจกรรม
        </div>
      ) : (
        <div className="act-feed">
          {filtered.map(a => (
            <div key={a.id} className="act-card">
              <div className="act-card-header">
                <span className="act-card-cat">{activityCatIcons[a.cat]}</span>
                <span className="act-card-mood">{moodIcons[a.mood]}</span>
                <span className="act-card-time">{formatTime(a.time)}</span>
                <button className="delete-btn" onClick={() => deleteActivity(a.id)} title="ลบ">
                  {Icons.x}
                </button>
              </div>
              <div className="act-card-text">{a.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
