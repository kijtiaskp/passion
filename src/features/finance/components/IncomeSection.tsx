import { useState } from 'react'

interface Props {
  salary: number
  carryOver: number
  onUpdate: (field: 'salary' | 'carryOver', value: number) => void
}

export function IncomeSection({ salary, carryOver, onUpdate }: Props) {
  const [editSalary, setEditSalary] = useState(false)
  const [editCarry, setEditCarry] = useState(false)

  return (
    <div className="fn-income">
      <div className="fn-income-item">
        <span className="fn-income-label">เงินเดือน</span>
        {editSalary ? (
          <input
            type="number"
            className="fn-inline-input"
            defaultValue={salary}
            autoFocus
            onBlur={(e) => { onUpdate('salary', Number(e.target.value)); setEditSalary(false) }}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
          />
        ) : (
          <span className="fn-income-value" onClick={() => setEditSalary(true)}>
            {salary.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </span>
        )}
      </div>
      <div className="fn-income-item">
        <span className="fn-income-label">เงินเหลือเดือนก่อน</span>
        {editCarry ? (
          <input
            type="number"
            className="fn-inline-input"
            defaultValue={carryOver}
            autoFocus
            onBlur={(e) => { onUpdate('carryOver', Number(e.target.value)); setEditCarry(false) }}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
          />
        ) : (
          <span className="fn-income-value" onClick={() => setEditCarry(true)}>
            {carryOver.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </span>
        )}
      </div>
    </div>
  )
}
