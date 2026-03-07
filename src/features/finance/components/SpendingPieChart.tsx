import { useMemo, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { Expense, FinanceMonth } from '../types'
import { CATEGORY_LABELS } from '../categories'
import { fmt, sumBy } from '../../../utils/format'

const COLORS = [
  '#00ff88', '#ff4466', '#89b4fa', '#fab387', '#a6e3a1',
  '#f9e2af', '#cba6f7', '#94e2d5', '#f38ba8', '#74c7ec',
  '#eba0ac', '#b4befe',
]

type ChartMode = 'expense' | 'income'

interface SliceData {
  name: string
  value: number
  percent: number
}

function buildExpenseData(expenses: Expense[]): SliceData[] {
  const expenseItems = expenses.filter(e => (e.txType || 'expense') === 'expense')
  const total = sumBy(expenseItems, e => e.amount)
  if (total === 0) return []

  const byCategory = new Map<string, number>()
  for (const e of expenseItems) {
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

function buildIncomeData(data: FinanceMonth): SliceData[] {
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
  for (const [name, value] of byCategory) {
    parts.push({ name, value })
  }

  const total = sumBy(parts, p => p.value)
  if (total === 0) return []

  return parts
    .map(p => ({ ...p, percent: (p.value / total) * 100 }))
    .sort((a, b) => b.value - a.value)
}

function ChartTooltip({ active, payload }: any) {
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

interface Props {
  data: FinanceMonth
}

export function SpendingPieChart({ data }: Props) {
  const [mode, setMode] = useState<ChartMode>('expense')

  const expenseData = useMemo(() => buildExpenseData(data.expenses), [data.expenses])
  const incomeData = useMemo(() => buildIncomeData(data), [data])

  const chartData = mode === 'expense' ? expenseData : incomeData
  const total = sumBy(chartData, d => d.value)

  return (
    <div className="fn-piechart">
      <div className="fn-piechart-header">
        <div className="fn-barchart-tabs">
          <button
            className={`fn-barchart-tab ${mode === 'expense' ? 'active' : ''}`}
            onClick={() => setMode('expense')}
          >รายจ่าย</button>
          <button
            className={`fn-barchart-tab ${mode === 'income' ? 'active' : ''}`}
            onClick={() => setMode('income')}
          >รายรับ</button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="fn-barchart-empty">ไม่มีข้อมูล</div>
      ) : (
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
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="fn-piechart-center">
              <span className="fn-piechart-center-label">{mode === 'expense' ? 'รวมจ่าย' : 'รวมรับ'}</span>
              <span className={`fn-piechart-center-value ${mode === 'expense' ? 'fn-outcome' : 'fn-income'}`}>
                {fmt(total)}
              </span>
            </div>
          </div>
          <div className="fn-piechart-legend">
            {chartData.map((d, i) => (
              <div key={d.name} className="fn-piechart-legend-item">
                <span className="fn-dot" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="fn-piechart-legend-name">{d.name}</span>
                <span className="fn-piechart-legend-pct">{d.percent.toFixed(1)}%</span>
                <span className="fn-piechart-legend-val">{fmt(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
