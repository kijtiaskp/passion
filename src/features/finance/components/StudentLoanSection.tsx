import { useState } from 'react'
import type { StudentLoan } from '../types'
import { EditableNum } from './CreditCardSection'
import { fmt } from '../../../utils/format'

interface Props {
  loans: StudentLoan[]
  onAdd: (loan: Omit<StudentLoan, 'id'>) => void
  onUpdate: (id: number, changes: Partial<StudentLoan>) => void
  onDelete: (id: number) => void
}

const EMPTY_LOAN = { principal: 0, interest: 0, penalty: 0, overdue: 0, accountNo: '' }

export function StudentLoanSection({ loans, onAdd, onUpdate, onDelete }: Props) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(EMPTY_LOAN)

  const handleAdd = () => {
    if (!form.principal) return
    onAdd(form)
    setForm(EMPTY_LOAN)
    setAdding(false)
  }

  return (
    <div className="fn-section">
      <div className="fn-section-header">
        <h3>กยศ.</h3>
      </div>

      {loans.map(loan => {
        const total = loan.principal + loan.interest + loan.penalty
        return (
          <div key={loan.id} className="fn-sl-card">
            {loan.accountNo && (
              <div className="fn-sl-account">บัญชี กยศ. {loan.accountNo}</div>
            )}

            <table className="fn-table fn-sl-table">
              <tbody>
                <tr>
                  <td className="fn-sl-label">เงินต้น</td>
                  <td className="fn-sl-value">
                    <EditableNum value={loan.principal} onChange={v => onUpdate(loan.id, { principal: v })} />
                  </td>
                </tr>
                <tr>
                  <td className="fn-sl-label">ดอกเบี้ย</td>
                  <td className="fn-sl-value">
                    <EditableNum value={loan.interest} onChange={v => onUpdate(loan.id, { interest: v })} />
                  </td>
                </tr>
                <tr>
                  <td className="fn-sl-label">เบี้ยปรับ</td>
                  <td className="fn-sl-value">
                    <EditableNum value={loan.penalty} onChange={v => onUpdate(loan.id, { penalty: v })} />
                  </td>
                </tr>
                <tr className="fn-sl-total-row">
                  <td className="fn-sl-label"><strong>ยอดรวม</strong></td>
                  <td className="fn-sl-value"><span className="fn-num fn-num-danger">{fmt(total)}</span></td>
                </tr>
                <tr>
                  <td className="fn-sl-label">ค้างชำระ</td>
                  <td className="fn-sl-value">
                    <EditableNum value={loan.overdue} onChange={v => onUpdate(loan.id, { overdue: v })} className="fn-num-warning" />
                  </td>
                </tr>
              </tbody>
            </table>

            <button className="fn-delete-btn fn-sl-delete" onClick={() => onDelete(loan.id)}>ลบ</button>
          </div>
        )
      })}

      {adding ? (
        <div className="fn-add-row fn-sl-add">
          <input placeholder="เลขบัญชี กยศ." value={form.accountNo} onChange={e => setForm({ ...form, accountNo: e.target.value })} />
          <input type="number" placeholder="เงินต้น" value={form.principal || ''} onChange={e => setForm({ ...form, principal: Number(e.target.value) })} />
          <input type="number" placeholder="ดอกเบี้ย" value={form.interest || ''} onChange={e => setForm({ ...form, interest: Number(e.target.value) })} />
          <input type="number" placeholder="เบี้ยปรับ" value={form.penalty || ''} onChange={e => setForm({ ...form, penalty: Number(e.target.value) })} />
          <input type="number" placeholder="ค้างชำระ" value={form.overdue || ''} onChange={e => setForm({ ...form, overdue: Number(e.target.value) })} />
          <button className="fn-btn-save" onClick={handleAdd}>เพิ่ม</button>
          <button className="fn-btn-cancel" onClick={() => setAdding(false)}>ยกเลิก</button>
        </div>
      ) : (
        <button className="fn-btn-add" onClick={() => setAdding(true)}>+ เพิ่ม กยศ.</button>
      )}
    </div>
  )
}
