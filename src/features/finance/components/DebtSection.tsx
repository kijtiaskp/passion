import { useState } from 'react'
import type { Debt, DebtDirection } from '../types'
import { EditableCell, EditableNum } from './CreditCardSection'
import { fmt, sumBy } from '../../../utils/format'

interface Props {
  debts: Debt[]
  onAdd: (debt: Omit<Debt, 'id'>) => void
  onUpdate: (id: number, changes: Partial<Debt>) => void
  onDelete: (id: number) => void
}

function DebtTable({ debts, onUpdate, onDelete }: Pick<Props, 'onUpdate' | 'onDelete'> & { debts: Debt[] }) {
  if (debts.length === 0) return null
  return (
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
  )
}

export function DebtSection({ debts, onAdd, onUpdate, onDelete }: Props) {
  const [addingDir, setAddingDir] = useState<DebtDirection | null>(null)
  const [form, setForm] = useState({ name: '', amount: 0 })

  const oweDebts = debts.filter(d => (d.direction || 'owe') === 'owe')
  const lentDebts = debts.filter(d => d.direction === 'lent')
  const oweTotal = sumBy(oweDebts.filter(d => !d.paid), d => d.amount)
  const lentTotal = sumBy(lentDebts.filter(d => !d.paid), d => d.amount)

  const handleAdd = (direction: DebtDirection) => {
    if (!form.name) return
    onAdd({ ...form, paid: false, direction })
    setForm({ name: '', amount: 0 })
    setAddingDir(null)
  }

  const addRow = (direction: DebtDirection) => (
    addingDir === direction ? (
      <div className="fn-add-row fn-add-row-compact">
        <input placeholder="ชื่อ" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input type="number" placeholder="จำนวน" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
        <button className="fn-btn-save" onClick={() => handleAdd(direction)}>เพิ่ม</button>
        <button className="fn-btn-cancel" onClick={() => setAddingDir(null)}>×</button>
      </div>
    ) : (
      <button className="fn-btn-add" onClick={() => { setAddingDir(direction); setForm({ name: '', amount: 0 }) }}>+ เพิ่ม</button>
    )
  )

  return (
    <div className="fn-section fn-section-half">
      <div className="fn-section-header">
        <h3>หนี้คนรู้จัก</h3>
      </div>

      <div className="fn-debt-sub">
        <div className="fn-debt-sub-header">
          <span className="fn-debt-sub-label fn-debt-owe">เราติดหนี้เขา</span>
          <span className="fn-section-total">{fmt(oweTotal)}</span>
        </div>
        <DebtTable debts={oweDebts} onUpdate={onUpdate} onDelete={onDelete} />
        {addRow('owe')}
      </div>

      <div className="fn-debt-sub">
        <div className="fn-debt-sub-header">
          <span className="fn-debt-sub-label fn-debt-lent">เขาติดหนี้เรา</span>
          <span className="fn-section-total">{fmt(lentTotal)}</span>
        </div>
        <DebtTable debts={lentDebts} onUpdate={onUpdate} onDelete={onDelete} />
        {addRow('lent')}
      </div>
    </div>
  )
}
