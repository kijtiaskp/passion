export interface CreditCard {
  id: number
  name: string
  willPay: number
  min: number
  max: number
  subscriptionTotal: number
}

export type TxType = 'expense' | 'income' | 'transfer'

export const TX_TYPE_LABELS: Record<TxType, string> = {
  expense: 'รายจ่าย',
  income: 'รายรับ',
  transfer: 'โอน',
}

export interface Expense {
  id: number
  name: string
  qty: number
  price: number
  amount: number
  bank: string
  bankTo?: string
  type: string
  txType?: TxType
  date?: string
  time?: string
  billId?: number
}

/** ยอดรวมสำหรับแสดงผล: income=+, expense=-, transfer=0 (ย้ายเงินภายใน) */
export function signedAmount(exp: Expense): number {
  const tx = exp.txType || 'expense'
  if (tx === 'income') return exp.amount
  if (tx === 'expense') return -exp.amount
  return 0 // transfer ไม่กระทบยอดรวม
}

/** ผลกระทบต่อบัญชี: expense=-bank, income=+bank, transfer=-bank/+bankTo */
export function balanceImpact(exp: Expense, accountName: string): number {
  const tx = exp.txType || 'expense'
  if (tx === 'expense') {
    return exp.bank === accountName ? -exp.amount : 0
  }
  if (tx === 'income') {
    return exp.bank === accountName ? exp.amount : 0
  }
  // transfer
  let impact = 0
  if (exp.bank === accountName) impact -= exp.amount
  if (exp.bankTo === accountName) impact += exp.amount
  return impact
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

export type DebtDirection = 'owe' | 'lent'

export interface Debt {
  id: number
  name: string
  amount: number
  paid: boolean
  direction?: DebtDirection
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

export type BalanceGroup = 'bank' | 'ewallet' | 'cash' | 'pocket'

export const BALANCE_GROUP_LABELS: Record<BalanceGroup, string> = {
  bank: 'บัญชีธนาคาร',
  ewallet: 'E-Wallet',
  cash: 'เงินสด',
  pocket: 'Pocket',
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
