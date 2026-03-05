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
  qty: number
  price: number
  amount: number
  bank: string
  type: string
  date?: string
  time?: string
  billId?: number
}

export interface BillInfo {
  id: number
  storeName: string
  branch: string
  storeCode: string
  receiptNo: string
  date: string
  time: string
  paymentMethod: string
  transactionId: string
  netTotal: number
  note: string
  image?: string
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

export type BalanceGroup = 'bank' | 'ewallet' | 'cash'

export const BALANCE_GROUP_LABELS: Record<BalanceGroup, string> = {
  bank: 'บัญชีธนาคาร',
  ewallet: 'E-Wallet',
  cash: 'เงินสด',
}

export interface BankBalance {
  id: number
  name: string
  amount: number
  group: BalanceGroup
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
  bankBalances: BankBalance[]
  bills: BillInfo[]
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
    bankBalances: [],
    bills: [],
  }
}
