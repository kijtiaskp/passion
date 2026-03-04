export interface CreditCard {
  id: number
  name: string
  willPay: number
  min: number
  max: number
  subscriptionTotal: number
}

export interface Expense {
  id: number
  name: string
  amount: number
  bank: string
  type: string
}

export interface Debt {
  id: number
  name: string
  amount: number
  paid: boolean
}

export interface SavingItem {
  id: number
  name: string
  amount: number
}

export interface LoanItem {
  id: number
  name: string
  amount: number
}

export interface FinanceMonth {
  month: string
  income: {
    salary: number
    carryOver: number
  }
  creditCards: CreditCard[]
  expenses: Expense[]
  debts: Debt[]
  savings: SavingItem[]
  homeLoan: LoanItem[]
}

export function emptyFinanceMonth(month: string): FinanceMonth {
  return {
    month,
    income: { salary: 0, carryOver: 0 },
    creditCards: [],
    expenses: [],
    debts: [],
    savings: [],
    homeLoan: [],
  }
}
