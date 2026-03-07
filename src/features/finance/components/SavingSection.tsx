import { useState } from 'react'
import type { SavingItem } from '../types'
import { EditableCell, EditableNum } from './CreditCardSection'
import { fmt, sumBy } from '../../../utils/format'

interface Props {
  savings: SavingItem[]
  onAdd: (saving: Omit<SavingItem, 'id'>) => void
  onUpdate: (id: number, changes: Partial<SavingItem>) => void
  onDelete: (id: number) => void
}

export function SavingSection({ savings, onAdd, onUpdate, onDelete }: Props) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', amount: 0 })
  const total = sumBy(savings, sv => sv.amount)

  const handleAdd = () => {
    if (!form.name) return
    onAdd(form)
    setForm({ name: '', amount: 0 })
    setAdding(false)
  }

  return (
    <div className="fn-section fn-section-half">
      <div className="fn-section-header">
        <h3>เงินออมอนาคต</h3>
        <span className="fn-section-total">{fmt(total)}</span>
      </div>

      {savings.length > 0 && (
        <table className="fn-table">
          <thead>
            <tr>
              <th>รายการ</th>
              <th>จำนวน</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {savings.map(item => (
              <tr key={item.id}>
                <td>
                  <EditableCell value={item.name} onChange={v => onUpdate(item.id, { name: v })} />
                </td>
                <td>
                  <EditableNum value={item.amount} onChange={v => onUpdate(item.id, { amount: v })} />
                </td>
                <td>
                  <button className="fn-delete-btn" onClick={() => onDelete(item.id)}>×</button>
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
