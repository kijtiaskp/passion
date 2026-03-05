import { useState, useRef } from 'react'
import type { Expense, BankBalance, BillInfo, BalanceGroup } from '../types'
import { BALANCE_GROUP_LABELS } from '../types'
import { EditableCell, EditableNum } from './CreditCardSection'

const GROUP_ORDER: BalanceGroup[] = ['bank', 'ewallet', 'cash']

function AccountSelect({ value, bankAccounts, onChange }: { value: string; bankAccounts: BankBalance[]; onChange: (v: string) => void }) {
  const grouped = GROUP_ORDER.map(g => ({
    group: g,
    label: BALANCE_GROUP_LABELS[g],
    items: bankAccounts.filter(b => (b.group || 'bank') === g),
  })).filter(g => g.items.length > 0)

  return (
    <select className="fn-inline-select" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">—</option>
      {grouped.map(g => (
        <optgroup key={g.group} label={g.label}>
          {g.items.map(b => (
            <option key={b.id} value={b.name}>{b.name}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

function ImagePreview({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fn-preview-overlay" onClick={onClose}>
      <div className="fn-preview-content" onClick={e => e.stopPropagation()}>
        <button className="fn-preview-close" onClick={onClose}>×</button>
        <img src={src} alt="bill" />
      </div>
    </div>
  )
}

function BillDetail({ bill, onUploadImage }: { bill: BillInfo; onUploadImage: (billId: number, file: File) => void }) {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const imgSrc = bill.image ? `/api/finance/images/${bill.image}` : null

  return (
    <div className="fn-bill-detail">
      <div className="fn-bill-detail-actions">
        <button className="fn-bill-detail-toggle" onClick={() => setOpen(!open)}>
          {open ? '▾' : '▸'} รายละเอียดบิล
        </button>
        {imgSrc ? (
          <button className="fn-bill-img-btn" onClick={() => setPreview(true)}>ดูรูปบิล</button>
        ) : (
          <button className="fn-bill-img-btn" onClick={() => fileRef.current?.click()}>แนบรูปบิล</button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) onUploadImage(bill.id, f)
            if (fileRef.current) fileRef.current.value = ''
          }}
        />
      </div>
      {open && (
        <div className="fn-bill-detail-grid">
          {imgSrc && (
            <div className="fn-bill-thumb-row">
              <img src={imgSrc} alt="bill" className="fn-bill-thumb" onClick={() => setPreview(true)} />
              <button className="fn-bill-img-btn" onClick={() => fileRef.current?.click()}>เปลี่ยนรูป</button>
            </div>
          )}
          {bill.branch && <div><span className="fn-bill-label">สาขา</span><span>{bill.branch}</span></div>}
          {bill.storeCode && <div><span className="fn-bill-label">รหัสร้าน</span><span>{bill.storeCode}</span></div>}
          {bill.receiptNo && <div><span className="fn-bill-label">เลขที่ใบเสร็จ</span><span>{bill.receiptNo}</span></div>}
          {bill.date && <div><span className="fn-bill-label">วันที่</span><span>{bill.date} {bill.time}</span></div>}
          {bill.paymentMethod && <div><span className="fn-bill-label">ชำระผ่าน</span><span>{bill.paymentMethod}</span></div>}
          {bill.transactionId && <div><span className="fn-bill-label">TID</span><span>{bill.transactionId}</span></div>}
          {bill.note && <div><span className="fn-bill-label">หมายเหตุ</span><span>{bill.note}</span></div>}
        </div>
      )}
      {preview && imgSrc && <ImagePreview src={imgSrc} onClose={() => setPreview(false)} />}
    </div>
  )
}

interface Props {
  expenses: Expense[]
  bills: BillInfo[]
  bankAccounts: BankBalance[]
  onAdd: (expense: Omit<Expense, 'id'>) => void
  onUpdate: (id: number, changes: Partial<Expense>) => void
  onUpdateByBill: (billId: number, changes: Partial<Expense>) => void
  onDelete: (id: number) => void
  onUpdateBill: (id: number, changes: Partial<BillInfo>) => void
  onDeleteBill: (id: number) => void
}

export function ExpenseSection({ expenses, bills, bankAccounts, onAdd, onUpdate, onUpdateByBill, onDelete, onUpdateBill, onDeleteBill }: Props) {
  const [adding, setAdding] = useState(false)
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const [form, setForm] = useState({ name: '', qty: 1, price: 0, bank: '', date: todayStr, time: timeStr })
  const total = expenses.reduce((s, e) => s + e.amount, 0)

  const handleUploadImage = async (billId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/finance/upload-image', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.filename) {
        onUpdateBill(billId, { image: data.filename })
      }
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  const handleAdd = () => {
    if (!form.name) return
    const account = bankAccounts.find(b => b.name === form.bank)
    onAdd({ ...form, amount: form.qty * form.price, type: account?.group || '' })
    const n = new Date()
    const d = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
    const t = `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
    setForm({ name: '', qty: 1, price: 0, bank: '', date: d, time: t })
    setAdding(false)
  }

  const handleQtyChange = (id: number, exp: Expense, qty: number) => {
    onUpdate(id, { qty, amount: qty * exp.price })
  }

  const handlePriceChange = (id: number, exp: Expense, price: number) => {
    onUpdate(id, { price, amount: (exp.qty || 1) * price })
  }

  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({})
  const toggleCollapse = (id: number) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))

  const ungrouped = expenses.filter(e => !e.billId)
  const billList = (bills ?? []).map(bill => ({
    bill,
    items: expenses.filter(e => e.billId === bill.id),
  }))

  const renderRow = (exp: Expense, showAccount: boolean, showDateTime: boolean) => (
    <tr key={exp.id}>
      <td>
        <EditableCell value={exp.name} onChange={v => onUpdate(exp.id, { name: v })} />
      </td>
      <td>
        <EditableNum value={exp.qty || 1} onChange={v => handleQtyChange(exp.id, exp, v)} decimal={false} />
      </td>
      <td>
        <EditableNum value={exp.price || exp.amount} onChange={v => handlePriceChange(exp.id, exp, v)} />
      </td>
      <td className={`fn-expense-total ${exp.amount < 0 ? 'fn-discount' : ''}`}>
        {exp.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
      </td>
      {showAccount && (
        <td>
          <AccountSelect value={exp.bank} bankAccounts={bankAccounts} onChange={v => {
            const account = bankAccounts.find(b => b.name === v)
            onUpdate(exp.id, { bank: v, type: account?.group || '' })
          }} />
        </td>
      )}
      {showDateTime && (
        <td className="fn-expense-datetime">
          <input type="date" className="fn-inline-date" value={exp.date || ''} onChange={e => onUpdate(exp.id, { date: e.target.value })} />
          <input type="time" className="fn-inline-time" value={exp.time || ''} onChange={e => onUpdate(exp.id, { time: e.target.value })} />
        </td>
      )}
      <td>
        <button className="fn-delete-btn" onClick={() => onDelete(exp.id)}>×</button>
      </td>
    </tr>
  )

  const tableHead = (showAccount: boolean, showDateTime: boolean) => (
    <thead>
      <tr>
        <th>รายการ</th>
        <th>จำนวน</th>
        <th>ราคา</th>
        <th>รวม</th>
        {showAccount && <th>บัญชี</th>}
        {showDateTime && <th>วันที่/เวลา</th>}
        <th></th>
      </tr>
    </thead>
  )

  return (
    <div className="fn-section">
      <div className="fn-section-header">
        <h3>รายจ่ายประจำเดือน</h3>
        <span className="fn-section-total">{total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
      </div>

      {ungrouped.length > 0 && (
        <table className="fn-table">
          {tableHead(true, true)}
          <tbody>{ungrouped.map(exp => renderRow(exp, true, true))}</tbody>
        </table>
      )}

      {billList.map(({ bill, items }) => {
        const groupTotal = items.reduce((s, e) => s + e.amount, 0)
        const groupBank = items[0]?.bank || ''
        const isCollapsed = collapsed[bill.id] ?? false
        return (
          <div key={bill.id} className="fn-bill-group">
            <div className="fn-bill-group-header">
              <span className="fn-bill-group-label fn-clickable" onClick={() => toggleCollapse(bill.id)}>
                {isCollapsed ? '▸' : '▾'} {bill.storeName}{bill.branch ? ` — ${bill.branch}` : ''}
                {bill.date && <span className="fn-bill-group-date">{bill.date} {bill.time}</span>}
              </span>
              <div className="fn-bill-group-actions">
                <AccountSelect value={groupBank} bankAccounts={bankAccounts} onChange={v => {
                  const account = bankAccounts.find(b => b.name === v)
                  onUpdateByBill(bill.id, { bank: v, type: account?.group || '' })
                }} />
                <span className="fn-bill-group-total">{groupTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                <button className="fn-delete-btn" onClick={() => onDeleteBill(bill.id)} title="ลบบิลทั้งหมด">×</button>
              </div>
            </div>
            {!isCollapsed && (
              <>
                <BillDetail bill={bill} onUploadImage={handleUploadImage} />
                <table className="fn-table">
                  {tableHead(false, false)}
                  <tbody>{items.map(exp => renderRow(exp, false, false))}</tbody>
                </table>
              </>
            )}
          </div>
        )
      })}

      {adding ? (
        <div className="fn-add-row">
          <input placeholder="รายการ" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input type="number" placeholder="จำนวน" value={form.qty || ''} onChange={e => setForm({ ...form, qty: Number(e.target.value) })} style={{ maxWidth: 80 }} />
          <input type="number" placeholder="ราคา" value={form.price || ''} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
          <AccountSelect value={form.bank} bankAccounts={bankAccounts} onChange={v => setForm({ ...form, bank: v })} />
          <input type="date" className="fn-inline-date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <input type="time" className="fn-inline-time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          <button className="fn-btn-save" onClick={handleAdd}>เพิ่ม</button>
          <button className="fn-btn-cancel" onClick={() => setAdding(false)}>ยกเลิก</button>
        </div>
      ) : (
        <button className="fn-btn-add" onClick={() => setAdding(true)}>+ เพิ่มรายจ่าย</button>
      )}
    </div>
  )
}
