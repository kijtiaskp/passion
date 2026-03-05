import { useState } from 'react'
import type { BankBalance, Expense, BalanceGroup } from '../types'
import { BALANCE_GROUP_LABELS, balanceImpact } from '../types'
import { EditableCell, EditableNum } from './CreditCardSection'

interface Props {
  balances: BankBalance[]
  expenses: Expense[]
  onAdd: (balance: Omit<BankBalance, 'id'>) => void
  onUpdate: (id: number, changes: Partial<BankBalance>) => void
  onDelete: (id: number) => void
}

const GROUP_ORDER: BalanceGroup[] = ['bank', 'ewallet', 'cash']

export function BalanceSection({ balances, expenses, onAdd, onUpdate, onDelete }: Props) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', amount: 0, group: 'bank' as BalanceGroup })
  const total = balances.reduce((s, b) => s + b.amount, 0)

  const accountImpact = (name: string) =>
    expenses.reduce((s, e) => s + balanceImpact(e, name), 0)

  const totalRemaining = balances.reduce((s, b) => s + b.amount + accountImpact(b.name), 0)

  const handleAdd = () => {
    if (!form.name) return
    onAdd(form)
    setForm({ name: '', amount: 0, group: 'bank' })
    setAdding(false)
  }

  const grouped = GROUP_ORDER.map(g => ({
    group: g,
    label: BALANCE_GROUP_LABELS[g],
    items: balances.filter(b => (b.group || 'bank') === g),
  })).filter(g => g.items.length > 0)

  return (
    <div className="fn-section">
      <div className="fn-section-header">
        <h3>ยอดคงเหลือต้นเดือน</h3>
        <span className="fn-section-total">{totalRemaining.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
      </div>

      {grouped.map(({ group, label, items }) => {
        const groupRemaining = items.reduce((s, b) => s + b.amount + accountImpact(b.name), 0)
        return (
          <div key={group} className="fn-balance-group">
            <div className="fn-balance-group-header">
              <span className="fn-balance-group-label">{label}</span>
              <span className={`fn-balance-group-total ${groupRemaining < 0 ? 'fn-remaining-danger' : ''}`}>
                {groupRemaining.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <table className="fn-table">
              <thead>
                <tr>
                  <th>ชื่อบัญชี</th>
                  <th>กลุ่ม</th>
                  <th>ยอดตั้งต้น</th>
                  <th>เปลี่ยนแปลง</th>
                  <th>คงเหลือ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const impact = accountImpact(item.name)
                  const remaining = item.amount + impact
                  return (
                    <tr key={item.id}>
                      <td>
                        <EditableCell value={item.name} onChange={v => onUpdate(item.id, { name: v })} />
                      </td>
                      <td>
                        <select
                          className="fn-inline-select"
                          value={item.group || 'bank'}
                          onChange={e => onUpdate(item.id, { group: e.target.value as BalanceGroup })}
                        >
                          {GROUP_ORDER.map(g => (
                            <option key={g} value={g}>{BALANCE_GROUP_LABELS[g]}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <EditableNum value={item.amount} onChange={v => onUpdate(item.id, { amount: v })} />
                      </td>
                      <td className="fn-spent">{impact.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                      <td className={`fn-remaining ${remaining < 0 ? 'fn-remaining-danger' : ''}`}>
                        {remaining.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <button className="fn-delete-btn" onClick={() => onDelete(item.id)}>×</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}

      {adding ? (
        <div className="fn-add-row fn-add-row-compact">
          <select value={form.group} onChange={e => setForm({ ...form, group: e.target.value as BalanceGroup })}>
            {GROUP_ORDER.map(g => (
              <option key={g} value={g}>{BALANCE_GROUP_LABELS[g]}</option>
            ))}
          </select>
          <input placeholder="ชื่อบัญชี" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input type="number" placeholder="ยอดคงเหลือ" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
          <button className="fn-btn-save" onClick={handleAdd}>เพิ่ม</button>
          <button className="fn-btn-cancel" onClick={() => setAdding(false)}>×</button>
        </div>
      ) : (
        <button className="fn-btn-add" onClick={() => setAdding(true)}>+ เพิ่มบัญชี</button>
      )}
    </div>
  )
}
