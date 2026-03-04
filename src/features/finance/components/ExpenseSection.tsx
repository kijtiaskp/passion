import { useState } from 'react'
import type { Expense } from '../types'
import { EditableCell, EditableNum } from './CreditCardSection'

interface Props {
  expenses: Expense[]
  onAdd: (expense: Omit<Expense, 'id'>) => void
  onUpdate: (id: number, changes: Partial<Expense>) => void
  onDelete: (id: number) => void
}

export function ExpenseSection({ expenses, onAdd, onUpdate, onDelete }: Props) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', amount: 0, bank: '', type: 'credit card' })
  const total = expenses.reduce((s, e) => s + e.amount, 0)

  const handleAdd = () => {
    if (!form.name) return
    onAdd(form)
    setForm({ name: '', amount: 0, bank: '', type: 'credit card' })
    setAdding(false)
  }

  return (
    <div className="fn-section">
      <div className="fn-section-header">
        <h3>รายจ่ายประจำเดือน</h3>
        <span className="fn-section-total">{total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
      </div>

      {expenses.length > 0 && (
        <table className="fn-table">
          <thead>
            <tr>
              <th>รายการ</th>
              <th>จำนวน</th>
              <th>ธนาคาร</th>
              <th>ประเภท</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp.id}>
                <td>
                  <EditableCell value={exp.name} onChange={v => onUpdate(exp.id, { name: v })} />
                </td>
                <td>
                  <EditableNum value={exp.amount} onChange={v => onUpdate(exp.id, { amount: v })} />
                </td>
                <td>
                  <EditableCell value={exp.bank} onChange={v => onUpdate(exp.id, { bank: v })} />
                </td>
                <td>
                  <EditableCell value={exp.type} onChange={v => onUpdate(exp.id, { type: v })} />
                </td>
                <td>
                  <button className="fn-delete-btn" onClick={() => onDelete(exp.id)}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {adding ? (
        <div className="fn-add-row">
          <input placeholder="รายการ" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input type="number" placeholder="จำนวน" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
          <input placeholder="ธนาคาร" value={form.bank} onChange={e => setForm({ ...form, bank: e.target.value })} />
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="credit card">Credit Card</option>
            <option value="debit">Debit</option>
            <option value="cash">Cash</option>
          </select>
          <button className="fn-btn-save" onClick={handleAdd}>เพิ่ม</button>
          <button className="fn-btn-cancel" onClick={() => setAdding(false)}>ยกเลิก</button>
        </div>
      ) : (
        <button className="fn-btn-add" onClick={() => setAdding(true)}>+ เพิ่มรายจ่าย</button>
      )}
    </div>
  )
}
