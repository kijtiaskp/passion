import type { FinanceMonth } from '../types'

interface Props {
  data: FinanceMonth
}

export function SummaryBar({ data }: Props) {
  // รายรับ = เงินเดือน + เงินเหลือเดือนก่อน + income transactions
  const txIncome = data.expenses
    .filter(e => e.txType === 'income')
    .reduce((s, e) => s + e.amount, 0)
  const totalIncome = data.income.salary + data.income.carryOver + txIncome

  // รายจ่าย = expense transactions + บัตรเครดิต + หนี้ที่เราต้องจ่าย (owe) + ผ่อนบ้าน
  const txExpense = data.expenses
    .filter(e => (e.txType || 'expense') === 'expense')
    .reduce((s, e) => s + e.amount, 0)
  const totalCreditCards = data.creditCards.reduce((s, c) => s + c.willPay, 0)
  const totalDebtsOwe = data.debts
    .filter(d => !d.paid && (d.direction || 'owe') === 'owe')
    .reduce((s, d) => s + d.amount, 0)
  const totalLoans = data.homeLoan.reduce((s, l) => s + l.amount, 0)
  const totalExpense = txExpense + totalCreditCards + totalDebtsOwe + totalLoans

  // เงินออม (แยกออก — ไม่ใช่รายจ่าย แต่เป็นการจัดสรร)
  const totalSavings = data.savings.reduce((s, sv) => s + sv.amount, 0)

  // ลูกหนี้ (เขาติดเรา)
  const totalDebtsLent = data.debts
    .filter(d => !d.paid && d.direction === 'lent')
    .reduce((s, d) => s + d.amount, 0)

  // สินทรัพย์ต้นเดือน
  const totalAssets = (data.bankBalances ?? []).reduce((s, b) => s + b.amount, 0)

  // คงเหลือสุทธิ = สินทรัพย์ + รายรับ - รายจ่าย - เงินออม
  const netBalance = totalAssets + totalIncome - totalExpense - totalSavings

  return (
    <div className="fn-stats">
      <div className="stat-card">
        <div className="label">สินทรัพย์ต้นเดือน</div>
        <div className="value">{totalAssets.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
      </div>
      <div className="stat-card">
        <div className="label">รายรับ</div>
        <div className="value">{totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
      </div>
      <div className="stat-card">
        <div className="label">รายจ่าย</div>
        <div className="value danger">{totalExpense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
      </div>
      <div className="stat-card">
        <div className="label">เงินออม</div>
        <div className="value blue">{totalSavings.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
      </div>
      {totalDebtsLent > 0 && (
        <div className="stat-card">
          <div className="label">ลูกหนี้</div>
          <div className="value">{totalDebtsLent.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
        </div>
      )}
      <div className="stat-card">
        <div className="label">คงเหลือสุทธิ</div>
        <div className={`value ${netBalance >= 0 ? '' : 'danger'}`}>
          {netBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  )
}
