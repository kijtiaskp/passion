import { useState, useMemo, Fragment } from 'react'
import { Icons } from '../../../components/icons'
import { catLabels, catIcons, filterOptions } from '../constants'
import { formatHrs, formatDays, formatTime, formatDate } from '../utils'
import type { LogEntry, Category } from '../types'

interface Props {
  logs: LogEntry[]
  loading: boolean
  selectedMonth: string
  onMonthChange: (month: string) => void
  onDelete: (id: number) => void
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

export function LogTable({ logs, loading, selectedMonth, onMonthChange, onDelete }: Props) {
  const [currentFilter, setCurrentFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

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

  const isCurrentMonth = selectedMonth === new Date().toISOString().slice(0, 7)

  return (
    <>
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
                        <button className="delete-btn" onClick={() => onDelete(l.id)}>
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
    </>
  )
}
