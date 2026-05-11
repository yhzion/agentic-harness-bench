import { describe, it, expect } from 'vitest'
import { deserializeTodos } from './deserializeTodos'

describe('deserializeTodos', () => {
  it('유효한 JSON 배열을 Todo[]로 파싱한다', () => {
    const json = JSON.stringify([
      { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
    ])
    const result = deserializeTodos(json)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a')
  })

  it('빈 배열을 처리한다', () => {
    expect(deserializeTodos('[]')).toEqual([])
  })

  it('잘못된 JSON은 빈 배열을 반환한다', () => {
    expect(deserializeTodos('not json')).toEqual([])
  })

  it('JSON이 배열이 아니면 빈 배열을 반환한다', () => {
    expect(deserializeTodos('{"id":"a"}')).toEqual([])
    expect(deserializeTodos('123')).toEqual([])
    expect(deserializeTodos('null')).toEqual([])
  })

  it('Todo 형태가 아닌 항목은 제외된다', () => {
    const json = JSON.stringify([
      { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
      { id: 1 },
      null,
      'string',
    ])
    expect(deserializeTodos(json)).toHaveLength(1)
  })

  it('빈 문자열도 빈 배열', () => {
    expect(deserializeTodos('')).toEqual([])
  })
})
