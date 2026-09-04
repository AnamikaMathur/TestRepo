import { NavLink } from 'react-router-dom'
import features from '../features/registry'
import './Sidebar.css'

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">+</span>
        <span className="sidebar-brand-name">HealthTrack</span>
      </div>
      <ul className="sidebar-nav">
        {features.map(f => (
          <li key={f.id}>
            <NavLink
              to={f.path}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{f.icon}</span>
              <span className="nav-label">{f.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <p className="sidebar-hint">Add new features in<br /><code>src/features/registry.js</code></p>
    </nav>
  )
}
