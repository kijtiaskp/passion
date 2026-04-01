import { useMemo, useState } from 'react'
import { format, getDaysInMonth } from 'date-fns'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { FinanceMonth, Expense } from '../types'
import { CATEGORY_LABELS } from '../categories'
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

// ─── Shared ────────────────────────────────────────
type ChartView = 'bar' | 'pie' | 'category'
type Period = 'day' | 'week' | 'month' | 'year'
type PieMode = 'expense' | 'income'

const PERIOD_LABELS: Record<Period, string> = { day: 'วัน', week: 'สัปดาห์', month: 'เดือน', year: 'ปี' }
const MONTH_NAMES = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

function pad2(n: number) { return String(n).padStart(2, '0') }

const EXPENSE_COLORS = [
  '#ff4466', '#fab387', '#89b4fa', '#cba6f7', '#f9e2af',
  '#74c7ec', '#a6e3a1', '#f38ba8', '#eba0ac', '#94e2d5',
  '#b4befe', '#585b70', '#45475a',
]

const INCOME_COLORS = [
  '#00ff88', '#00cc6a', '#66ffb3', '#33ff99', '#00e67a',
  '#4dffa6', '#00b35c', '#80ffcc',
]

const PIE_COLORS = [
  '#00ff88', '#ff4466', '#89b4fa', '#fab387', '#a6e3a1',
  '#f9e2af', '#cba6f7', '#94e2d5', '#f38ba8', '#74c7ec',
  '#eba0ac', '#b4befe',
]

const INCOME_LABELS: Record<string, string> = {
  salary: 'เงินเดือน',
  'carry-over': 'เหลือเดือนก่อน',
}

function catLabel(key: string, side: 'income' | 'expense') {
  if (side === 'income' && INCOME_LABELS[key]) return INCOME_LABELS[key]
  return CATEGORY_LABELS[key] || 'ไม่จัดหมวด'
}

// ═══════════════════════════════════════════════════
// BAR CHART
// ═══════════════════════════════════════════════════
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
  return Array.from({ length: 5 }, (_, i) => {
    const yr = y - 2 + i
    return { key: String(yr), label: String(yr) }
  })
}

function getWeekSlotKey(dateStr: string, month: string) {
  const d = parseInt(dateStr.slice(8))
  return `${month}-W${Math.ceil(d / 7)}`
}

function buildBarData(
  expenses: Expense[],
  income: FinanceMonth['income'],
  period: Period,
  month: string,
) {
  const slots = buildAllSlots(month, period)

  const buckets = new Map<string, Record<string, any>>()
  for (const s of slots) buckets.set(s.key, { name: s.label })

  const incCats = new Set<string>()
  const expCats = new Set<string>()

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

    const cat = e.category || 'uncategorized'
    if (tx === 'income') {
      const dk = `inc:${cat}`
      b[dk] = (b[dk] || 0) + e.amount
      incCats.add(cat)
    } else {
      const dk = `exp:${cat}`
      b[dk] = (b[dk] || 0) + e.amount
      expCats.add(cat)
    }
  }

  if (period === 'month' || period === 'year') {
    const slotKey = period === 'month' ? month : month.slice(0, 4)
    const b = buckets.get(slotKey)
    if (b) {
      if (income.salary > 0) {
        b['inc:salary'] = (b['inc:salary'] || 0) + income.salary
        incCats.add('salary')
      }
      if (income.carryOver > 0) {
        b['inc:carry-over'] = (b['inc:carry-over'] || 0) + income.carryOver
        incCats.add('carry-over')
      }
    }
  }

  const chartData = [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, row]) => {
      for (const k of Object.keys(row)) {
        if (typeof row[k] === 'number') row[k] = Math.round(row[k] * 100) / 100
      }
      return row
    })

  function sortedCats(cats: Set<string>, prefix: string) {
    const totals = new Map<string, number>()
    for (const cat of cats) {
      const dk = `${prefix}:${cat}`
      let sum = 0
      for (const row of chartData) sum += row[dk] || 0
      totals.set(cat, sum)
    }
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([cat, total]) => ({ cat, total }))
  }

  return { chartData, incomeList: sortedCats(incCats, 'inc'), expenseList: sortedCats(expCats, 'exp') }
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  const incItems = payload.filter((p: any) => p.dataKey.startsWith('inc:') && p.value > 0)
  const expItems = payload.filter((p: any) => p.dataKey.startsWith('exp:') && p.value > 0)
  if (incItems.length === 0 && expItems.length === 0) return null

  const incTotal = incItems.reduce((s: number, p: any) => s + p.value, 0)
  const expTotal = expItems.reduce((s: number, p: any) => s + p.value, 0)

  return (
    <div className="fn-barchart-tooltip">
      <div className="fn-barchart-tooltip-label">{label}</div>
      {incItems.length > 0 && (
        <>
          {incItems.map((p: any) => (
            <div key={p.dataKey} className="fn-barchart-tooltip-row">
              <span className="fn-dot" style={{ background: p.fill }} />
              <span>{catLabel(p.dataKey.replace('inc:', ''), 'income')}</span>
              <span className="fn-barchart-tooltip-val">{fmt(p.value)}</span>
            </div>
          ))}
          <div className="fn-barchart-tooltip-total fn-income">รวมรับ {fmt(incTotal)}</div>
        </>
      )}
      {expItems.length > 0 && (
        <>
          {expItems.map((p: any) => (
            <div key={p.dataKey} className="fn-barchart-tooltip-row">
              <span className="fn-dot" style={{ background: p.fill }} />
              <span>{catLabel(p.dataKey.replace('exp:', ''), 'expense')}</span>
              <span className="fn-barchart-tooltip-val">{fmt(p.value)}</span>
            </div>
          ))}
          <div className="fn-barchart-tooltip-total fn-outcome">รวมจ่าย {fmt(expTotal)}</div>
        </>
      )}
    </div>
  )
}

function LegendGroup({ title, items, grand, colors, side, expenses, income }: {
  title: string
  items: { cat: string; total: number }[]
  grand: number
  colors: string[]
  side: 'income' | 'expense'
  expenses: Expense[]
  income?: FinanceMonth['income']
}) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null)

  const getDetails = (cat: string) => {
    if (side === 'income') {
      const details: { name: string; amount: number }[] = []
      if (cat === 'salary' && income?.salary) details.push({ name: 'เงินเดือน', amount: income.salary })
      if (cat === 'carry-over' && income?.carryOver) details.push({ name: 'เหลือเดือนก่อน', amount: income.carryOver })
      for (const e of expenses) {
        if (e.txType === 'income' && (e.category || 'uncategorized') === cat) {
          details.push({ name: e.name, amount: e.amount })
        }
      }
      return details
    }
    return expenses
      .filter(e => (e.txType || 'expense') === 'expense' && (e.category || 'uncategorized') === cat)
      .map(e => ({ name: e.name, amount: e.amount }))
  }

  return (
    <div className="fn-stacked-legend-group">
      <div className="fn-stacked-legend-title">{title}</div>
      {items.map((c, i) => {
        const pct = grand > 0 ? ((c.total / grand) * 100).toFixed(1) : '0.0'
        const isExpanded = expandedCat === c.cat
        const details = isExpanded ? getDetails(c.cat) : []
        return (
          <div key={c.cat}>
            <div
              className="fn-stacked-legend-item fn-stacked-legend-item-clickable"
              onClick={() => setExpandedCat(isExpanded ? null : c.cat)}
            >
              <span className="fn-dot" style={{ background: colors[i % colors.length] }} />
              <span className="fn-stacked-legend-name">{catLabel(c.cat, side)}</span>
              <span className={`fn-stacked-legend-arrow ${isExpanded ? 'expanded' : ''}`}>&#9662;</span>
              <span className="fn-stacked-legend-pct">{pct}%</span>
              <span className="fn-stacked-legend-val">{fmt(c.total)}</span>
            </div>
            {isExpanded && details.length > 0 && (
              <div className="fn-stacked-legend-details">
                {details.map((d, j) => (
                  <div key={j} className="fn-stacked-legend-detail-row">
                    <span className="fn-stacked-legend-detail-name">{d.name}</span>
                    <span className="fn-stacked-legend-detail-val">{fmt(d.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function BarChartView({ data, period }: { data: FinanceMonth; period: Period }) {
  const { chartData, incomeList, expenseList } = useMemo(
    () => buildBarData(data.expenses, data.income, period, data.month),
    [data.expenses, data.income, period, data.month],
  )

  const incGrand = incomeList.reduce((s, c) => s + c.total, 0)
  const expGrand = expenseList.reduce((s, c) => s + c.total, 0)

  return (
    <>
      <div className="fn-barchart-body">
        {chartData.length === 0 ? (
          <div className="fn-barchart-empty">ไม่มีข้อมูล</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={chartData} barGap={1} barSize={10}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#555570', fontSize: 11 }}
                interval={period === 'day' ? 1 : 0}
              />
              <YAxis hide />
              <Tooltip
                content={<BarTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              {incomeList.map((c, i) => (
                <Bar
                  key={`inc:${c.cat}`}
                  dataKey={`inc:${c.cat}`}
                  stackId="income"
                  fill={INCOME_COLORS[i % INCOME_COLORS.length]}
                  radius={i === 0 ? [2, 2, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
              {expenseList.map((c, i) => (
                <Bar
                  key={`exp:${c.cat}`}
                  dataKey={`exp:${c.cat}`}
                  stackId="expense"
                  fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]}
                  radius={i === 0 ? [2, 2, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        )}
      </div>

      {(incomeList.length > 0 || expenseList.length > 0) && (
        <div className="fn-stacked-legend">
          {incomeList.length > 0 && (
            <LegendGroup
              title="รายรับ"
              items={incomeList}
              grand={incGrand}
              colors={INCOME_COLORS}
              side="income"
              expenses={data.expenses}
              income={data.income}
            />
          )}
          {expenseList.length > 0 && (
            <LegendGroup
              title="รายจ่าย"
              items={expenseList}
              grand={expGrand}
              colors={EXPENSE_COLORS}
              side="expense"
              expenses={data.expenses}
            />
          )}
        </div>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════
// PIE CHART
// ═══════════════════════════════════════════════════
interface SliceData {
  name: string
  value: number
  percent: number
}

function buildExpensePie(expenses: Expense[]): SliceData[] {
  const items = expenses.filter(e => (e.txType || 'expense') === 'expense')
  const total = sumBy(items, e => e.amount)
  if (total === 0) return []

  const byCategory = new Map<string, number>()
  for (const e of items) {
    const cat = e.category || 'uncategorized'
    byCategory.set(cat, (byCategory.get(cat) || 0) + e.amount)
  }

  return [...byCategory.entries()]
    .map(([key, value]) => ({
      name: CATEGORY_LABELS[key] || 'ไม่จัดหมวด',
      value,
      percent: (value / total) * 100,
    }))
    .sort((a, b) => b.value - a.value)
}

function buildIncomePie(data: FinanceMonth): SliceData[] {
  const parts: { name: string; value: number }[] = []
  if (data.income.salary > 0) parts.push({ name: 'เงินเดือน', value: data.income.salary })
  if (data.income.carryOver > 0) parts.push({ name: 'เหลือเดือนก่อน', value: data.income.carryOver })

  const incomeItems = data.expenses.filter(e => e.txType === 'income')
  const byCategory = new Map<string, number>()
  for (const e of incomeItems) {
    const cat = e.category || 'uncategorized'
    const label = CATEGORY_LABELS[cat] || e.name || 'รายรับอื่นๆ'
    byCategory.set(label, (byCategory.get(label) || 0) + e.amount)
  }
  for (const [name, value] of byCategory) parts.push({ name, value })

  const total = sumBy(parts, p => p.value)
  if (total === 0) return []

  return parts
    .map(p => ({ ...p, percent: (p.value / total) * 100 }))
    .sort((a, b) => b.value - a.value)
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as SliceData
  return (
    <div className="fn-barchart-tooltip">
      <div className="fn-barchart-tooltip-label">{d.name}</div>
      <div className="fn-barchart-tooltip-row">
        <span className="fn-dot" style={{ background: payload[0].payload.fill }} />
        <span>{fmt(d.value)}</span>
        <span className="fn-barchart-tooltip-val">{d.percent.toFixed(1)}%</span>
      </div>
    </div>
  )
}

function PieChartView({ data, pieMode }: { data: FinanceMonth; pieMode: PieMode }) {
  const expenseData = useMemo(() => buildExpensePie(data.expenses), [data.expenses])
  const incomeData = useMemo(() => buildIncomePie(data), [data])

  const chartData = pieMode === 'expense' ? expenseData : incomeData
  const total = sumBy(chartData, d => d.value)

  if (chartData.length === 0) {
    return <div className="fn-barchart-empty">ไม่มีข้อมูล</div>
  }

  return (
    <div className="fn-piechart-content">
      <div className="fn-piechart-chart">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="fn-piechart-center">
          <span className="fn-piechart-center-label">{pieMode === 'expense' ? 'รวมจ่าย' : 'รวมรับ'}</span>
          <span className={`fn-piechart-center-value ${pieMode === 'expense' ? 'fn-outcome' : 'fn-income'}`}>
            {fmt(total)}
          </span>
        </div>
      </div>
      <div className="fn-piechart-legend">
        {chartData.map((d, i) => (
          <div key={d.name} className="fn-piechart-legend-item">
            <span className="fn-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="fn-piechart-legend-name">{d.name}</span>
            <span className="fn-piechart-legend-pct">{d.percent.toFixed(1)}%</span>
            <span className="fn-piechart-legend-val">{fmt(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// CATEGORY VIEW (horizontal bars)
// ═══════════════════════════════════════════════════
interface CatRow {
  key: string
  label: string
  amount: number
  percent: number
  color: string
}

function buildCategoryRows(data: FinanceMonth, mode: PieMode): CatRow[] {
  if (mode === 'expense') {
    const items = data.expenses.filter(e => (e.txType || 'expense') === 'expense')
    const total = sumBy(items, e => e.amount)
    if (total === 0) return []

    const byCategory = new Map<string, number>()
    for (const e of items) {
      const cat = e.category || 'uncategorized'
      byCategory.set(cat, (byCategory.get(cat) || 0) + e.amount)
    }

    return [...byCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([key, amount], i) => ({
        key,
        label: CATEGORY_LABELS[key] || 'ไม่จัดหมวด',
        amount,
        percent: (amount / total) * 100,
        color: EXPENSE_COLORS[i % EXPENSE_COLORS.length],
      }))
  }

  // income
  const parts: { key: string; label: string; amount: number }[] = []
  if (data.income.salary > 0) parts.push({ key: 'salary', label: 'เงินเดือน', amount: data.income.salary })
  if (data.income.carryOver > 0) parts.push({ key: 'carry-over', label: 'เหลือเดือนก่อน', amount: data.income.carryOver })

  const incomeItems = data.expenses.filter(e => e.txType === 'income')
  const byCategory = new Map<string, number>()
  for (const e of incomeItems) {
    const cat = e.category || 'uncategorized'
    byCategory.set(cat, (byCategory.get(cat) || 0) + e.amount)
  }
  for (const [cat, amount] of byCategory) {
    parts.push({ key: cat, label: CATEGORY_LABELS[cat] || 'รายรับอื่นๆ', amount })
  }

  const total = sumBy(parts, p => p.amount)
  if (total === 0) return []

  return parts
    .sort((a, b) => b.amount - a.amount)
    .map((p, i) => ({
      ...p,
      percent: (p.amount / total) * 100,
      color: INCOME_COLORS[i % INCOME_COLORS.length],
    }))
}

function CategoryView({ data, pieMode }: { data: FinanceMonth; pieMode: PieMode }) {
  const rows = useMemo(() => buildCategoryRows(data, pieMode), [data, pieMode])
  const maxAmount = rows.length > 0 ? rows[0].amount : 0

  if (rows.length === 0) {
    return <div className="fn-barchart-empty">ไม่มีข้อมูล</div>
  }

  const total = sumBy(rows, r => r.amount)

  return (
    <div className="fn-catview">
      <div className="fn-catview-total">
        <span>{pieMode === 'expense' ? 'รวมจ่าย' : 'รวมรับ'}</span>
        <span className={pieMode === 'expense' ? 'fn-outcome' : 'fn-income'}>{fmt(total)}</span>
      </div>
      {rows.map(r => (
        <div key={r.key} className="fn-catview-row">
          <div className="fn-catview-info">
            <span className="fn-dot" style={{ background: r.color }} />
            <span className="fn-catview-label">{r.label}</span>
            <span className="fn-catview-pct">{r.percent.toFixed(1)}%</span>
            <span className="fn-catview-amount">{fmt(r.amount)}</span>
          </div>
          <div className="fn-catview-bar-bg">
            <div
              className="fn-catview-bar-fill"
              style={{
                width: `${(r.amount / maxAmount) * 100}%`,
                background: r.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════
// COMBINED CARD
// ═══════════════════════════════════════════════════
function ChartCard({ data }: Props) {
  const [view, setView] = useState<ChartView>('bar')
  const [period, setPeriod] = useState<Period>('day')
  const [pieMode, setPieMode] = useState<PieMode>('expense')

  return (
    <div className="fn-barchart">
      <div className="fn-barchart-header">
        <span className="fn-barchart-title">รายรับ/รายจ่าย</span>
        <div className="fn-barchart-tabs">
          <button
            className={`fn-barchart-tab ${view === 'bar' ? 'active' : ''}`}
            onClick={() => setView('bar')}
          >แท่ง</button>
          <button
            className={`fn-barchart-tab ${view === 'pie' ? 'active' : ''}`}
            onClick={() => setView('pie')}
          >วงกลม</button>
          <button
            className={`fn-barchart-tab ${view === 'category' ? 'active' : ''}`}
            onClick={() => setView('category')}
          >หมวดหมู่</button>
        </div>

        {view === 'bar' ? (
          <div className="fn-barchart-tabs">
            {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
              <button
                key={p}
                className={`fn-barchart-tab ${period === p ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
              >{PERIOD_LABELS[p]}</button>
            ))}
          </div>
        ) : (
          <div className="fn-barchart-tabs">
            <button
              className={`fn-barchart-tab ${pieMode === 'expense' ? 'active' : ''}`}
              onClick={() => setPieMode('expense')}
            >รายจ่าย</button>
            <button
              className={`fn-barchart-tab ${pieMode === 'income' ? 'active' : ''}`}
              onClick={() => setPieMode('income')}
            >รายรับ</button>
          </div>
        )}
      </div>

      {view === 'bar' ? (
        <BarChartView data={data} period={period} />
      ) : view === 'pie' ? (
        <PieChartView data={data} pieMode={pieMode} />
      ) : (
        <CategoryView data={data} pieMode={pieMode} />
      )}
    </div>
  )
}

export function SummaryBar({ data }: Props) {
  const { totalIncome, totalExpense, totalSavings, totalDebtsLent, totalAssets, netBalance } = useFinanceSummary(data)

  return (
    <div className="fn-summary-wrap">
      <ChartCard data={data} />
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
