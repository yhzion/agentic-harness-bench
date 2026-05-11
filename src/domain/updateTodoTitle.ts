import type { Todo } from '../types/todo'

export function updateTodoTitle(todos: readonly Todo[], id: string, title: string): Todo[] {
  const trimmed = title.trim()
  if (!trimmed) {
    throw new Error('제목은 비어 있을 수 없습니다')
  }

  const target = todos.find((t) => t.id === id)
  if (!target) {
    return [...todos]
  }

  return todos.map((t) => (t.id === id ? { ...t, title: trimmed, updatedAt: Date.now() } : t))
}
