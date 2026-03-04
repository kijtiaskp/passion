import { HashRouter } from 'react-router-dom'

export function AppProvider({ children }: { children: React.ReactNode }) {
  return <HashRouter>{children}</HashRouter>
}
