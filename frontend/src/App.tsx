import { useEffect, useState } from 'react'
import './App.css'
import { fetchTasks, createTask, toggleTask, deleteTask, parseNlp } from './lib/api'
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
  const [nlpText, setNlpText] = useState('')
  const [nlpDraft, setNlpDraft] = useState<{ title: string; description: string | null; dueDate: string | null } | null>(null)

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

  const onParse = async () => {
    if (!nlpText.trim()) return
    try {
      setLoading(true)
      setError(null)
      const parsed = await parseNlp({ text: nlpText.trim() })
      setNlpDraft(parsed)
    } catch {
      setError('Failed to parse input')
    } finally {
      setLoading(false)
    }
  }

  const onConfirmParsed = async () => {
    if (!nlpDraft) return
    try {
      setLoading(true)
      const t = await createTask({ title: nlpDraft.title, description: nlpDraft.description ?? undefined, dueDate: nlpDraft.dueDate ?? undefined })
      setTasks((prev) => [t, ...prev])
      setNlpDraft(null)
      setNlpText('')
    } catch {
      setError('Failed to create task from parsed input')
    } finally {
      setLoading(false)
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
      <div className="card" style={{ marginTop: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Type a task in natural language (e.g., ‘Write report tomorrow’)"
            value={nlpText}
            onChange={(e) => setNlpText(e.target.value)}
          />
          <button onClick={onParse} disabled={loading}>Parse</button>
        </div>
        {nlpDraft ? (
          <div style={{ marginTop: 8 }}>
            <div>Title: {nlpDraft.title}</div>
            {nlpDraft.description ? <div>Description: {nlpDraft.description}</div> : null}
            {nlpDraft.dueDate ? <div>Due: {new Date(nlpDraft.dueDate).toLocaleString()}</div> : <div>Due: none</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={onConfirmParsed} disabled={loading}>Add Task</button>
              <button onClick={() => setNlpDraft(null)} disabled={loading}>Discard</button>
            </div>
          </div>
        ) : null}
      </div>
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
