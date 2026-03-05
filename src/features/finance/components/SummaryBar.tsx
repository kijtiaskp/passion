import type { FinanceMonth } from '../types'

interface Props {
  data: FinanceMonth
}

export function SummaryBar({ data }: Props) {
  const totalCreditCards = data.creditCards.reduce((s, c) => s + c.willPay, 0)
  const totalExpenses = data.expenses.reduce((s, e) => s + e.amount, 0)
  const totalDebts = data.debts.filter(d => !d.paid).reduce((s, d) => s + d.amount, 0)
  const totalSavings = data.savings.reduce((s, sv) => s + sv.amount, 0)
  const totalLoans = data.homeLoan.reduce((s, l) => s + l.amount, 0)

  const totalBankBalances = (data.bankBalances ?? []).reduce((s, b) => s + b.amount, 0)

  const totalOut = totalCreditCards + totalExpenses + totalDebts + totalSavings + totalLoans
  const totalIn = data.income.salary + data.income.carryOver + totalBankBalances
  const remaining = totalIn - totalOut

  return (
    <div className="fn-stats">
      <div className="stat-card">
        <div className="label">รายรับรวม</div>
        <div className="value">{totalIn.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
      </div>
      <div className="stat-card">
        <div className="label">ที่ต้องจ่าย</div>
        <div className="value blue">{totalOut.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
      </div>
      <div className="stat-card">
        <div className="label">คงเหลือสุทธิ</div>
        <div className={`value ${remaining >= 0 ? '' : 'danger'}`}>
          {remaining.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  )
}
