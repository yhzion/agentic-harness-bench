import type { Todo } from '../types/todo'

export function removeTodo(todos: readonly Todo[], id: string): Todo[] {
  return todos.filter((todo) => todo.id !== id)
}
