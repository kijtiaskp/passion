import { useState, useRef, useMemo } from 'react'
import type { Expense, BankBalance, BillInfo, BalanceGroup, TxType } from '../types'
import { BALANCE_GROUP_LABELS, TX_TYPE_LABELS, signedAmount } from '../types'
import { EditableCell, EditableNum } from './CreditCardSection'
import { CATEGORIES, CATEGORY_LABELS, SUBCATEGORY_LABELS, getCategoryForSub, suggestCategory } from '../categories'

const GROUP_ORDER: BalanceGroup[] = ['bank', 'ewallet', 'cash', 'pocket']

function formatDateLabel(dateStr: string): string {
  if (!dateStr || dateStr === '0000-00-00') return 'ไม่ระบุวันที่'
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.toLocaleDateString('th-TH', { weekday: 'long' })
  const full = d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
  return `${day} ${full}`
}

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

function CategorySelect({ category, subcategory, onChange }: {
  category?: string
  subcategory?: string
  onChange: (cat: string, sub: string) => void
}) {
  const handleSubChange = (subKey: string) => {
    const catKey = getCategoryForSub(subKey)
    onChange(catKey, subKey)
  }

  return (
    <select
      className="fn-inline-select fn-category-select"
      value={subcategory || ''}
      onChange={e => handleSubChange(e.target.value)}
    >
      <option value="">— หมวดหมู่ —</option>
      {CATEGORIES.map(cat => (
        <optgroup key={cat.key} label={cat.label}>
          {cat.subcategories.map(sub => (
            <option key={sub.key} value={sub.key}>{sub.label}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

function CategoryBadge({ category, subcategory }: { category?: string; subcategory?: string }) {
  if (!subcategory) return null
  const catLabel = category ? CATEGORY_LABELS[category] : ''
  const subLabel = SUBCATEGORY_LABELS[subcategory] || subcategory
  return (
    <span className="fn-category-badge" title={catLabel}>
      {subLabel}
    </span>
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
  const [form, setForm] = useState({ name: '', qty: 1, price: 0, bank: '', date: todayStr, time: timeStr, txType: 'expense' as TxType })
  const total = expenses.reduce((s, e) => s + signedAmount(e), 0)

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
    const suggested = suggestCategory(form.name)
    onAdd({
      ...form,
      amount: Math.abs(form.qty * form.price),
      type: account?.group || '',
      category: suggested?.category || '',
      subcategory: suggested?.subcategory || '',
    })
    const n = new Date()
    const d = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
    const t = `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
    setForm({ name: '', qty: 1, price: 0, bank: '', date: d, time: t, txType: 'expense' })
    setAdding(false)
  }

  const handleQtyChange = (id: number, exp: Expense, qty: number) => {
    onUpdate(id, { qty, amount: Math.abs(qty * exp.price) })
  }

  const handlePriceChange = (id: number, exp: Expense, price: number) => {
    onUpdate(id, { price, amount: Math.abs((exp.qty || 1) * price) })
  }

  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({})
  const toggleCollapse = (id: number) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))

  const sortDesc = (a: { date?: string; time?: string }, b: { date?: string; time?: string }) => {
    const da = a.date || '0000-00-00', db = b.date || '0000-00-00'
    if (da !== db) return db.localeCompare(da)
    return (b.time || '00:00').localeCompare(a.time || '00:00')
  }

  const ungrouped = expenses.filter(e => !e.billId).sort(sortDesc)
  const billList = (bills ?? []).map(bill => ({
    bill,
    items: expenses.filter(e => e.billId === bill.id),
  })).sort((a, b) => sortDesc(a.bill, b.bill))

  const dateGroups = useMemo(() => {
    const groups: Record<string, { expenses: Expense[]; bills: typeof billList }> = {}
    const ensure = (d: string) => { if (!groups[d]) groups[d] = { expenses: [], bills: [] } }
    ungrouped.forEach(e => { const d = e.date || '0000-00-00'; ensure(d); groups[d].expenses.push(e) })
    billList.forEach(b => { const d = b.bill.date || '0000-00-00'; ensure(d); groups[d].bills.push(b) })
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [ungrouped, billList])

  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const toggleExpand = (id: number) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const renderBillRow = (exp: Expense) => {
    const tx = exp.txType || 'expense'
    const totalClass = tx === 'income' ? 'fn-income' : tx === 'transfer' ? 'fn-transfer' : 'fn-outcome'
    const prefix = tx === 'income' ? '+' : tx === 'expense' ? '-' : ''
    return (
      <tr key={exp.id}>
        <td>
          <select className="fn-inline-select fn-tx-type-select" value={tx} onChange={e => onUpdate(exp.id, { txType: e.target.value as TxType })}>
            {Object.entries(TX_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </td>
        <td>
          <EditableCell value={exp.name} onChange={v => onUpdate(exp.id, { name: v })} />
        </td>
        <td>
          <EditableNum value={exp.qty || 1} onChange={v => handleQtyChange(exp.id, exp, v)} decimal={false} />
        </td>
        <td>
          <EditableNum value={exp.price || exp.amount} onChange={v => handlePriceChange(exp.id, exp, v)} />
        </td>
        <td className={`fn-expense-total ${totalClass}`}>
          {prefix}{exp.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </td>
        <td>
          <CategorySelect
            category={exp.category}
            subcategory={exp.subcategory}
            onChange={(cat, sub) => onUpdate(exp.id, { category: cat, subcategory: sub })}
          />
        </td>
        <td>
          <button className="fn-delete-btn" onClick={() => onDelete(exp.id)}>×</button>
        </td>
      </tr>
    )
  }

  const renderCompactRow = (exp: Expense) => {
    const tx = exp.txType || 'expense'
    const totalClass = tx === 'income' ? 'fn-income' : tx === 'transfer' ? 'fn-transfer' : 'fn-outcome'
    const prefix = tx === 'income' ? '+' : tx === 'expense' ? '-' : ''
    const isOpen = expanded[exp.id] ?? false
    const bankLabel = tx === 'transfer'
      ? `${exp.bank || '—'} → ${exp.bankTo || '—'}`
      : exp.bank || ''

    return (
      <div key={exp.id} className="fn-compact-row">
        <div className="fn-compact-summary" onClick={() => toggleExpand(exp.id)}>
          <span className={`fn-compact-type fn-compact-type-${tx}`}>{TX_TYPE_LABELS[tx]}</span>
          <span className="fn-compact-name">{exp.name}</span>
          <CategoryBadge category={exp.category} subcategory={exp.subcategory} />
          <span className={`fn-compact-amount ${totalClass}`}>
            {prefix}{exp.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </span>
          {exp.time && <span className="fn-compact-date">{exp.time}</span>}
          <span className="fn-compact-chevron">{isOpen ? '▾' : '▸'}</span>
        </div>
        {isOpen && (
          <div className="fn-compact-detail">
            <div className="fn-compact-field">
              <label>ประเภท</label>
              <select className="fn-inline-select fn-tx-type-select" value={tx} onChange={e => onUpdate(exp.id, { txType: e.target.value as TxType })}>
                {Object.entries(TX_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="fn-compact-field">
              <label>รายการ</label>
              <EditableCell value={exp.name} onChange={v => onUpdate(exp.id, { name: v })} />
            </div>
            <div className="fn-compact-field">
              <label>จำนวน</label>
              <EditableNum value={exp.qty || 1} onChange={v => handleQtyChange(exp.id, exp, v)} decimal={false} />
            </div>
            <div className="fn-compact-field">
              <label>ราคา</label>
              <EditableNum value={exp.price || exp.amount} onChange={v => handlePriceChange(exp.id, exp, v)} />
            </div>
            <div className="fn-compact-field">
              <label>บัญชี</label>
              {tx === 'transfer' ? (
                <span className="fn-transfer-accounts">
                  <AccountSelect value={exp.bank} bankAccounts={bankAccounts} onChange={v => onUpdate(exp.id, { bank: v })} />
                  <span className="fn-transfer-arrow">→</span>
                  <AccountSelect value={exp.bankTo || ''} bankAccounts={bankAccounts} onChange={v => onUpdate(exp.id, { bankTo: v })} />
                </span>
              ) : (
                <AccountSelect value={exp.bank} bankAccounts={bankAccounts} onChange={v => {
                  const account = bankAccounts.find(b => b.name === v)
                  onUpdate(exp.id, { bank: v, type: account?.group || '' })
                }} />
              )}
            </div>
            <div className="fn-compact-field">
              <label>วันที่/เวลา</label>
              <span className="fn-expense-datetime">
                <input type="date" className="fn-inline-date" value={exp.date || ''} onChange={e => onUpdate(exp.id, { date: e.target.value })} />
                <input type="time" className="fn-inline-time" value={exp.time || ''} onChange={e => onUpdate(exp.id, { time: e.target.value })} />
              </span>
            </div>
            <div className="fn-compact-field">
              <label>หมวดหมู่</label>
              <CategorySelect
                category={exp.category}
                subcategory={exp.subcategory}
                onChange={(cat, sub) => onUpdate(exp.id, { category: cat, subcategory: sub })}
              />
            </div>
            <div className="fn-compact-field">
              <button className="fn-delete-btn" onClick={() => onDelete(exp.id)}>×</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const billTableHead = (
    <thead>
      <tr>
        <th>ประเภท</th>
        <th>รายการ</th>
        <th>จำนวน</th>
        <th>ราคา</th>
        <th>รวม</th>
        <th>หมวดหมู่</th>
        <th></th>
      </tr>
    </thead>
  )

  return (
    <div className="fn-section">
      <div className="fn-section-header">
        <h3>รายการประจำเดือน</h3>
        <span className={`fn-section-total ${total < 0 ? 'fn-outcome' : 'fn-income'}`}>
          {total < 0 ? '' : '+'}{total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {dateGroups.map(([date, group], idx) => {
        const allItems = [...group.expenses, ...group.bills.flatMap(b => b.items)]
        const dayTotal = allItems.reduce((s, e) => s + signedAmount(e), 0)
        return (
        <div key={date}>
          {idx > 0 && <div className="fn-date-divider" />}
          <div className="fn-date-header">
            <span>{formatDateLabel(date)}</span>
            <span className={`fn-date-total ${dayTotal < 0 ? 'fn-outcome' : 'fn-income'}`}>
              {dayTotal < 0 ? '' : '+'}{dayTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {group.expenses.length > 0 && (
            <div className="fn-compact-list">
              {group.expenses.map(exp => renderCompactRow(exp))}
            </div>
          )}

          {group.bills.map(({ bill, items }) => {
            const groupTotal = items.reduce((s, e) => s + signedAmount(e), 0)
            const groupBank = items[0]?.bank || ''
            const isCollapsed = collapsed[bill.id] ?? false
            return (
              <div key={bill.id} className="fn-bill-group">
                <div className="fn-bill-group-header">
                  <span className="fn-bill-group-label fn-clickable" onClick={() => toggleCollapse(bill.id)}>
                    {isCollapsed ? '▸' : '▾'} {bill.storeName}{bill.branch ? ` — ${bill.branch}` : ''}
                    {bill.date && <span className="fn-bill-group-date">{bill.time}</span>}
                  </span>
                  <div className="fn-bill-group-actions">
                    <AccountSelect value={groupBank} bankAccounts={bankAccounts} onChange={v => {
                      const account = bankAccounts.find(b => b.name === v)
                      onUpdateByBill(bill.id, { bank: v, type: account?.group || '' })
                    }} />
                    <span className={`fn-bill-group-total ${groupTotal < 0 ? 'fn-outcome' : 'fn-income'}`}>
                      {groupTotal < 0 ? '' : '+'}{groupTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                    <button className="fn-delete-btn" onClick={() => onDeleteBill(bill.id)} title="ลบบิลทั้งหมด">×</button>
                  </div>
                </div>
                {!isCollapsed && (
                  <>
                    <BillDetail bill={bill} onUploadImage={handleUploadImage} />
                    <table className="fn-table">
                      {billTableHead}
                      <tbody>{items.map(exp => renderBillRow(exp))}</tbody>
                    </table>
                  </>
                )}
              </div>
            )
          })}
        </div>
        )
      })}

      {adding ? (
        <div className="fn-add-row">
          <select className="fn-inline-select" value={form.txType} onChange={e => setForm({ ...form, txType: e.target.value as TxType })}>
            {Object.entries(TX_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
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
        <button className="fn-btn-add" onClick={() => setAdding(true)}>+ เพิ่มรายการ</button>
      )}
    </div>
  )
}
