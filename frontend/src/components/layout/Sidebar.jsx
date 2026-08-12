import { NavLink } from 'react-router-dom'
import { NAV } from '../../config/nav'

export default function Sidebar({ onNavigate }) {
  return (
    <nav aria-label="Navigation du contenu" className="flex flex-col gap-6">
      {NAV.map((g) => (
        <div key={g.group}>
          <div
            className="font-ui text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {g.group}
          </div>
          <ul className="flex flex-col gap-0.5">
            {g.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  className="block rounded-r-lg pl-3 pr-3 py-2 font-ui text-sm transition-colors hover:bg-black/[0.045]"
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--or-dark)' : 'var(--text-primary)',
                    background: isActive ? 'rgba(109,91,208,0.12)' : 'transparent',
                    fontWeight: isActive ? 600 : 400,
                    borderLeft: isActive ? '3px solid var(--or)' : '3px solid transparent',
                    marginLeft: -1,
                  })}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
