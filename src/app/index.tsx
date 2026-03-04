import { AppProvider } from './provider'
import { AppRouter } from './router'
import { Navigation } from '../components/navigation'
import './app.css'

export default function App() {
  return (
    <AppProvider>
      <div className="app-layout">
        <Navigation />
        <main className="app-main">
          <AppRouter />
        </main>
      </div>
    </AppProvider>
  )
}
