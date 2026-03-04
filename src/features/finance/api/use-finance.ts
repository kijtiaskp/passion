import { useState, useEffect, useCallback, useRef } from 'react'
import type { FinanceMonth, CreditCard, Expense, Debt, SavingItem, LoanItem } from '../types'
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

  // Fetch on month change
  useEffect(() => {
    setLoading(true)
    fetch(`${API}/finance?month=${selectedMonth}`)
      .then(r => r.json())
      .then((d: FinanceMonth) => { setData(d); setLoading(false) })
  }, [selectedMonth])

  // Debounced save
  const save = useCallback((updated: FinanceMonth) => {
    setData(updated)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      fetch(`${API}/finance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
    }, 500)
  }, [])

  // Income
  const updateIncome = useCallback((field: 'salary' | 'carryOver', value: number) => {
    setData(prev => {
      const updated = { ...prev, income: { ...prev.income, [field]: value } }
      save(updated)
      return updated
    })
  }, [save])

  // Generic CRUD helpers
  const addItem = useCallback(<T extends { id: number }>(
    key: keyof FinanceMonth,
    item: Omit<T, 'id'>
  ) => {
    setData(prev => {
      const list = prev[key] as T[]
      const updated = { ...prev, [key]: [...list, { ...item, id: Date.now() }] }
      save(updated)
      return updated
    })
  }, [save])

  const updateItem = useCallback(<T extends { id: number }>(
    key: keyof FinanceMonth,
    id: number,
    changes: Partial<T>
  ) => {
    setData(prev => {
      const list = prev[key] as T[]
      const updated = { ...prev, [key]: list.map(item => item.id === id ? { ...item, ...changes } : item) }
      save(updated)
      return updated
    })
  }, [save])

  const deleteItem = useCallback((key: keyof FinanceMonth, id: number) => {
    setData(prev => {
      const list = prev[key] as Array<{ id: number }>
      const updated = { ...prev, [key]: list.filter(item => item.id !== id) }
      save(updated)
      return updated
    })
  }, [save])

  // Typed helpers
  const addCreditCard = (card: Omit<CreditCard, 'id'>) => addItem<CreditCard>('creditCards', card)
  const updateCreditCard = (id: number, changes: Partial<CreditCard>) => updateItem<CreditCard>('creditCards', id, changes)
  const deleteCreditCard = (id: number) => deleteItem('creditCards', id)

  const addExpense = (expense: Omit<Expense, 'id'>) => addItem<Expense>('expenses', expense)
  const updateExpense = (id: number, changes: Partial<Expense>) => updateItem<Expense>('expenses', id, changes)
  const deleteExpense = (id: number) => deleteItem('expenses', id)

  const addDebt = (debt: Omit<Debt, 'id'>) => addItem<Debt>('debts', debt)
  const updateDebt = (id: number, changes: Partial<Debt>) => updateItem<Debt>('debts', id, changes)
  const deleteDebt = (id: number) => deleteItem('debts', id)

  const addSaving = (saving: Omit<SavingItem, 'id'>) => addItem<SavingItem>('savings', saving)
  const updateSaving = (id: number, changes: Partial<SavingItem>) => updateItem<SavingItem>('savings', id, changes)
  const deleteSaving = (id: number) => deleteItem('savings', id)

  const addLoan = (loan: Omit<LoanItem, 'id'>) => addItem<LoanItem>('homeLoan', loan)
  const updateLoan = (id: number, changes: Partial<LoanItem>) => updateItem<LoanItem>('homeLoan', id, changes)
  const deleteLoan = (id: number) => deleteItem('homeLoan', id)

  return {
    data, loading, selectedMonth, setSelectedMonth,
    updateIncome,
    addCreditCard, updateCreditCard, deleteCreditCard,
    addExpense, updateExpense, deleteExpense,
    addDebt, updateDebt, deleteDebt,
    addSaving, updateSaving, deleteSaving,
    addLoan, updateLoan, deleteLoan,
  }
}
