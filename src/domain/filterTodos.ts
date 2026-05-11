import type { Todo, TodoFilter } from '../types/todo'

export function filterTodos(todos: readonly Todo[], filter: TodoFilter): Todo[] {
  switch (filter) {
    case 'all':
      return [...todos]
    case 'active':
      return todos.filter((t) => !t.completed)
    case 'completed':
      return todos.filter((t) => t.completed)
  }
}
