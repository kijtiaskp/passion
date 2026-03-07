import { useState } from 'react'
import type { LoanItem } from '../types'
import { EditableCell, EditableNum } from './CreditCardSection'
import { fmt, sumBy } from '../../../utils/format'

interface Props {
  loans: LoanItem[]
  onAdd: (loan: Omit<LoanItem, 'id'>) => void
  onUpdate: (id: number, changes: Partial<LoanItem>) => void
  onDelete: (id: number) => void
}

export function HomeLoanSection({ loans, onAdd, onUpdate, onDelete }: Props) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', amount: 0 })
  const total = sumBy(loans, l => l.amount)

  const handleAdd = () => {
    if (!form.name) return
    onAdd(form)
    setForm({ name: '', amount: 0 })
    setAdding(false)
  }

  return (
    <div className="fn-section">
      <div className="fn-section-header">
        <h3>บ้าน</h3>
        <span className="fn-section-total">{fmt(total)}</span>
      </div>

      {loans.length > 0 && (
        <table className="fn-table">
          <thead>
            <tr>
              <th>รายการ</th>
              <th>จำนวน</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loans.map(loan => (
              <tr key={loan.id}>
                <td>
                  <EditableCell value={loan.name} onChange={v => onUpdate(loan.id, { name: v })} />
                </td>
                <td>
                  <EditableNum value={loan.amount} onChange={v => onUpdate(loan.id, { amount: v })} />
                </td>
                <td>
                  <button className="fn-delete-btn" onClick={() => onDelete(loan.id)}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {adding ? (
        <div className="fn-add-row fn-add-row-compact">
          <input placeholder="รายการ" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input type="number" placeholder="จำนวน" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
          <button className="fn-btn-save" onClick={handleAdd}>เพิ่ม</button>
          <button className="fn-btn-cancel" onClick={() => setAdding(false)}>×</button>
        </div>
      ) : (
        <button className="fn-btn-add" onClick={() => setAdding(true)}>+ เพิ่มรายการ</button>
      )}
    </div>
  )
}
