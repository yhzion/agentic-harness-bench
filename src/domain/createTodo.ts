import type { Todo } from '../types/todo'
import { validateTodoTitle } from './validateTodoTitle'

export function generateTodoId(): string {
  return crypto.randomUUID()
}

export function getCurrentTimestamp(): number {
  return Date.now()
}

export function createTodo(title: string): Todo {
  const result = validateTodoTitle(title)
  if (!result.ok) {
    throw new Error(result.message)
  }
  const now = getCurrentTimestamp()
  return {
    id: generateTodoId(),
    title: result.value,
    completed: false,
    createdAt: now,
    updatedAt: now,
  }
}
