import { useState, useEffect, useCallback, useRef } from 'react'
import type { FinanceMonth, CreditCard, Expense, Debt, SavingItem, LoanItem, BankBalance, BillInfo } from '../types'
import { emptyFinanceMonth } from '../types'

const API = '/api'

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export function useFinance() {
  const [data, setData] = useState<FinanceMonth>(emptyFinanceMonth(currentMonth()))
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const dirty = useRef(false)

  // Fetch on month change
  useEffect(() => {
    setLoading(true)
    fetch(`${API}/finance?month=${selectedMonth}`)
      .then(r => r.json())
      .then((d: FinanceMonth) => { setData(d); setLoading(false) })
  }, [selectedMonth])

  // Debounced auto-save when data changes
  useEffect(() => {
    if (!dirty.current || loading) return
    dirty.current = false
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      fetch(`${API}/finance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }, 500)
  }, [data, loading])

  const markDirty = useCallback(() => { dirty.current = true }, [])

  // Income
  const updateIncome = useCallback((field: 'salary' | 'carryOver', value: number) => {
    markDirty()
    setData(prev => ({ ...prev, income: { ...prev.income, [field]: value } }))
  }, [markDirty])

  // Generic CRUD helpers
  const addItem = useCallback(<T extends { id: number }>(
    key: keyof FinanceMonth,
    item: Omit<T, 'id'>
  ) => {
    const id = Date.now()
    markDirty()
    setData(prev => {
      const list = prev[key] as T[]
      return { ...prev, [key]: [...list, { ...item, id }] }
    })
  }, [markDirty])

  const updateItem = useCallback(<T extends { id: number }>(
    key: keyof FinanceMonth,
    id: number,
    changes: Partial<T>
  ) => {
    markDirty()
    setData(prev => {
      const list = prev[key] as T[]
      return { ...prev, [key]: list.map(item => item.id === id ? { ...item, ...changes } : item) }
    })
  }, [markDirty])

  const deleteItem = useCallback((key: keyof FinanceMonth, id: number) => {
    markDirty()
    setData(prev => {
      const list = prev[key] as Array<{ id: number }>
      return { ...prev, [key]: list.filter(item => item.id !== id) }
    })
  }, [markDirty])

  // Typed helpers
  const addCreditCard = (card: Omit<CreditCard, 'id'>) => addItem<CreditCard>('creditCards', card)
  const updateCreditCard = (id: number, changes: Partial<CreditCard>) => updateItem<CreditCard>('creditCards', id, changes)
  const deleteCreditCard = (id: number) => deleteItem('creditCards', id)

  const addExpense = (expense: Omit<Expense, 'id'>) => addItem<Expense>('expenses', expense)
  const addBillWithExpenses = useCallback((bill: Omit<BillInfo, 'id'>, items: Omit<Expense, 'id' | 'billId'>[]) => {
    const billId = Date.now()
    markDirty()
    setData(prev => {
      const newBill = { ...bill, id: billId }
      const newExpenses = items.map((item, i) => ({ ...item, billId, id: billId + i + 1 }))
      return {
        ...prev,
        bills: [...(prev.bills ?? []), newBill],
        expenses: [...prev.expenses, ...newExpenses],
      }
    })
  }, [markDirty])
  const updateExpense = (id: number, changes: Partial<Expense>) => updateItem<Expense>('expenses', id, changes)
  const updateExpensesByBill = useCallback((billId: number, changes: Partial<Expense>) => {
    markDirty()
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.billId === billId ? { ...e, ...changes } : e),
    }))
  }, [markDirty])
  const deleteExpense = (id: number) => deleteItem('expenses', id)
  const updateBill = (id: number, changes: Partial<BillInfo>) => updateItem<BillInfo>('bills', id, changes)
  const deleteBill = useCallback((id: number) => {
    markDirty()
    setData(prev => ({
      ...prev,
      bills: (prev.bills ?? []).filter(b => b.id !== id),
      expenses: prev.expenses.filter(e => e.billId !== id),
    }))
  }, [markDirty])

  const addDebt = (debt: Omit<Debt, 'id'>) => addItem<Debt>('debts', debt)
  const updateDebt = (id: number, changes: Partial<Debt>) => updateItem<Debt>('debts', id, changes)
  const deleteDebt = (id: number) => deleteItem('debts', id)

  const addSaving = (saving: Omit<SavingItem, 'id'>) => addItem<SavingItem>('savings', saving)
  const updateSaving = (id: number, changes: Partial<SavingItem>) => updateItem<SavingItem>('savings', id, changes)
  const deleteSaving = (id: number) => deleteItem('savings', id)

  const addLoan = (loan: Omit<LoanItem, 'id'>) => addItem<LoanItem>('homeLoan', loan)
  const updateLoan = (id: number, changes: Partial<LoanItem>) => updateItem<LoanItem>('homeLoan', id, changes)
  const deleteLoan = (id: number) => deleteItem('homeLoan', id)

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
    addBalance, updateBalance, deleteBalance,
  }
}
