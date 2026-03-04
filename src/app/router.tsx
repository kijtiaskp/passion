import { Routes, Route, Navigate } from 'react-router-dom'
import { TimelogApp } from '../features/timelog/TimelogApp'
import { FinanceApp } from '../features/finance/FinanceApp'
import { SecretaryApp } from '../features/secretary/SecretaryApp'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/timelog" replace />} />
      <Route path="/timelog" element={<TimelogApp />} />
      <Route path="/finance" element={<FinanceApp />} />
      <Route path="/secretary" element={<SecretaryApp />} />
    </Routes>
  )
}
