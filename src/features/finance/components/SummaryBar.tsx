import { useState } from 'react'
import type { FinanceMonth, Expense } from '../types'

interface Props {
  data: FinanceMonth
}

function fmt(n: number) {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

function fmtShort(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(Math.round(n))
}

function useFinanceSummary(data: FinanceMonth) {
  const txIncome = data.expenses
    .filter(e => e.txType === 'income')
    .reduce((s, e) => s + e.amount, 0)
  const totalIncome = data.income.salary + data.income.carryOver + txIncome

  const txExpense = data.expenses
    .filter(e => (e.txType || 'expense') === 'expense')
    .reduce((s, e) => s + e.amount, 0)
  const totalCreditCards = data.creditCards.reduce((s, c) => s + c.willPay, 0)
  const totalDebtsOwe = data.debts
    .filter(d => !d.paid && (d.direction || 'owe') === 'owe')
    .reduce((s, d) => s + d.amount, 0)
  const totalLoans = data.homeLoan.reduce((s, l) => s + l.amount, 0)
  const totalExpense = txExpense + totalCreditCards + totalDebtsOwe + totalLoans

  const totalSavings = data.savings.reduce((s, sv) => s + sv.amount, 0)
  const totalDebtsLent = data.debts
    .filter(d => !d.paid && d.direction === 'lent')
    .reduce((s, d) => s + d.amount, 0)
  const totalAssets = (data.bankBalances ?? []).reduce((s, b) => s + b.amount, 0)
  const netBalance = totalAssets + totalIncome - totalExpense - totalSavings

  return { totalIncome, totalExpense, totalSavings, totalDebtsLent, totalAssets, netBalance }
}

type Period = 'day' | 'week' | 'month' | 'year'
const PERIOD_LABELS: Record<Period, string> = { day: 'วัน', week: 'สัปดาห์', month: 'เดือน', year: 'ปี' }

function getWeekKey(dateStr: string) {
  const d = new Date(dateStr)
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `W${week}`
}

const MONTH_NAMES = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function pad2(n: number) { return String(n).padStart(2, '0') }

function buildAllSlots(month: string, period: Period): { key: string; label: string }[] {
  const [y, m] = month.split('-').map(Number)
  if (period === 'day') {
    const days = daysInMonth(y, m)
    return Array.from({ length: days }, (_, i) => {
      const d = i + 1
      return { key: `${month}-${pad2(d)}`, label: `${d}` }
    })
  }
  if (period === 'week') {
    const days = daysInMonth(y, m)
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

function groupByPeriod(expenses: Expense[], period: Period, month: string) {
  const slots = buildAllSlots(month, period)
  const buckets = new Map<string, { income: number; expense: number; label: string; future: boolean }>()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`

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

interface BarGroup {
  income: number
  expense: number
  label: string
  future: boolean
}

function BarChart({ data }: Props) {
  const [period, setPeriod] = useState<Period>('day')
  const groups: BarGroup[] = groupByPeriod(data.expenses, period, data.month)
  const max = Math.max(...groups.flatMap(g => [g.income, g.expense]), 1)

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
          <div className="fn-barchart-bars">
            {groups.map((g, i) => (
              <div key={i} className={`fn-barchart-col ${g.future ? 'fn-barchart-future' : ''}`}>
                <div className="fn-barchart-pair">
                  <div className="fn-barchart-bar-wrap" title={`รายรับ ${fmt(g.income)}`}>
                    <div
                      className="fn-barchart-bar fn-barchart-bar-income"
                      style={{ height: `${(g.income / max) * 100}%` }}
                    />
                    {g.income > 0 && <span className="fn-barchart-bar-val">{fmtShort(g.income)}</span>}
                  </div>
                  <div className="fn-barchart-bar-wrap" title={`รายจ่าย ${fmt(g.expense)}`}>
                    <div
                      className="fn-barchart-bar fn-barchart-bar-expense"
                      style={{ height: `${(g.expense / max) * 100}%` }}
                    />
                    {g.expense > 0 && <span className="fn-barchart-bar-val">{fmtShort(g.expense)}</span>}
                  </div>
                </div>
                <span className="fn-barchart-label">{g.label}</span>
              </div>
            ))}
          </div>
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
          <div className="label">สินทรัพย์ต้นเดือน</div>
          <div className="value">{fmt(totalAssets)}</div>
        </div>
        <div className="stat-card">
          <div className="label">รายรับ</div>
          <div className="value">{fmt(totalIncome)}</div>
        </div>
        <div className="stat-card">
          <div className="label">รายจ่าย</div>
          <div className="value danger">{fmt(totalExpense)}</div>
        </div>
        <div className="stat-card">
          <div className="label">เงินออม</div>
          <div className="value blue">{fmt(totalSavings)}</div>
        </div>
        {totalDebtsLent > 0 && (
          <div className="stat-card">
            <div className="label">ลูกหนี้</div>
            <div className="value">{fmt(totalDebtsLent)}</div>
          </div>
        )}
        <div className="stat-card">
          <div className="label">คงเหลือสุทธิ</div>
          <div className={`value ${netBalance >= 0 ? '' : 'danger'}`}>
            {fmt(netBalance)}
          </div>
        </div>
      </div>
    </div>
  )
}
