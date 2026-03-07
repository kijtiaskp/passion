import { useMemo, useState } from 'react'
import { format, getDaysInMonth } from 'date-fns'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { FinanceMonth, Expense } from '../types'
import { fmt, sumBy } from '../../../utils/format'

interface Props {
  data: FinanceMonth
}

function useFinanceSummary(data: FinanceMonth) {
  const txIncome = sumBy(data.expenses.filter(e => e.txType === 'income'), e => e.amount)
  const totalIncome = data.income.salary + data.income.carryOver + txIncome

  const txExpense = sumBy(data.expenses.filter(e => (e.txType || 'expense') === 'expense'), e => e.amount)
  const totalDebtsOwe = sumBy(data.debts.filter(d => !d.paid && (d.direction || 'owe') === 'owe'), d => d.amount)
  const totalLoans = sumBy(data.homeLoan, l => l.amount)
  const totalExpense = txExpense + totalDebtsOwe + totalLoans

  const totalSavings = sumBy(data.savings, sv => sv.amount)
  const totalDebtsLent = sumBy(data.debts.filter(d => !d.paid && d.direction === 'lent'), d => d.amount)
  const totalAssets = sumBy(data.bankBalances ?? [], b => b.amount)
  const netBalance = totalAssets + totalIncome - totalExpense - totalSavings

  return { totalIncome, totalExpense, totalSavings, totalDebtsLent, totalAssets, netBalance }
}

type Period = 'day' | 'week' | 'month' | 'year'
const PERIOD_LABELS: Record<Period, string> = { day: 'วัน', week: 'สัปดาห์', month: 'เดือน', year: 'ปี' }

const MONTH_NAMES = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

function pad2(n: number) { return String(n).padStart(2, '0') }

function buildAllSlots(month: string, period: Period): { key: string; label: string }[] {
  const [y, m] = month.split('-').map(Number)
  if (period === 'day') {
    const days = getDaysInMonth(new Date(y, m - 1))
    return Array.from({ length: days }, (_, i) => {
      const d = i + 1
      return { key: `${month}-${pad2(d)}`, label: `${d}` }
    })
  }
  if (period === 'week') {
    const days = getDaysInMonth(new Date(y, m - 1))
    const slots: { key: string; label: string }[] = []
    for (let d = 1; d <= days; d += 7) {
      const end = Math.min(d + 6, days)
      const key = `${month}-W${Math.ceil(d / 7)}`
      slots.push({ key, label: `${d}-${end}` })
    }
    return slots
  }
  if (period === 'month') {
    return Array.from({ length: 12 }, (_, i) => ({
      key: `${y}-${pad2(i + 1)}`,
      label: MONTH_NAMES[i],
    }))
  }
  // year: show current year ± 2
  return Array.from({ length: 5 }, (_, i) => {
    const yr = y - 2 + i
    return { key: String(yr), label: String(yr) }
  })
}

function getWeekSlotKey(dateStr: string, month: string) {
  const d = parseInt(dateStr.slice(8))
  return `${month}-W${Math.ceil(d / 7)}`
}

interface BarGroup {
  income: number
  expense: number
  label: string
  future: boolean
}

function groupByPeriod(expenses: Expense[], period: Period, month: string): BarGroup[] {
  const slots = buildAllSlots(month, period)
  const buckets = new Map<string, { income: number; expense: number; label: string; future: boolean }>()

  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  for (const s of slots) {
    let future = false
    if (period === 'day') future = s.key > todayStr
    else if (period === 'week') {
      // future if the start day of this week > today
      const weekDay = (parseInt(s.label.split('-')[0]) )
      const weekStart = `${month}-${pad2(weekDay)}`
      future = weekStart > todayStr
    } else if (period === 'month') future = s.key > todayStr.slice(0, 7)
    else future = s.key > todayStr.slice(0, 4)

    buckets.set(s.key, { income: 0, expense: 0, label: s.label, future })
  }

  for (const e of expenses) {
    if (!e.date) continue
    const tx = e.txType || 'expense'
    if (tx === 'transfer') continue

    let key: string
    if (period === 'day') key = e.date
    else if (period === 'week') key = getWeekSlotKey(e.date, e.date.slice(0, 7))
    else if (period === 'month') key = e.date.slice(0, 7)
    else key = e.date.slice(0, 4)

    const b = buckets.get(key)
    if (!b) continue
    if (tx === 'income') b.income += e.amount
    else b.expense += e.amount
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
}

const COLORS: Record<string, string> = {
  income: '#00ff88',
  incomeFuture: '#1c1c2e',
  expense: '#ff4466',
  expenseFuture: '#1c1c2e',
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const income = payload.find((p: any) => p.dataKey === 'income')?.value ?? 0
  const expense = payload.find((p: any) => p.dataKey === 'expense')?.value ?? 0
  if (income === 0 && expense === 0) return null

  return (
    <div className="fn-barchart-tooltip">
      <div className="fn-barchart-tooltip-label">{label}</div>
      {income > 0 && (
        <div className="fn-barchart-tooltip-row">
          <span className="fn-dot fn-dot-income" />
          <span>รายรับ</span>
          <span className="fn-barchart-tooltip-val">{fmt(income)}</span>
        </div>
      )}
      {expense > 0 && (
        <div className="fn-barchart-tooltip-row">
          <span className="fn-dot fn-dot-expense" />
          <span>รายจ่าย</span>
          <span className="fn-barchart-tooltip-val">{fmt(expense)}</span>
        </div>
      )}
    </div>
  )
}

const BAR_KEYS = ['income', 'expense'] as const

function BarChart({ data }: Props) {
  const [period, setPeriod] = useState<Period>('day')
  const groups = useMemo(
    () => groupByPeriod(data.expenses, period, data.month),
    [data.expenses, period, data.month],
  )

  return (
    <div className="fn-barchart">
      <div className="fn-barchart-header">
        <span className="fn-barchart-title">รายรับ/รายจ่าย</span>
        <div className="fn-barchart-legend">
          <span className="fn-barchart-legend-item"><span className="fn-dot fn-dot-income" /> รายรับ</span>
          <span className="fn-barchart-legend-item"><span className="fn-dot fn-dot-expense" /> รายจ่าย</span>
        </div>
        <div className="fn-barchart-tabs">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              className={`fn-barchart-tab ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >{PERIOD_LABELS[p]}</button>
          ))}
        </div>
      </div>
      <div className="fn-barchart-body">
        {groups.length === 0 ? (
          <div className="fn-barchart-empty">ไม่มีข้อมูล</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={groups} barGap={1} barSize={10}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#555570', fontSize: 11 }}
                interval={period === 'day' ? 1 : 0}
              />
              <YAxis hide />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              {BAR_KEYS.map(key => (
                <Bar key={key} dataKey={key} radius={[4, 4, 0, 0]}>
                  {groups.map((g, i) => (
                    <Cell key={i} fill={g.future ? COLORS[`${key}Future`] : COLORS[key]} />
                  ))}
                </Bar>
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export function SummaryBar({ data }: Props) {
  const { totalIncome, totalExpense, totalSavings, totalDebtsLent, totalAssets, netBalance } = useFinanceSummary(data)

  return (
    <div className="fn-summary-wrap">
      <BarChart data={data} />
      <div className="fn-stats">
        <div className="stat-card">
          <div className="label">รายรับ</div>
          <div className="value">{fmt(totalIncome)}</div>
        </div>
        <div className="stat-card stat-card-expense">
          <div className="label">รายจ่าย</div>
          <div className="value danger">{fmt(totalExpense)}</div>
        </div>
        {totalDebtsLent > 0 && (
          <div className="stat-card">
            <div className="label">ลูกหนี้</div>
            <div className="value">{fmt(totalDebtsLent)}</div>
          </div>
        )}
        <div className="stat-card stat-card-net">
          <div className="label">คงเหลือสุทธิ</div>
          <div className={`value ${netBalance >= 0 ? 'blue' : 'danger'}`}>
            {fmt(netBalance)}
          </div>
        </div>
      </div>
    </div>
  )
}
