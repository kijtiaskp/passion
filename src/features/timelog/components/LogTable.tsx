import { useState, useMemo, Fragment } from 'react'
import { Icons } from '../../../components/icons'
import { catLabels, catIcons, filterOptions, categories } from '../constants'
import { formatHrs, formatDays, formatTime, formatDate } from '../utils'
import type { LogEntry, Category } from '../types'

interface Props {
  logs: LogEntry[]
  loading: boolean
  selectedMonth: string
  onMonthChange: (month: string) => void
  onDelete: (id: number) => void
  onEdit: (entry: LogEntry) => void
  onClone: (entry: LogEntry) => void
  projects: string[]
}

function EditModal({ entry, projects, onSave, onClose }: {
  entry: LogEntry
  projects: string[]
  onSave: (updated: LogEntry) => void
  onClose: () => void
}) {
  const startDt = new Date(entry.start)
  const endDt = new Date(entry.end)
  const toTime = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

  const [project, setProject] = useState(entry.project || '')
  const [task, setTask] = useState(entry.task)
  const [cat, setCat] = useState<Category>(entry.cat as Category)
  const [date, setDate] = useState(entry.start.slice(0, 10))
  const [startTime, setStartTime] = useState(toTime(startDt))
  const [endTime, setEndTime] = useState(toTime(endDt))

  const handleSave = () => {
    if (!task.trim()) { alert('กรุณากรอกชื่องาน'); return }
    const start = new Date(`${date}T${startTime}`)
    const end = new Date(`${date}T${endTime}`)
    if (end <= start) { alert('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม'); return }
    const hrs = Math.round((end.getTime() - start.getTime()) / 36000) / 100
    onSave({ ...entry, project, task: task.trim(), cat, start: start.toISOString(), end: end.toISOString(), hrs })
    onClose()
  }

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={e => e.stopPropagation()}>
        <div className="edit-modal-header">
          <span>{Icons.pen} แก้ไขรายการ</span>
          <button className="edit-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="edit-modal-body">
          <div className="edit-field">
            <label>โปรเจค</label>
            <select value={project} onChange={e => setProject(e.target.value)}>
              <option value="">— ไม่ระบุ —</option>
              {projects.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="edit-field">
            <label>งาน / Task</label>
            <input type="text" value={task} onChange={e => setTask(e.target.value)} />
          </div>
          <div className="edit-field">
            <label>หมวดหมู่</label>
            <select value={cat} onChange={e => setCat(e.target.value as Category)}>
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="edit-field-row">
            <div className="edit-field">
              <label>วันที่</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="edit-field">
              <label>เริ่ม</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div className="edit-field">
              <label>สิ้นสุด</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="edit-modal-footer">
          <button className="btn btn-primary" onClick={handleSave}>บันทึก</button>
          <button className="btn-cancel-proj" style={{ marginLeft: 8 }} onClick={onClose}>ยกเลิก</button>
        </div>
      </div>
    </div>
  )
}

function prevMonth(m: string) {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(y, mo - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(m: string) {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(y, mo, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatMonth(m: string) {
  const [y, mo] = m.split('-').map(Number)
  return new Date(y, mo - 1, 1).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
}

export function LogTable({ logs, loading, selectedMonth, onMonthChange, onDelete, onEdit, onClone, projects }: Props) {
  const [currentFilter, setCurrentFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null)

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return logs.filter(l => {
      const matchCat = currentFilter === 'all' || l.cat === currentFilter
      const matchQ = l.task.toLowerCase().includes(q) || (l.project || '').toLowerCase().includes(q)
      return matchCat && matchQ
    })
  }, [logs, currentFilter, searchQuery])

  const grouped = useMemo(() => {
    const groups: Record<string, LogEntry[]> = {}
    filtered.forEach(l => {
      const d = formatDate(l.start)
      if (!groups[d]) groups[d] = []
      groups[d].push(l)
    })
    return groups
  }, [filtered])

  const exportCSV = () => {
    const header = ['No.', 'Date', 'Type', 'Task', 'Manday', '']
    const rows: string[][] = [header]
    const sorted = [...filtered].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    sorted.forEach((l, i) => {
      const date = new Date(l.start)
      const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      const type = catLabels[l.cat as Category]
      const task = `Work on ${l.project || ''}${l.task ? ' ' + l.task : ' (no comment provided)'}`
      const manday = formatDays(l.hrs)
      const hrs = String(l.hrs)
      rows.push([String(i + 1), dateStr, type, task, manday, hrs])
    })
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    a.download = `timelog_${selectedMonth}.csv`
    a.click()
  }

  const isCurrentMonth = selectedMonth === new Date().toISOString().slice(0, 7)

  return (
    <>
      {editingEntry && (
        <EditModal
          entry={editingEntry}
          projects={projects}
          onSave={onEdit}
          onClose={() => setEditingEntry(null)}
        />
      )}
      <div className="filter-bar">
        {/* Month navigator */}
        <div className="month-nav">
          <button className="month-nav-btn" onClick={() => onMonthChange(prevMonth(selectedMonth))}>◀</button>
          <span className="month-nav-label">{formatMonth(selectedMonth)}</span>
          <button
            className="month-nav-btn"
            onClick={() => onMonthChange(nextMonth(selectedMonth))}
            disabled={isCurrentMonth}
          >▶</button>
        </div>

        <div className="filter-divider" />

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
          {loading ? (
            <tr>
              <td colSpan={8} className="empty-state">
                <div className="icon" style={{ opacity: 0.4 }}>{Icons.clock}</div>
                กำลังโหลด...
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={8} className="empty-state">
                <div className="icon">{Icons.clock}</div>
                ไม่มีรายการใน {formatMonth(selectedMonth)}
              </td>
            </tr>
          ) : (
            Object.entries(grouped).map(([date, items]) => {
              const workTotal = items.filter(i => i.cat !== 'leave').reduce((s, i) => s + i.hrs, 0)
              const leaveTotal = items.filter(i => i.cat === 'leave').reduce((s, i) => s + i.hrs, 0)
              return (
                <Fragment key={date}>
                  <tr className="date-header">
                    <td colSpan={8}>
                      {Icons.calSmall}{date} — รวม {formatHrs(workTotal)}{' '}
                      <span style={{ color: 'var(--muted)', fontSize: 11 }}>({formatDays(workTotal)} วัน)</span>
                      {leaveTotal > 0 && (
                        <span className="date-header-leave">ลา {formatHrs(leaveTotal)}</span>
                      )}
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
                        <div style={{ display: 'flex', gap: 2 }}>
                          <button className="edit-btn" title="แก้ไข" onClick={() => setEditingEntry(l)}>
                            {Icons.pen}
                          </button>
                          <button className="copy-btn" title="คัดลอกงานนี้ (วันนี้)" onClick={() => onClone(l)}>
                            {Icons.copy}
                          </button>
                          <button className="delete-btn" onClick={() => onDelete(l.id)}>
                            {Icons.trash}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              )
            })
          )}
        </tbody>
      </table>
    </>
  )
}
