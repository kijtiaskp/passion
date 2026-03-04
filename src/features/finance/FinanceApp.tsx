import { Icons } from '../../components/icons'
import './finance.css'

export function FinanceApp() {
  return (
    <div className="placeholder-container">
      <div className="placeholder-icon">{Icons.wallet}</div>
      <h1 className="placeholder-title">FINANCE</h1>
      <p className="placeholder-desc">รายรับรายจ่าย — coming soon</p>
    </div>
  )
}
