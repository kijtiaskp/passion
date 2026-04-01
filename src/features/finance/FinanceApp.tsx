import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { addMonths, format } from 'date-fns'
import { useFinance } from './api/use-finance'
import { SummaryBar } from './components/SummaryBar'
import { IncomeSection } from './components/IncomeSection'
import { BalanceSection } from './components/BalanceSection'
import { CreditCardSection } from './components/CreditCardSection'
import { ExpenseSection } from './components/ExpenseSection'
import { DebtSection } from './components/DebtSection'
import { SavingSection } from './components/SavingSection'
import { HomeLoanSection } from './components/HomeLoanSection'
import { FinanceTips } from './components/FinanceTips'
import './finance.css'

const THAI_MONTH_NAMES = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

function parseMonth(m: string) {
  const [y, mo] = m.split('-').map(Number)
  return new Date(y, mo - 1, 1)
}

function formatMonthLabel(month: string) {
  const d = parseMonth(month)
  return `${THAI_MONTH_NAMES[d.getMonth()]} ${d.getFullYear() + 543}`
}

function shiftMonth(month: string, delta: number) {
  return format(addMonths(parseMonth(month), delta), 'yyyy-MM')
}

const TABS = [
  { key: 'overview', label: 'ภาพรวม' },
  { key: 'credit', label: 'บัตรเครดิต' },
] as const

type TabKey = typeof TABS[number]['key']

export function FinanceApp() {
  const finance = useFinance()
  const { data, loading, selectedMonth, setSelectedMonth } = finance
  const [searchParams, setSearchParams] = useSearchParams()
  const validTabs = useMemo(() => new Set(TABS.map(t => t.key)), [])
  const tabParam = searchParams.get('tab') as TabKey | null
  const activeTab: TabKey = tabParam && validTabs.has(tabParam) ? tabParam : 'overview'
  const setActiveTab = (tab: TabKey) => setSearchParams(tab === 'overview' ? {} : { tab }, { replace: true })

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

      <div className="fn-tab-nav">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`fn-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="fn-loading">กำลังโหลด...</div>
      ) : activeTab === 'overview' ? (
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
      ) : (
        <>
          <CreditCardSection
            cards={data.creditCards}
            onAdd={finance.addCreditCard}
            onUpdate={finance.updateCreditCard}
            onDelete={finance.deleteCreditCard}
          />
          <FinanceTips />
        </>
      )}
    </div>
  )
}
