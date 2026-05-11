import { describe, it, expect } from 'vitest'
import { addTodo } from './addTodo'
import type { Todo } from '../types/todo'

describe('addTodo', () => {
  it('빈 배열에 새 Todo를 추가한다', () => {
    const result = addTodo([], '첫번째')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('첫번째')
    expect(result[0].completed).toBe(false)
  })

  it('기존 배열을 변경하지 않는다 (불변)', () => {
    const original: Todo[] = []
    const result = addTodo(original, 'a')
    expect(original).toHaveLength(0)
    expect(result).not.toBe(original)
  })

  it('새 Todo는 배열의 마지막에 추가된다', () => {
    const first = addTodo([], 'a')
    const second = addTodo(first, 'b')
    expect(second[0].title).toBe('a')
    expect(second[1].title).toBe('b')
  })

  it('빈 title에 대해 throw한다', () => {
    expect(() => addTodo([], '')).toThrow()
    expect(() => addTodo([], '   ')).toThrow()
  })
})
