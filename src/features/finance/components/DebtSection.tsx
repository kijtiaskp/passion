import { useState } from 'react'
import type { Debt } from '../types'
import { EditableCell, EditableNum } from './CreditCardSection'

interface Props {
  debts: Debt[]
  onAdd: (debt: Omit<Debt, 'id'>) => void
  onUpdate: (id: number, changes: Partial<Debt>) => void
  onDelete: (id: number) => void
}

export function DebtSection({ debts, onAdd, onUpdate, onDelete }: Props) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', amount: 0, paid: false })
  const total = debts.filter(d => !d.paid).reduce((s, d) => s + d.amount, 0)

  const handleAdd = () => {
    if (!form.name) return
    onAdd(form)
    setForm({ name: '', amount: 0, paid: false })
    setAdding(false)
  }

  return (
    <div className="fn-section fn-section-half">
      <div className="fn-section-header">
        <h3>หนี้คนรู้จัก</h3>
        <span className="fn-section-total">{total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
      </div>

      {debts.length > 0 && (
        <table className="fn-table">
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>จำนวน</th>
              <th>จ่ายแล้ว</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {debts.map(debt => (
              <tr key={debt.id} className={debt.paid ? 'fn-row-paid' : ''}>
                <td>
                  <EditableCell value={debt.name} onChange={v => onUpdate(debt.id, { name: v })} />
                </td>
                <td>
                  <EditableNum value={debt.amount} onChange={v => onUpdate(debt.id, { amount: v })} />
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="fn-checkbox"
                    checked={debt.paid}
                    onChange={e => onUpdate(debt.id, { paid: e.target.checked })}
                  />
                </td>
                <td>
                  <button className="fn-delete-btn" onClick={() => onDelete(debt.id)}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {adding ? (
        <div className="fn-add-row fn-add-row-compact">
          <input placeholder="ชื่อ" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input type="number" placeholder="จำนวน" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
          <button className="fn-btn-save" onClick={handleAdd}>เพิ่ม</button>
          <button className="fn-btn-cancel" onClick={() => setAdding(false)}>×</button>
        </div>
      ) : (
        <button className="fn-btn-add" onClick={() => setAdding(true)}>+ เพิ่มหนี้</button>
      )}
    </div>
  )
}
