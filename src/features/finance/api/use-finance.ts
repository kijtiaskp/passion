import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import type { FinanceMonth, CreditCard, Expense, Debt, SavingItem, LoanItem, StudentLoan, BankBalance, BillInfo } from '../types'
import { emptyFinanceMonth } from '../types'
import mockFinance from '../../../../mock/finance/2026-03.json'

const API = '/api'

function currentMonth() {
  return format(new Date(), 'yyyy-MM')
}

async function api<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}/finance${url}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

export function useFinance(initialMonth?: string) {
  const init = initialMonth || currentMonth()
  const [data, setData] = useState<FinanceMonth>(emptyFinanceMonth(init))
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(init)

  // Fetch on month change
  useEffect(() => {
    setLoading(true)
    fetch(`${API}/finance?month=${selectedMonth}`)
      .then(r => r.json())
      .then((d: FinanceMonth) => {
        d.creditCards = [...d.creditCards].sort((a, b) => a.name.localeCompare(b.name))
        setData(d)
        setLoading(false)
      })
      .catch(() => { setData(mockFinance as unknown as FinanceMonth); setLoading(false) })
  }, [selectedMonth])

  // Income
  const updateIncome = useCallback((field: 'salary' | 'carryOver', value: number) => {
    setData(prev => {
      const income = { ...prev.income, [field]: value }
      api(`/${prev.month}/income`, 'PATCH', { [field]: value })
      return { ...prev, income }
    })
  }, [])

  // Generic CRUD helpers
  const addItem = useCallback(<T extends { id: number }>(
    key: keyof FinanceMonth,
    item: Omit<T, 'id'>
  ) => {
    const id = Date.now()
    const newItem = { ...item, id } as T
    setData(prev => {
      const list = prev[key] as T[]
      return { ...prev, [key]: [...list, newItem] }
    })
    api(`/${data.month}/${key}`, 'POST', newItem)
  }, [data.month])

  const updateItem = useCallback(<T extends { id: number }>(
    key: keyof FinanceMonth,
    id: number,
    changes: Partial<T>
  ) => {
    setData(prev => {
      const list = prev[key] as T[]
      return { ...prev, [key]: list.map(item => item.id === id ? { ...item, ...changes } : item) }
    })
    api(`/${data.month}/${key}/${id}`, 'PATCH', changes)
  }, [data.month])

  const deleteItem = useCallback((key: keyof FinanceMonth, id: number) => {
    setData(prev => {
      const list = prev[key] as Array<{ id: number }>
      return { ...prev, [key]: list.filter(item => item.id !== id) }
    })
    api(`/${data.month}/${key}/${id}`, 'DELETE')
  }, [data.month])

  // Typed helpers
  const addCreditCard = (card: Omit<CreditCard, 'id'>) => addItem<CreditCard>('creditCards', card)
  const updateCreditCard = (id: number, changes: Partial<CreditCard>) => updateItem<CreditCard>('creditCards', id, changes)
  const deleteCreditCard = (id: number) => deleteItem('creditCards', id)

  const addExpense = (expense: Omit<Expense, 'id'>) => addItem<Expense>('expenses', expense)
  const addBillWithExpenses = useCallback((bill: Omit<BillInfo, 'id'>, items: Omit<Expense, 'id' | 'billId'>[]) => {
    const billId = Date.now()
    const newBill = { ...bill, id: billId } as BillInfo
    const newExpenses = items.map((item, i) => ({ ...item, billId, id: billId + i + 1 }) as Expense)
    setData(prev => ({
      ...prev,
      bills: [...(prev.bills ?? []), newBill],
      expenses: [...prev.expenses, ...newExpenses],
    }))
    api(`/${data.month}/bills-with-expenses`, 'POST', { bill: newBill, expenses: newExpenses })
  }, [data.month])
  const updateExpense = (id: number, changes: Partial<Expense>) => updateItem<Expense>('expenses', id, changes)
  const updateExpensesByBill = useCallback((billId: number, changes: Partial<Expense>) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.billId === billId ? { ...e, ...changes } : e),
    }))
    api(`/${data.month}/expenses-by-bill/${billId}`, 'PATCH', changes)
  }, [data.month])
  const deleteExpense = (id: number) => deleteItem('expenses', id)
  const updateBill = (id: number, changes: Partial<BillInfo>) => updateItem<BillInfo>('bills', id, changes)
  const deleteBill = useCallback((id: number) => {
    setData(prev => ({
      ...prev,
      bills: (prev.bills ?? []).filter(b => b.id !== id),
      expenses: prev.expenses.filter(e => e.billId !== id),
    }))
    api(`/${data.month}/bills-with-expenses/${id}`, 'DELETE')
  }, [data.month])

  const addDebt = (debt: Omit<Debt, 'id'>) => addItem<Debt>('debts', debt)
  const updateDebt = (id: number, changes: Partial<Debt>) => updateItem<Debt>('debts', id, changes)
  const deleteDebt = (id: number) => deleteItem('debts', id)

  const addSaving = (saving: Omit<SavingItem, 'id'>) => addItem<SavingItem>('savings', saving)
  const updateSaving = (id: number, changes: Partial<SavingItem>) => updateItem<SavingItem>('savings', id, changes)
  const deleteSaving = (id: number) => deleteItem('savings', id)

  const addLoan = (loan: Omit<LoanItem, 'id'>) => addItem<LoanItem>('homeLoan', loan)
  const updateLoan = (id: number, changes: Partial<LoanItem>) => updateItem<LoanItem>('homeLoan', id, changes)
  const deleteLoan = (id: number) => deleteItem('homeLoan', id)

  const addStudentLoan = (loan: Omit<StudentLoan, 'id'>) => addItem<StudentLoan>('studentLoans', loan)
  const updateStudentLoan = (id: number, changes: Partial<StudentLoan>) => updateItem<StudentLoan>('studentLoans', id, changes)
  const deleteStudentLoan = (id: number) => deleteItem('studentLoans', id)

  const addBalance = (balance: Omit<BankBalance, 'id'>) => addItem<BankBalance>('bankBalances', balance)
  const updateBalance = (id: number, changes: Partial<BankBalance>) => updateItem<BankBalance>('bankBalances', id, changes)
  const deleteBalance = (id: number) => deleteItem('bankBalances', id)

  return {
    data, loading, selectedMonth, setSelectedMonth,
    updateIncome,
    addCreditCard, updateCreditCard, deleteCreditCard,
    addExpense, addBillWithExpenses, updateExpense, updateExpensesByBill, deleteExpense,
    updateBill, deleteBill,
    addDebt, updateDebt, deleteDebt,
    addSaving, updateSaving, deleteSaving,
    addLoan, updateLoan, deleteLoan,
    addStudentLoan, updateStudentLoan, deleteStudentLoan,
    addBalance, updateBalance, deleteBalance,
  }
}
