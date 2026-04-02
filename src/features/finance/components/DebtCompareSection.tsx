import { useState, useEffect, useMemo } from 'react'
import { format, addMonths } from 'date-fns'
import type { FinanceMonth } from '../types'
import { emptyFinanceMonth } from '../types'
import { fmt, fmtSigned, sumBy } from '../../../utils/format'

interface Props {
  data: FinanceMonth
  selectedMonth: string
}

const THAI_MONTH_NAMES = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

function monthLabel(month: string) {
  const [y, m] = month.split('-').map(Number)
  return `${THAI_MONTH_NAMES[m - 1]} ${y + 543}`
}

function prevMonth(month: string) {
  const [y, m] = month.split('-').map(Number)
  return format(addMonths(new Date(y, m - 1, 1), -1), 'yyyy-MM')
}

interface DebtRow {
  label: string
  prev: number
  curr: number
  diff: number
  children?: DebtRow[]
}

function buildRows(prev: FinanceMonth, curr: FinanceMonth): DebtRow[] {
  const rows: DebtRow[] = []

  // Credit cards - total + per card
  const prevCC = sumBy(prev.creditCards, c => c.used ?? 0)
  const currCC = sumBy(curr.creditCards, c => c.used ?? 0)
  if (prevCC > 0 || currCC > 0) {
    const allCardNames = new Set([
      ...prev.creditCards.map(c => c.name),
      ...curr.creditCards.map(c => c.name),
    ])
    const children: DebtRow[] = []
    for (const name of allCardNames) {
      const pv = prev.creditCards.find(c => c.name === name)?.used ?? 0
      const cv = curr.creditCards.find(c => c.name === name)?.used ?? 0
      children.push({ label: name, prev: pv, curr: cv, diff: cv - pv })
    }
    rows.push({ label: 'บัตรเครดิต', prev: prevCC, curr: currCC, diff: currCC - prevCC, children })
  }

  // Student loans
  const prevSL = sumBy(prev.studentLoans ?? [], l => l.principal + l.interest + l.penalty)
  const currSL = sumBy(curr.studentLoans ?? [], l => l.principal + l.interest + l.penalty)
  if (prevSL > 0 || currSL > 0) {
    rows.push({ label: 'กยศ.', prev: prevSL, curr: currSL, diff: currSL - prevSL })
  }

  // Home loans
  const prevHL = sumBy(prev.homeLoan, l => l.amount)
  const currHL = sumBy(curr.homeLoan, l => l.amount)
  if (prevHL > 0 || currHL > 0) {
    rows.push({ label: 'ผ่อนบ้าน', prev: prevHL, curr: currHL, diff: currHL - prevHL })
  }

  // Personal debts (owe)
  const prevOwe = sumBy(prev.debts.filter(d => !d.paid && (d.direction || 'owe') === 'owe'), d => d.amount)
  const currOwe = sumBy(curr.debts.filter(d => !d.paid && (d.direction || 'owe') === 'owe'), d => d.amount)
  if (prevOwe > 0 || currOwe > 0) {
    rows.push({ label: 'หนี้คนรู้จัก (ติดเขา)', prev: prevOwe, curr: currOwe, diff: currOwe - prevOwe })
  }

  return rows
}

function CompareRow({ row }: { row: DebtRow }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = row.children && row.children.length > 0

  return (
    <>
      <tr
        className={hasChildren ? 'fn-compare-expandable' : ''}
        onClick={hasChildren ? () => setExpanded(!expanded) : undefined}
      >
        <td>
          {hasChildren && <span className={`fn-compare-arrow ${expanded ? 'expanded' : ''}`}>&#9662;</span>}
          {row.label}
        </td>
        <td><span className="fn-num">{fmt(row.prev)}</span></td>
        <td><span className="fn-num">{fmt(row.curr)}</span></td>
        <td>
          <span className={`fn-num ${row.diff > 0 ? 'fn-num-danger' : row.diff < 0 ? 'fn-num-success' : ''}`}>
            {fmtSigned(row.diff)}
          </span>
        </td>
      </tr>
      {expanded && row.children?.map(child => (
        <tr key={child.label} className="fn-compare-sub-row">
          <td className="fn-compare-sub-label">↳ {child.label}</td>
          <td><span className="fn-num">{fmt(child.prev)}</span></td>
          <td><span className="fn-num">{fmt(child.curr)}</span></td>
          <td>
            <span className={`fn-num ${child.diff > 0 ? 'fn-num-danger' : child.diff < 0 ? 'fn-num-success' : ''}`}>
              {fmtSigned(child.diff)}
            </span>
          </td>
        </tr>
      ))}
    </>
  )
}

interface PaymentRow {
  label: string
  toPay: number
  paid: number
  remaining: number
  children?: PaymentRow[]
}

function buildPaymentPlan(data: FinanceMonth): PaymentRow[] {
  const rows: PaymentRow[] = []

  // Credit cards
  if (data.creditCards.length > 0) {
    const children: PaymentRow[] = data.creditCards.map(c => {
      const toPay = c.willPay
      const paid = c.paid ?? 0
      return { label: c.name, toPay, paid, remaining: toPay - paid }
    })
    const toPay = sumBy(children, r => r.toPay)
    const paid = sumBy(children, r => r.paid)
    rows.push({ label: 'บัตรเครดิต', toPay, paid, remaining: toPay - paid, children })
  }

  // Student loans (overdue = ยอดที่ต้องจ่ายงวดนี้)
  if ((data.studentLoans ?? []).length > 0) {
    const toPay = sumBy(data.studentLoans, l => l.overdue)
    rows.push({ label: 'กยศ.', toPay, paid: 0, remaining: toPay })
  }

  // Home loans
  if (data.homeLoan.length > 0) {
    const toPay = sumBy(data.homeLoan, l => l.amount)
    rows.push({ label: 'ผ่อนบ้าน', toPay, paid: 0, remaining: toPay })
  }

  // Personal debts (owe, unpaid)
  const oweDebts = data.debts.filter(d => !d.paid && (d.direction || 'owe') === 'owe')
  if (oweDebts.length > 0) {
    const toPay = sumBy(oweDebts, d => d.amount)
    rows.push({ label: 'หนี้คนรู้จัก', toPay, paid: 0, remaining: toPay })
  }

  return rows
}

function PaymentPlanRow({ row }: { row: PaymentRow }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = row.children && row.children.length > 0

  return (
    <>
      <tr
        className={hasChildren ? 'fn-compare-expandable' : ''}
        onClick={hasChildren ? () => setExpanded(!expanded) : undefined}
      >
        <td>
          {hasChildren && <span className={`fn-compare-arrow ${expanded ? 'expanded' : ''}`}>&#9662;</span>}
          {row.label}
        </td>
        <td><span className="fn-num">{fmt(row.toPay)}</span></td>
        <td><span className="fn-num fn-num-success">{fmt(row.paid)}</span></td>
        <td>
          <span className={`fn-num ${row.remaining > 0 ? 'fn-num-danger' : row.remaining === 0 && row.toPay > 0 ? 'fn-num-success' : ''}`}>
            {fmt(row.remaining)}
          </span>
        </td>
      </tr>
      {expanded && row.children?.map(child => (
        <tr key={child.label} className="fn-compare-sub-row">
          <td className="fn-compare-sub-label">↳ {child.label}</td>
          <td><span className="fn-num">{fmt(child.toPay)}</span></td>
          <td><span className="fn-num fn-num-success">{fmt(child.paid)}</span></td>
          <td>
            <span className={`fn-num ${child.remaining > 0 ? 'fn-num-danger' : child.remaining === 0 && child.toPay > 0 ? 'fn-num-success' : ''}`}>
              {fmt(child.remaining)}
            </span>
          </td>
        </tr>
      ))}
    </>
  )
}

function PaymentPlanSection({ data, selectedMonth }: Props) {
  const rows = useMemo(() => buildPaymentPlan(data), [data])
  const totalToPay = sumBy(rows, r => r.toPay)
  const totalPaid = sumBy(rows, r => r.paid)
  const totalRemaining = totalToPay - totalPaid
  const paidPct = totalToPay > 0 ? (totalPaid / totalToPay) * 100 : 0

  if (rows.length === 0) return null

  return (
    <div className="fn-section">
      <div className="fn-section-header">
        <h3>แผนการจ่ายเงิน</h3>
        <span className="fn-compare-months">{monthLabel(selectedMonth)}</span>
      </div>

      <div className="fn-payment-progress">
        <div className="fn-payment-progress-bar">
          <div className="fn-payment-progress-fill" style={{ width: `${Math.min(paidPct, 100)}%` }} />
        </div>
        <span className="fn-payment-progress-text">{paidPct.toFixed(0)}% จ่ายแล้ว</span>
      </div>

      <table className="fn-table fn-compare-table">
        <thead>
          <tr>
            <th>รายการ</th>
            <th>ยอดต้องจ่าย</th>
            <th>จ่ายแล้ว</th>
            <th>คงค้าง</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <PaymentPlanRow key={row.label} row={row} />
          ))}
        </tbody>
        <tfoot>
          <tr className="fn-total-row">
            <td><strong>รวม</strong></td>
            <td><span className="fn-num">{fmt(totalToPay)}</span></td>
            <td><span className="fn-num fn-num-success">{fmt(totalPaid)}</span></td>
            <td>
              <span className={`fn-num fn-compare-total-diff ${totalRemaining > 0 ? 'fn-num-danger' : 'fn-num-success'}`}>
                {fmt(totalRemaining)}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export function DebtCompareSection({ data, selectedMonth }: Props) {
  const [prevData, setPrevData] = useState<FinanceMonth | null>(null)
  const [loading, setLoading] = useState(true)
  const prev = prevMonth(selectedMonth)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/finance?month=${prev}`)
      .then(r => r.json())
      .then((d: FinanceMonth) => { setPrevData(d); setLoading(false) })
      .catch(() => { setPrevData(emptyFinanceMonth(prev)); setLoading(false) })
  }, [prev])

  const rows = useMemo(() => {
    if (!prevData) return []
    return buildRows(prevData, data)
  }, [prevData, data])

  const totalPrev = useMemo(() => sumBy(rows, r => r.prev), [rows])
  const totalCurr = useMemo(() => sumBy(rows, r => r.curr), [rows])
  const totalDiff = totalCurr - totalPrev

  if (loading) {
    return <div className="fn-loading">กำลังโหลด...</div>
  }

  return (
    <>
    <PaymentPlanSection data={data} selectedMonth={selectedMonth} />

    <div className="fn-section">
      <div className="fn-section-header">
        <h3>เปรียบเทียบหนี้สิน</h3>
        <span className="fn-compare-months">
          {monthLabel(prev)} vs {monthLabel(selectedMonth)}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="fn-compare-empty">ไม่มีข้อมูลหนี้สิน</div>
      ) : (
        <table className="fn-table fn-compare-table">
          <thead>
            <tr>
              <th>รายการ</th>
              <th>{monthLabel(prev)}</th>
              <th>{monthLabel(selectedMonth)}</th>
              <th>เปลี่ยนแปลง</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <CompareRow key={row.label} row={row} />
            ))}
          </tbody>
          <tfoot>
            <tr className="fn-total-row">
              <td><strong>รวม</strong></td>
              <td><span className="fn-num">{fmt(totalPrev)}</span></td>
              <td><span className="fn-num">{fmt(totalCurr)}</span></td>
              <td>
                <span className={`fn-num fn-compare-total-diff ${totalDiff > 0 ? 'fn-num-danger' : totalDiff < 0 ? 'fn-num-success' : ''}`}>
                  {fmtSigned(totalDiff)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      )}

      {totalDiff !== 0 && (
        <div className={`fn-compare-summary ${totalDiff < 0 ? 'fn-compare-good' : 'fn-compare-bad'}`}>
          {totalDiff < 0
            ? `หนี้ลดลง ${fmt(Math.abs(totalDiff))} บาท`
            : `หนี้เพิ่มขึ้น ${fmt(totalDiff)} บาท`
          }
        </div>
      )}
    </div>
    </>
  )
}
