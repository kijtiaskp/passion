import { useFinance } from './api/use-finance'
import { SummaryBar } from './components/SummaryBar'
import { IncomeSection } from './components/IncomeSection'
import { BalanceSection } from './components/BalanceSection'
import { CreditCardSection } from './components/CreditCardSection'
import { ExpenseSection } from './components/ExpenseSection'
import { DebtSection } from './components/DebtSection'
import { SavingSection } from './components/SavingSection'
import { HomeLoanSection } from './components/HomeLoanSection'
import './finance.css'

function formatMonthLabel(month: string) {
  const [y, m] = month.split('-').map(Number)
  const thaiYear = y + 543
  const monthNames = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ]
  return `${monthNames[m - 1]} ${thaiYear}`
}

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return d.toISOString().slice(0, 7)
}

export function FinanceApp() {
  const finance = useFinance()
  const { data, loading, selectedMonth, setSelectedMonth } = finance

  return (
    <div className="fn-container">
      <div className="fn-header">
        <h1 className="fn-logo">FIN<span>ANCE</span></h1>
        <div className="month-nav">
          <button className="month-nav-btn" onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}>◀</button>
          <span className="month-nav-label">{formatMonthLabel(selectedMonth)}</span>
          <button className="month-nav-btn" onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}>▶</button>
        </div>
      </div>

      {loading ? (
        <div className="fn-loading">กำลังโหลด...</div>
      ) : (
        <div className="fn-layout">
          <div className="fn-layout-left">
            <ExpenseSection
              expenses={data.expenses}
              bills={data.bills ?? []}
              bankAccounts={data.bankBalances ?? []}
              onAdd={finance.addExpense}
              onUpdate={finance.updateExpense}
              onUpdateByBill={finance.updateExpensesByBill}
              onDelete={finance.deleteExpense}
              onUpdateBill={finance.updateBill}
              onDeleteBill={finance.deleteBill}
            />
          </div>

          <div className="fn-layout-right">
            <IncomeSection
              salary={data.income.salary}
              carryOver={data.income.carryOver}
              onUpdate={finance.updateIncome}
            />

            <BalanceSection
              balances={data.bankBalances ?? []}
              expenses={data.expenses}
              onAdd={finance.addBalance}
              onUpdate={finance.updateBalance}
              onDelete={finance.deleteBalance}
            />

            <SummaryBar data={data} />

            <CreditCardSection
              cards={data.creditCards}
              onAdd={finance.addCreditCard}
              onUpdate={finance.updateCreditCard}
              onDelete={finance.deleteCreditCard}
            />

            <div className="fn-side-by-side">
              <DebtSection
                debts={data.debts}
                onAdd={finance.addDebt}
                onUpdate={finance.updateDebt}
                onDelete={finance.deleteDebt}
              />
              <SavingSection
                savings={data.savings}
                onAdd={finance.addSaving}
                onUpdate={finance.updateSaving}
                onDelete={finance.deleteSaving}
              />
            </div>

            <HomeLoanSection
              loans={data.homeLoan}
              onAdd={finance.addLoan}
              onUpdate={finance.updateLoan}
              onDelete={finance.deleteLoan}
            />
          </div>
        </div>
      )}
    </div>
  )
}
