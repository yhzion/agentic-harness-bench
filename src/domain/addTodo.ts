import type { Todo } from '../types/todo'
import { createTodo } from './createTodo'

export function addTodo(todos: readonly Todo[], title: string): Todo[] {
  return [...todos, createTodo(title)]
}
