import { useEffect, useState } from 'react'
import './App.css'
import { fetchTasks, createTask, toggleTask, deleteTask } from './lib/api'

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

  useEffect(() => {
    fetchTasks().then(setTasks).catch(console.error)
  }, [])

  const onAdd = async () => {
    if (!title.trim()) return
    const t = await createTask({ title: title.trim() })
    setTasks((prev) => [t, ...prev])
    setTitle('')
  }

  const onToggle = async (t: Task) => {
    const updated = await toggleTask(t.id, !t.completed)
    setTasks((prev) => prev.map((x) => (x.id === t.id ? updated : x)))
  }

  const onDelete = async (t: Task) => {
    await deleteTask(t.id)
    setTasks((prev) => prev.filter((x) => x.id !== t.id))
  }

  return (
    <>
      <h1>SimpleTasks</h1>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Add a task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={onAdd}>Add</button>
      </div>
      <ul>
        {tasks.map((t) => (
          <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={t.completed} onChange={() => onToggle(t)} />
            <span style={{ textDecoration: t.completed ? 'line-through' : undefined }}>{t.title}</span>
            <button onClick={() => onDelete(t)}>Delete</button>
          </li>
        ))}
      </ul>
    </>
  )
}

export default App
