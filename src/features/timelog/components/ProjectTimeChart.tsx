import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts'
import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  isWithinInterval,
} from 'date-fns'
import { th } from 'date-fns/locale'
import type { LogEntry } from '../types'
import { formatHrs } from '../utils'

const COLORS = [
  '#00ff88', '#00c9ff', '#b464ff', '#ff4466', '#fab387',
  '#89b4fa', '#f9e2af', '#a6e3a1', '#94e2d5', '#f38ba8',
  '#74c7ec', '#eba0ac',
]

type Period = 'day' | 'week' | 'month' | 'year'

const periodLabels: Record<Period, string> = {
  day: 'วัน',
  week: 'สัปดาห์',
  month: 'เดือน',
  year: 'ปี',
}

interface Props {
  logs: LogEntry[]
  selectedMonth: string // yyyy-MM
}

function getRange(period: Period, selectedMonth: string) {
  const [y, m] = selectedMonth.split('-').map(Number)
  const monthStart = new Date(y, m - 1, 1)
  const monthEnd = endOfMonth(monthStart)

  switch (period) {
    case 'day':
      return { start: monthStart, end: monthEnd }
    case 'week':
      return { start: startOfWeek(monthStart), end: endOfWeek(monthEnd) }
    case 'month':
      return { start: startOfYear(monthStart), end: endOfYear(monthStart) }
    case 'year':
      // Show last 3 years
      return { start: startOfYear(new Date(y - 2, 0, 1)), end: endOfYear(monthStart) }
  }
}

function getBuckets(period: Period, start: Date, end: Date) {
  switch (period) {
    case 'day':
      return eachDayOfInterval({ start, end }).map(d => ({
        date: d,
        start: startOfDay(d),
        end: endOfDay(d),
        label: format(d, 'd', { locale: th }),
      }))
    case 'week': {
      const weeks = eachWeekOfInterval({ start, end })
      return weeks.map((w, i) => ({
        date: w,
        start: startOfWeek(w),
        end: endOfWeek(w),
        label: `W${i + 1}`,
      }))
    }
    case 'month':
      return eachMonthOfInterval({ start, end }).map(d => ({
        date: d,
        start: startOfMonth(d),
        end: endOfMonth(d),
        label: format(d, 'MMM', { locale: th }),
      }))
    case 'year':
      return eachMonthOfInterval({ start, end })
        .filter((d, _, arr) => {
          // Keep only January of each year to get unique years
          return d.getMonth() === 0
        })
        .map(d => {
          const yr = d.getFullYear()
          return {
            date: d,
            start: startOfYear(d),
            end: endOfYear(d),
            label: String(yr + 543), // พ.ศ.
          }
        })
  }
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s: number, p: any) => s + (p.value || 0), 0)
  return (
    <div className="tl-chart-tooltip">
      <div className="tl-chart-tooltip-label">{label}</div>
      {payload.filter((p: any) => p.value > 0).map((p: any) => (
        <div key={p.dataKey} className="tl-chart-tooltip-row">
          <span className="tl-chart-tooltip-dot" style={{ background: p.fill }} />
          <span>{p.dataKey}</span>
          <span className="tl-chart-tooltip-val">{formatHrs(p.value)}</span>
        </div>
      ))}
      <div className="tl-chart-tooltip-total">
        รวม {formatHrs(total)}
      </div>
    </div>
  )
}

export function ProjectTimeChart({ logs, selectedMonth }: Props) {
  const [period, setPeriod] = useState<Period>('day')

  const { chartData, projectList } = useMemo(() => {
    const workLogs = logs.filter(l => l.cat !== 'leave')

    // Collect unique projects
    const projectSet = new Set<string>()
    for (const l of workLogs) {
      projectSet.add(l.project || 'ไม่ระบุ')
    }
    const projectList = [...projectSet].sort()

    const { start, end } = getRange(period, selectedMonth)
    const buckets = getBuckets(period, start, end)

    const chartData = buckets.map(bucket => {
      const row: Record<string, any> = { name: bucket.label }
      for (const proj of projectList) {
        row[proj] = 0
      }
      for (const l of workLogs) {
        const logDate = new Date(l.start)
        if (isWithinInterval(logDate, { start: bucket.start, end: bucket.end })) {
          const proj = l.project || 'ไม่ระบุ'
          row[proj] = (row[proj] || 0) + l.hrs
        }
      }
      // Round values
      for (const proj of projectList) {
        row[proj] = Math.round(row[proj] * 100) / 100
      }
      return row
    })

    return { chartData, projectList }
  }, [logs, period, selectedMonth])

  const totalByProject = useMemo(() => {
    const totals = new Map<string, number>()
    for (const row of chartData) {
      for (const proj of projectList) {
        totals.set(proj, (totals.get(proj) || 0) + (row[proj] || 0))
      }
    }
    return [...totals.entries()]
      .map(([name, hrs]) => ({ name, hrs }))
      .sort((a, b) => b.hrs - a.hrs)
  }, [chartData, projectList])

  const grandTotal = totalByProject.reduce((s, p) => s + p.hrs, 0)

  return (
    <div className="tl-chart">
      <div className="tl-chart-header">
        <div className="tl-chart-title">PROJECT TIME</div>
        <div className="tl-chart-tabs">
          {(['day', 'week', 'month', 'year'] as Period[]).map(p => (
            <button
              key={p}
              className={`tl-chart-tab ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {projectList.length === 0 ? (
        <div className="tl-chart-empty">ไม่มีข้อมูล</div>
      ) : (
        <>
          <div className="tl-chart-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'var(--muted)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--muted)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}h`}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                {projectList.map((proj, i) => (
                  <Bar
                    key={proj}
                    dataKey={proj}
                    stackId="a"
                    fill={COLORS[i % COLORS.length]}
                    radius={i === projectList.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="tl-chart-legend">
            {totalByProject.map((p, i) => {
              const colorIdx = projectList.indexOf(p.name)
              const pct = grandTotal > 0 ? ((p.hrs / grandTotal) * 100).toFixed(1) : '0.0'
              return (
                <div key={p.name} className="tl-chart-legend-item">
                  <span className="tl-chart-legend-dot" style={{ background: COLORS[colorIdx % COLORS.length] }} />
                  <span className="tl-chart-legend-name">{p.name}</span>
                  <span className="tl-chart-legend-pct">{pct}%</span>
                  <span className="tl-chart-legend-val">{formatHrs(p.hrs)}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
