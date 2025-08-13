import { useEffect, useState } from 'react'
import './App.css'
import { fetchTasks, createTask, toggleTask, deleteTask } from './lib/api'
import { Layout } from './components/layout/Layout'

type Task = {
  id: number
  title: string
  description?: string | null
  dueDate?: string | null
  completed: boolean
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchTasks({ page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' })
      .then(setTasks)
      .catch(() => setError('Failed to load tasks. Try again.'))
      .finally(() => setLoading(false))
  }, [])

  const onAdd = async () => {
    if (!title.trim()) return
    try {
      setLoading(true)
      const t = await createTask({ title: title.trim() })
      setTasks((prev) => [t, ...prev])
      setTitle('')
    } catch (e) {
      setError('Failed to add task')
    } finally {
      setLoading(false)
    }
  }

  const onToggle = async (t: Task) => {
    try {
      const updated = await toggleTask(t.id, !t.completed)
      setTasks((prev) => prev.map((x) => (x.id === t.id ? updated : x)))
    } catch (e) {
      setError('Failed to update task')
    }
  }

  const onDelete = async (t: Task) => {
    try {
      await deleteTask(t.id)
      setTasks((prev) => prev.filter((x) => x.id !== t.id))
    } catch (e) {
      setError('Failed to delete task')
    }
  }

  return (
    <Layout>
      {error ? (
        <div className="card" style={{ marginBottom: 12, borderColor: '#b91c1c', color: '#fca5a5' }}>
          {error}
        </div>
      ) : null}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Add a task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={onAdd} disabled={loading}>Add</button>
      </div>
      {loading ? <div style={{ padding: 12 }}>Loading...</div> : null}
      <ul aria-busy={loading} aria-live="polite">
        {tasks.map((t) => (
          <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={t.completed} onChange={() => onToggle(t)} disabled={loading} />
            <span style={{ textDecoration: t.completed ? 'line-through' : undefined }}>{t.title}</span>
            <button onClick={() => onDelete(t)} disabled={loading}>Delete</button>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export default App
