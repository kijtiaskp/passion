import { useState } from 'react'
import type { CreditCard, Subscription } from '../types'
import { fmt, sumBy } from '../../../utils/format'

interface Props {
  cards: CreditCard[]
  onAdd: (card: Omit<CreditCard, 'id'>) => void
  onUpdate: (id: number, changes: Partial<CreditCard>) => void
  onDelete: (id: number) => void
}

const COL_WIDTHS = ['18%', '12%', '12%', '12%', '12%', '7%', '7%', '12%', '4%']
const EMPTY_CARD = { name: '', creditLimit: 0, used: 0, willPay: 0, min: 0, max: 0, subscriptionTotal: 0 }
const EMPTY_SUB = { name: '', amount: 0, billingDay: 1 }

export function CreditCardSection({ cards, onAdd, onUpdate, onDelete }: Props) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(EMPTY_CARD)

  const sorted = [...cards].sort((a, b) => (b.used ?? 0) - (a.used ?? 0))
  const totalLimit = sumBy(cards, c => c.creditLimit ?? 0)
  const totalUsed = sumBy(cards, c => c.used ?? 0)
  const totalWillPay = sumBy(cards, c => c.willPay)
  const totalSub = sumBy(cards, c => c.subscriptionTotal)

  const handleAdd = () => {
    if (!form.name) return
    onAdd(form)
    setForm(EMPTY_CARD)
    setAdding(false)
  }

  return (
    <div className="fn-section">
      <div className="fn-section-header">
        <h3>บัตรเครดิต</h3>
        <span className="fn-section-total">{fmt(totalUsed)}</span>
      </div>

      {cards.length > 0 && (
        <table className="fn-table fn-cc-table">
          <colgroup>
            {COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
          </colgroup>
          <thead>
            <tr>
              <th>ชื่อบัตร</th>
              <th>วงเงิน</th>
              <th>ใช้ไป</th>
              <th>เหลือ</th>
              <th>ยอดจ่าย</th>
              <th>Min</th>
              <th>Max</th>
              <th>Sub รวม</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(card => (
              <CardRow key={card.id} card={card} onUpdate={onUpdate} onDelete={onDelete} />
            ))}
          </tbody>
          <tfoot>
            <tr className="fn-total-row">
              <td><strong>รวม</strong></td>
              <td><span className="fn-num">{fmt(totalLimit)}</span></td>
              <td><span className="fn-num fn-num-danger">{fmt(totalUsed)}</span></td>
              <td><span className="fn-num">{fmt(totalLimit - totalUsed)}</span></td>
              <td><span className="fn-num">{fmt(totalWillPay)}</span></td>
              <td></td>
              <td></td>
              <td><span className="fn-num">{fmt(totalSub)}</span></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      )}

      {adding ? (
        <div className="fn-add-row">
          <input placeholder="ชื่อบัตร" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input type="number" placeholder="วงเงิน" value={form.creditLimit || ''} onChange={e => setForm({ ...form, creditLimit: Number(e.target.value) })} />
          <input type="number" placeholder="ใช้ไป" value={form.used || ''} onChange={e => setForm({ ...form, used: Number(e.target.value) })} />
          <input type="number" placeholder="ยอดจ่าย" value={form.willPay || ''} onChange={e => setForm({ ...form, willPay: Number(e.target.value) })} />
          <button className="fn-btn-save" onClick={handleAdd}>เพิ่ม</button>
          <button className="fn-btn-cancel" onClick={() => setAdding(false)}>ยกเลิก</button>
        </div>
      ) : (
        <button className="fn-btn-add" onClick={() => setAdding(true)}>+ เพิ่มบัตร</button>
      )}
    </div>
  )
}

// --- Card Row with Subscriptions ---

function CardRow({ card, onUpdate, onDelete }: {
  card: CreditCard
  onUpdate: (id: number, changes: Partial<CreditCard>) => void
  onDelete: (id: number) => void
}) {
  const [addingSub, setAddingSub] = useState(false)
  const [subForm, setSubForm] = useState(EMPTY_SUB)
  const subs = card.subscriptions ?? []
  const remaining = (card.creditLimit ?? 0) - (card.used ?? 0)

  const updateCard = (changes: Partial<CreditCard>) => onUpdate(card.id, changes)

  const updateSubs = (updated: Subscription[]) => {
    updateCard({
      subscriptions: updated,
      subscriptionTotal: sumBy(updated, s => s.amount),
    })
  }

  const handleAddSub = () => {
    if (!subForm.name) return
    updateSubs([...subs, { id: Date.now(), ...subForm }])
    setSubForm(EMPTY_SUB)
    setAddingSub(false)
  }

  return (
    <>
      <tr>
        <td><EditableCell value={card.name} onChange={v => updateCard({ name: v })} /></td>
        <td><EditableNum value={card.creditLimit ?? 0} onChange={v => updateCard({ creditLimit: v })} /></td>
        <td><EditableNum value={card.used ?? 0} onChange={v => updateCard({ used: v })} className="fn-num-danger" /></td>
        <td><span className="fn-num">{fmt(remaining)}</span></td>
        <td><EditableNum value={card.willPay} onChange={v => updateCard({ willPay: v })} /></td>
        <td><EditableNum value={card.min} onChange={v => updateCard({ min: v })} /></td>
        <td><EditableNum value={card.max} onChange={v => updateCard({ max: v })} /></td>
        <td><span className="fn-num">{fmt(card.subscriptionTotal)}</span></td>
        <td><button className="fn-delete-btn" onClick={() => onDelete(card.id)}>×</button></td>
      </tr>
      {subs.map(sub => (
        <tr key={sub.id} className="fn-sub-row">
          <td className="fn-sub-indent">↳ {sub.name}</td>
          <td></td><td></td><td></td>
          <td className="fn-sub-detail">ทุกวันที่ {sub.billingDay}</td>
          <td></td><td></td>
          <td><span className="fn-num">{fmt(sub.amount)}</span></td>
          <td><button className="fn-delete-btn" onClick={() => updateSubs(subs.filter(s => s.id !== sub.id))}>×</button></td>
        </tr>
      ))}
      <tr className="fn-sub-row">
        <td>
          {addingSub ? (
            <div className="fn-add-row fn-sub-add">
              <input placeholder="ชื่อ subscription" value={subForm.name} onChange={e => setSubForm({ ...subForm, name: e.target.value })} />
              <input type="number" placeholder="จำนวน" value={subForm.amount || ''} onChange={e => setSubForm({ ...subForm, amount: Number(e.target.value) })} />
              <input type="number" placeholder="วันที่ตัด" value={subForm.billingDay || ''} onChange={e => setSubForm({ ...subForm, billingDay: Number(e.target.value) })} />
              <button className="fn-btn-save" onClick={handleAddSub}>เพิ่ม</button>
              <button className="fn-btn-cancel" onClick={() => setAddingSub(false)}>ยกเลิก</button>
            </div>
          ) : (
            <button className="fn-btn-add fn-btn-add-sub" onClick={() => setAddingSub(true)}>+ เพิ่ม subscription</button>
          )}
        </td>
        <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
      </tr>
    </>
  )
}

// --- Editable Cells ---

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

function EditableNum({ value, onChange, decimal = true, className }: { value: number; onChange: (v: number) => void; decimal?: boolean; className?: string }) {
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
    <span className={`fn-editable fn-num ${className ?? ''}`} onClick={() => setEditing(true)}>
      {decimal ? fmt(value) : String(value)}
    </span>
  )
}

export { EditableCell, EditableNum }
