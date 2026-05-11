import { useState, useMemo, useCallback } from 'react'
import type { Todo, TodoFilter } from '../types/todo'
import { loadTodos, saveTodos } from '../storage/todoStorage'
import { filterTodos } from '../domain/filterTodos'
import { addTodo } from '../domain/addTodo'
import { toggleTodo } from '../domain/toggleTodo'
import { updateTodoTitle } from '../domain/updateTodoTitle'
import { removeTodo } from '../domain/removeTodo'

export type UseTodosResult = {
  todos: Todo[]
  filter: TodoFilter
  visibleTodos: Todo[]
  addTodoAction(title: string): void
  toggleTodoAction(id: string): void
  updateTodoTitleAction(id: string, title: string): void
  removeTodoAction(id: string): void
  setFilterAction(filter: TodoFilter): void
}

export function useTodos(): UseTodosResult {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos())
  const [filter, setFilter] = useState<TodoFilter>('all')

  const visibleTodos = useMemo(() => filterTodos(todos, filter), [todos, filter])

  const addTodoAction = useCallback(
    (title: string) => {
      const next = addTodo(todos, title)
      setTodos(next)
      saveTodos(next)
    },
    [todos],
  )

  const toggleTodoAction = useCallback(
    (id: string) => {
      const next = toggleTodo(todos, id)
      setTodos(next)
      saveTodos(next)
    },
    [todos],
  )

  const updateTodoTitleAction = useCallback(
    (id: string, title: string) => {
      const next = updateTodoTitle(todos, id, title)
      setTodos(next)
      saveTodos(next)
    },
    [todos],
  )

  const removeTodoAction = useCallback(
    (id: string) => {
      const next = removeTodo(todos, id)
      setTodos(next)
      saveTodos(next)
    },
    [todos],
  )

  const setFilterAction = useCallback((filter: TodoFilter) => {
    setFilter(filter)
  }, [])

  return {
    todos,
    filter,
    visibleTodos,
    addTodoAction,
    toggleTodoAction,
    updateTodoTitleAction,
    removeTodoAction,
    setFilterAction,
  }
}
