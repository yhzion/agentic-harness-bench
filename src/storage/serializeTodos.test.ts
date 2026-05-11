import { describe, it, expect } from 'vitest'
import { serializeTodos } from './serializeTodos'
import type { Todo } from '../types/todo'

const sample: Todo[] = [
  { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
  { id: 'b', title: 'B', completed: true, createdAt: 2, updatedAt: 2 },
]

describe('serializeTodos', () => {
  it('JSON 문자열을 반환한다', () => {
    const result = serializeTodos(sample)
    expect(typeof result).toBe('string')
    expect(JSON.parse(result)).toEqual(sample)
  })

  it('빈 배열은 "[]"를 반환한다', () => {
    expect(serializeTodos([])).toBe('[]')
  })

  it('원본 mutate 금지', () => {
    const original = [...sample]
    serializeTodos(original)
    expect(original).toEqual(sample)
  })
})
