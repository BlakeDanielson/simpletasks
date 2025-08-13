import { useState, type PropsWithChildren } from 'react'
import './layout.css'

export function Layout({ children }: PropsWithChildren) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-grid">
      <header className="app-header">
        <button className="btn" aria-label="Toggle sidebar" onClick={() => setSidebarOpen((v) => !v)}>
          ☰
        </button>
        <div style={{ fontWeight: 700, marginLeft: 8 }}>SimpleTasks</div>
      </header>
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <nav>
          <ul>
            <li>All Tasks</li>
          </ul>
        </nav>
      </aside>
      <main className="app-content">{children}</main>
    </div>
  )
}


