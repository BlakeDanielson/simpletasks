export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export async function fetchTasks(params?: {
  page?: number
  pageSize?: number
  completed?: boolean
  dueBefore?: string
  dueAfter?: string
  sortBy?: 'createdAt' | 'dueDate' | 'title' | 'completed'
  sortOrder?: 'asc' | 'desc'
}) {
  const qs = new URLSearchParams()
  if (params) {
    if (params.page) qs.set('page', String(params.page))
    if (params.pageSize) qs.set('pageSize', String(params.pageSize))
    if (typeof params.completed === 'boolean') qs.set('completed', String(params.completed))
    if (params.dueBefore) qs.set('dueBefore', params.dueBefore)
    if (params.dueAfter) qs.set('dueAfter', params.dueAfter)
    if (params.sortBy) qs.set('sortBy', params.sortBy)
    if (params.sortOrder) qs.set('sortOrder', params.sortOrder)
  }
  const url = `${API_BASE_URL}/api/tasks${qs.toString() ? `?${qs.toString()}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch tasks')
  return res.json()
}

export async function createTask(input: { title: string; description?: string; dueDate?: string }) {
  const res = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create task')
  return res.json()
}

export async function toggleTask(id: number, completed: boolean) {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  })
  if (!res.ok) throw new Error('Failed to update task')
  return res.json()
}

export async function deleteTask(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete task')
}


