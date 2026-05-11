import { describe, it, expect, beforeEach } from 'vitest'
import {
  TODO_STORAGE_KEY,
  loadTodos,
  saveTodos,
  clearTodosStorage,
} from './todoStorage'
import type { Todo } from '../types/todo'

beforeEach(() => {
  localStorage.clear()
})

describe('TODO_STORAGE_KEY', () => {
  it('"todos" 문자열이다', () => {
    expect(TODO_STORAGE_KEY).toBe('todos')
  })
})

describe('loadTodos', () => {
  it('저장 전에는 빈 배열을 반환한다', () => {
    expect(loadTodos()).toEqual([])
  })

  it('저장된 데이터를 읽어온다', () => {
    const todos: Todo[] = [
      { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
    ]
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos))
    expect(loadTodos()).toEqual(todos)
  })

  it('저장된 값이 깨졌으면 빈 배열을 반환한다', () => {
    localStorage.setItem(TODO_STORAGE_KEY, 'not json')
    expect(loadTodos()).toEqual([])
  })
})

describe('saveTodos', () => {
  it('Todo 배열을 직렬화해 저장한다', () => {
    const todos: Todo[] = [
      { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
    ]
    saveTodos(todos)
    const raw = localStorage.getItem(TODO_STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toEqual(todos)
  })

  it('빈 배열도 저장된다', () => {
    saveTodos([])
    expect(localStorage.getItem(TODO_STORAGE_KEY)).toBe('[]')
  })
})

describe('clearTodosStorage', () => {
  it('저장 키를 제거한다', () => {
    localStorage.setItem(TODO_STORAGE_KEY, '[]')
    clearTodosStorage()
    expect(localStorage.getItem(TODO_STORAGE_KEY)).toBeNull()
  })
})
