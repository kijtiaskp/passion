import { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react'
import './App.css'

// ── Types ──────────────────────────────────
interface LogEntry {
  id: number
  task: string
  cat: string
  project: string
  start: string
  end: string
  hrs: number
}

type Category = 'dev' | 'meeting' | 'design' | 'review' | 'other'

const catLabels: Record<Category, string> = {
  dev: 'Development',
  meeting: 'Meeting',
  design: 'Design',
  review: 'Review',
  other: 'Other',
}

const categories: { value: Category; label: string }[] = [
  { value: 'dev', label: 'Development' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'design', label: 'Design' },
  { value: 'review', label: 'Review' },
  { value: 'other', label: 'Other' },
]

const filterOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'dev', label: 'Dev' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'design', label: 'Design' },
  { value: 'review', label: 'Review' },
  { value: 'other', label: 'Other' },
]

// ── SVG Icons ──────────────────────────────
const Icons = {
  monitor: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
  ),
  calendar: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  pen: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
  ),
  search: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  ),
  file: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  ),
  folder: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
  ),
  calSmall: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 5 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  clipboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  play: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
  ),
  stop: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
  ),
  download: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  ),
  clock: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
}

const catIcons: Record<Category, JSX.Element> = {
  dev: Icons.monitor,
  meeting: Icons.calendar,
  design: Icons.pen,
  review: Icons.search,
  other: Icons.file,
}

// ── Helpers ────────────────────────────────
function formatHrs(h: number): string {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}h ${String(mm).padStart(2, '0')}m`
}

function formatDays(h: number): string {
  return (h / 8).toFixed(2)
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

function getInitialTime(): { start: string; end: string } {
  const now = new Date()
  const end = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const s = new Date(now.getTime() - 3600000)
  const start = `${String(s.getHours()).padStart(2, '0')}:${String(s.getMinutes()).padStart(2, '0')}`
  return { start, end }
}

function useLocalStorage<T>(key: string, initial: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initial
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

// ── App ────────────────────────────────────
function App() {
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('timelogs', [])
  const [projects, setProjects] = useLocalStorage<string[]>('tl_projects', [])

  const [clock, setClock] = useState('')
  const [dateLabel, setDateLabel] = useState('')

  const [selectedProject, setSelectedProject] = useState('')
  const [taskInput, setTaskInput] = useState('')
  const [catInput, setCatInput] = useState<Category>('dev')
  const [startTime, setStartTime] = useState(() => getInitialTime().start)
  const [endTime, setEndTime] = useState(() => getInitialTime().end)

  const [showAddProject, setShowAddProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  const [timerStart, setTimerStart] = useState<Date | null>(null)
  const [timerDisplay, setTimerDisplay] = useState('00:00:00')
  const [timerTask, setTimerTask] = useState('')
  const [timerProject, setTimerProject] = useState('')

  const [currentFilter, setCurrentFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const newProjectInputRef = useRef<HTMLInputElement>(null)

  // ── Clock ──────────────────────────
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

  // ── Timer interval ─────────────────
  useEffect(() => {
    if (timerStart) {
      timerIntervalRef.current = setInterval(() => {
        const d = Math.floor((Date.now() - timerStart.getTime()) / 1000)
        setTimerDisplay(
          `${String(Math.floor(d / 3600)).padStart(2, '0')}:${String(Math.floor((d % 3600) / 60)).padStart(2, '0')}:${String(d % 60).padStart(2, '0')}`
        )
      }, 1000)
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [timerStart])

  // ── Keyboard shortcuts for add project ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && showAddProject) saveNewProject()
      if (e.key === 'Escape' && showAddProject) {
        setShowAddProject(false)
        setNewProjectName('')
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  })

  // ── Focus new project input ────────
  useEffect(() => {
    if (showAddProject) {
      setTimeout(() => newProjectInputRef.current?.focus(), 50)
    }
  }, [showAddProject])

  // ── Add log ────────────────────────
  const addLog = useCallback((task: string, cat: string, project: string, start: Date, end: Date, hrs: number) => {
    const entry: LogEntry = {
      id: Date.now(),
      task,
      cat,
      project: project || '',
      start: start.toISOString(),
      end: end.toISOString(),
      hrs: Math.round(hrs * 100) / 100,
    }
    setLogs(prev => [entry, ...prev])
  }, [setLogs])

  // ── Manual entry ───────────────────
  const addManualEntry = () => {
    if (!taskInput.trim()) { alert('กรุณากรอกชื่องาน'); return }
    if (!startTime || !endTime) { alert('กรุณาเลือกเวลาเริ่มและสิ้นสุด'); return }
    const today = new Date().toISOString().slice(0, 10)
    const start = new Date(`${today}T${startTime}`)
    const end = new Date(`${today}T${endTime}`)
    if (end <= start) { alert('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม'); return }
    addLog(taskInput.trim(), catInput, selectedProject, start, end, (end.getTime() - start.getTime()) / 3600000)
    setTaskInput('')
    const init = getInitialTime()
    setStartTime(init.start)
    setEndTime(init.end)
  }

  // ── Timer toggle ───────────────────
  const toggleTimer = () => {
    if (!timerStart) {
      const task = taskInput.trim() || 'งานไม่ระบุชื่อ'
      setTimerTask(task)
      setTimerProject(selectedProject)
      setTimerStart(new Date())
      setTimerDisplay('00:00:00')
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      const end = new Date()
      addLog(timerTask, catInput, timerProject, timerStart, end, (end.getTime() - timerStart.getTime()) / 3600000)
      setTimerStart(null)
      setTimerDisplay('00:00:00')
      setTimerTask('')
      setTimerProject('')
    }
  }

  // ── Delete log ─────────────────────
  const deleteLog = (id: number) => {
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  // ── Save new project ──────────────
  const saveNewProject = () => {
    const val = newProjectName.trim()
    if (!val) return
    if (projects.includes(val)) { alert('มีโปรเจคนี้อยู่แล้ว'); return }
    setProjects(prev => [...prev, val])
    setSelectedProject(val)
    setNewProjectName('')
    setShowAddProject(false)
  }

  // ── Export CSV ─────────────────────
  const exportCSV = () => {
    const rows = [['Project', 'Task', 'Category', 'Start', 'End', 'Hours', 'Days(8h=1day)']]
    filtered.forEach(l => rows.push([
      `"${l.project || ''}"`, `"${l.task}"`, catLabels[l.cat as Category],
      new Date(l.start).toLocaleString('th-TH'), new Date(l.end).toLocaleString('th-TH'),
      String(l.hrs), formatDays(l.hrs),
    ]))
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(r => r.join(',')).join('\n')
    a.download = `timelog_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  // ── Stats ──────────────────────────
  const stats = useMemo(() => {
    const now = new Date()
    const todayStr = now.toDateString()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())

    const todayHrs = logs.filter(l => new Date(l.start).toDateString() === todayStr).reduce((s, l) => s + l.hrs, 0)
    const weekHrs = logs.filter(l => new Date(l.start) >= weekStart).reduce((s, l) => s + l.hrs, 0)
    const allHrs = logs.reduce((s, l) => s + l.hrs, 0)

    return { todayHrs, weekHrs, allHrs }
  }, [logs])

  // ── Filter ─────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return logs.filter(l => {
      const matchCat = currentFilter === 'all' || l.cat === currentFilter
      const matchQ = l.task.toLowerCase().includes(q) || (l.project || '').toLowerCase().includes(q)
      return matchCat && matchQ
    })
  }, [logs, currentFilter, searchQuery])

  // ── Group by date ──────────────────
  const grouped = useMemo(() => {
    const groups: Record<string, LogEntry[]> = {}
    filtered.forEach(l => {
      const d = formatDate(l.start)
      if (!groups[d]) groups[d] = []
      groups[d].push(l)
    })
    return groups
  }, [filtered])

  const isRunning = timerStart !== null
  const todayProgressPct = Math.min(stats.todayHrs / 8 * 100, 100)

  return (
    <div className="container">
      {/* Header */}
      <header>
        <div className="logo">TIME<span>LOG</span></div>
        <div className="live-clock">
          <span className="time-big">{clock}</span>
          <span>{dateLabel}</span>
        </div>
      </header>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <div className="label">วันนี้</div>
          <div className="value">{formatHrs(stats.todayHrs)}</div>
          <div className="stat-sub">= {formatDays(stats.todayHrs)} วัน</div>
        </div>
        <div className="stat-card">
          <div className="label">สัปดาห์นี้</div>
          <div className="value blue">{formatHrs(stats.weekHrs)}</div>
          <div className="stat-sub">= {formatDays(stats.weekHrs)} วัน</div>
        </div>
        <div className="stat-card">
          <div className="label">รวมทั้งหมด</div>
          <div className="value warn">{formatHrs(stats.allHrs)}</div>
          <div className="stat-sub">= {formatDays(stats.allHrs)} วัน</div>
        </div>
      </div>

      {/* Timesheet bar */}
      <div className="timesheet-bar">
        <div className="ts-left">
          <span className="ts-icon">{Icons.clipboard}</span>
          <span className="ts-label">Timesheet วันนี้</span>
          <div className="ts-progress-wrap">
            <div className="ts-progress-track">
              <div
                className={`ts-progress-fill${stats.todayHrs > 8 ? ' over' : ''}`}
                style={{ width: `${todayProgressPct}%` }}
              />
            </div>
            <span className="ts-progress-text">{formatHrs(stats.todayHrs)} / 8h</span>
          </div>
        </div>
        <div className="ts-right">
          <div className={`ts-days-big${stats.todayHrs > 8 ? ' over' : ''}`}>
            {formatDays(stats.todayHrs)} <span>วัน</span>
          </div>
          <div className="ts-note">8h = 1 วัน</div>
        </div>
      </div>

      {/* Input panel */}
      <div className="input-panel">
        <div className="input-row">
          {/* Project */}
          <div className="field">
            <label>โปรเจค</label>
            <div className="project-select-wrap">
              <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
                <option value="">— ไม่ระบุ —</option>
                {projects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button
                className="btn-icon-sm"
                onClick={() => { setShowAddProject(!showAddProject); setNewProjectName('') }}
                title="เพิ่มโปรเจคใหม่"
              >
                {Icons.plus}
              </button>
            </div>
            <div className={`add-project-form${showAddProject ? ' open' : ''}`}>
              <input
                ref={newProjectInputRef}
                type="text"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                placeholder="ชื่อโปรเจคใหม่..."
                maxLength={60}
              />
              <button className="btn-save-proj" onClick={saveNewProject}>บันทึก</button>
              <button className="btn-cancel-proj" onClick={() => { setShowAddProject(false); setNewProjectName('') }}>ยกเลิก</button>
            </div>
          </div>

          {/* Task */}
          <div className="field">
            <label>งาน / Task</label>
            <input type="text" value={taskInput} onChange={e => setTaskInput(e.target.value)} placeholder="ชื่องานที่ทำ..." />
          </div>

          {/* Category */}
          <div className="field">
            <label>หมวดหมู่</label>
            <select value={catInput} onChange={e => setCatInput(e.target.value as Category)}>
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Start */}
          <div className="field">
            <label>เริ่ม</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>

          {/* End */}
          <div className="field">
            <label>สิ้นสุด</label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>

          <button className="btn btn-primary" onClick={addManualEntry}>
            {Icons.plus}
            เพิ่ม
          </button>
        </div>

        {/* Timer row */}
        <div className="timer-row">
          <div className={`timer-display${isRunning ? ' running' : ''}`}>{timerDisplay}</div>
          <div style={{ flex: 1 }}>
            <div className="timer-label">
              {isRunning
                ? `${timerProject ? `[${timerProject}] ` : ''}"${timerTask}"`
                : 'พร้อมจับเวลา'}
            </div>
          </div>
          <button className={`btn btn-clock${isRunning ? ' running' : ''}`} onClick={toggleTimer}>
            {isRunning ? Icons.stop : Icons.play}
            <span>{isRunning ? 'หยุด' : 'เริ่ม'}</span>
          </button>
        </div>
      </div>

      {/* Filter & search */}
      <div className="filter-bar">
        {filterOptions.map(f => (
          <button
            key={f.value}
            className={`filter-btn${currentFilter === f.value ? ' active' : ''}`}
            onClick={() => setCurrentFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
        <input
          className="search-box"
          type="text"
          placeholder="ค้นหา..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button className="export-btn" onClick={exportCSV}>
          {Icons.download}
          Export CSV
        </button>
      </div>

      {/* Table */}
      <table className="log-table">
        <thead>
          <tr>
            <th>โปรเจค</th>
            <th>งาน</th>
            <th>หมวดหมู่</th>
            <th>เริ่ม</th>
            <th>สิ้นสุด</th>
            <th>ระยะเวลา</th>
            <th>วัน</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={8} className="empty-state">
                <div className="icon">{Icons.clock}</div>
                ยังไม่มีรายการ — เพิ่มงานหรือกดเริ่มจับเวลาได้เลย
              </td>
            </tr>
          ) : (
            Object.entries(grouped).map(([date, items]) => {
              const dayTotal = items.reduce((s, i) => s + i.hrs, 0)
              return (
                <Fragment key={date}>
                  <tr className="date-header">
                    <td colSpan={8}>
                      {Icons.calSmall}{date} — รวม {formatHrs(dayTotal)}{' '}
                      <span style={{ color: 'var(--muted)', fontSize: 11 }}>({formatDays(dayTotal)} วัน)</span>
                    </td>
                  </tr>
                  {items.map(l => (
                    <tr key={l.id}>
                      <td>
                        {l.project ? (
                          <span className="project-badge">{Icons.folder}{l.project}</span>
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>—</span>
                        )}
                      </td>
                      <td className="task-name">{l.task}</td>
                      <td>
                        <span className={`tag tag-${l.cat}`}>
                          {catIcons[l.cat as Category]} {catLabels[l.cat as Category]}
                        </span>
                      </td>
                      <td className="time-mono">{formatTime(l.start)}</td>
                      <td className="time-mono">{formatTime(l.end)}</td>
                      <td className="duration-mono">{formatHrs(l.hrs)}</td>
                      <td className="days-mono">{formatDays(l.hrs)}</td>
                      <td>
                        <button className="delete-btn" onClick={() => deleteLog(l.id)}>
                          {Icons.trash}
                        </button>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default App
