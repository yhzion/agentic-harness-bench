import type { Todo } from '../types/todo'

export function toggleTodo(todos: readonly Todo[], id: string): Todo[] {
  return todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: Date.now() } : todo,
  )
}
