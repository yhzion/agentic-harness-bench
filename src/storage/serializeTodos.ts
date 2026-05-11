import type { Todo } from '../types/todo'

export function serializeTodos(todos: readonly Todo[]): string {
  return JSON.stringify([...todos])
}
