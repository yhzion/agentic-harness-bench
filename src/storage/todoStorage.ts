import type { Todo } from '../types/todo'
import { deserializeTodos } from './deserializeTodos'
import { serializeTodos } from './serializeTodos'

export const TODO_STORAGE_KEY = 'todos'

export function loadTodos(): Todo[] {
  const raw = localStorage.getItem(TODO_STORAGE_KEY)
  if (!raw) return []
  return deserializeTodos(raw)
}

export function saveTodos(todos: readonly Todo[]): void {
  localStorage.setItem(TODO_STORAGE_KEY, serializeTodos(todos))
}

export function clearTodosStorage(): void {
  localStorage.removeItem(TODO_STORAGE_KEY)
}
