import { useState } from 'react'
import type { CreditCard } from '../types'

interface Props {
  cards: CreditCard[]
  onAdd: (card: Omit<CreditCard, 'id'>) => void
  onUpdate: (id: number, changes: Partial<CreditCard>) => void
  onDelete: (id: number) => void
}

export function CreditCardSection({ cards, onAdd, onUpdate, onDelete }: Props) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', willPay: 0, min: 0, max: 0, subscriptionTotal: 0 })
  const total = cards.reduce((s, c) => s + c.willPay, 0)

  const handleAdd = () => {
    if (!form.name) return
    onAdd(form)
    setForm({ name: '', willPay: 0, min: 0, max: 0, subscriptionTotal: 0 })
    setAdding(false)
  }

  return (
    <div className="fn-section">
      <div className="fn-section-header">
        <h3>บัตรเครดิต</h3>
        <span className="fn-section-total">{total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
      </div>

      {cards.length > 0 && (
        <table className="fn-table">
          <thead>
            <tr>
              <th>ชื่อบัตร</th>
              <th>ยอดจ่าย</th>
              <th>Min</th>
              <th>Max</th>
              <th>Sub รวม</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cards.map(card => (
              <tr key={card.id}>
                <td>
                  <EditableCell value={card.name} onChange={v => onUpdate(card.id, { name: v })} />
                </td>
                <td>
                  <EditableNum value={card.willPay} onChange={v => onUpdate(card.id, { willPay: v })} />
                </td>
                <td>
                  <EditableNum value={card.min} onChange={v => onUpdate(card.id, { min: v })} />
                </td>
                <td>
                  <EditableNum value={card.max} onChange={v => onUpdate(card.id, { max: v })} />
                </td>
                <td>
                  <EditableNum value={card.subscriptionTotal} onChange={v => onUpdate(card.id, { subscriptionTotal: v })} />
                </td>
                <td>
                  <button className="fn-delete-btn" onClick={() => onDelete(card.id)}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {adding ? (
        <div className="fn-add-row">
          <input placeholder="ชื่อบัตร" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input type="number" placeholder="ยอดจ่าย" value={form.willPay || ''} onChange={e => setForm({ ...form, willPay: Number(e.target.value) })} />
          <input type="number" placeholder="Min" value={form.min || ''} onChange={e => setForm({ ...form, min: Number(e.target.value) })} />
          <input type="number" placeholder="Max" value={form.max || ''} onChange={e => setForm({ ...form, max: Number(e.target.value) })} />
          <input type="number" placeholder="Sub รวม" value={form.subscriptionTotal || ''} onChange={e => setForm({ ...form, subscriptionTotal: Number(e.target.value) })} />
          <button className="fn-btn-save" onClick={handleAdd}>เพิ่ม</button>
          <button className="fn-btn-cancel" onClick={() => setAdding(false)}>ยกเลิก</button>
        </div>
      ) : (
        <button className="fn-btn-add" onClick={() => setAdding(true)}>+ เพิ่มบัตร</button>
      )}
    </div>
  )
}

// Reusable editable cells
function EditableCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  if (editing) {
    return (
      <input
        className="fn-inline-input"
        defaultValue={value}
        autoFocus
        onBlur={e => { onChange(e.target.value); setEditing(false) }}
        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
      />
    )
  }
  return <span className="fn-editable" onClick={() => setEditing(true)}>{value}</span>
}

function EditableNum({ value, onChange, decimal = true }: { value: number; onChange: (v: number) => void; decimal?: boolean }) {
  const [editing, setEditing] = useState(false)
  if (editing) {
    return (
      <input
        type="number"
        className="fn-inline-input"
        defaultValue={value}
        autoFocus
        onBlur={e => { onChange(Number(e.target.value)); setEditing(false) }}
        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
      />
    )
  }
  return (
    <span className="fn-editable fn-num" onClick={() => setEditing(true)}>
      {decimal ? value.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : String(value)}
    </span>
  )
}

export { EditableCell, EditableNum }
