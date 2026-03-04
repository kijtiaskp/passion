import { NavLink } from 'react-router-dom'
import { Icons } from './icons'

const apps = [
  { path: '/timelog', label: 'Timelog', icon: Icons.clockNav },
  { path: '/finance', label: 'Finance', icon: Icons.wallet },
  { path: '/secretary', label: 'Secretary', icon: Icons.bot },
]

export function Navigation() {
  return (
    <nav className="app-nav">
      <div className="nav-logo">PASSION</div>
      {apps.map(a => (
        <NavLink
          key={a.path}
          to={a.path}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          {a.icon}
          <span>{a.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
