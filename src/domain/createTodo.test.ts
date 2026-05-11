import { describe, it, expect, vi } from 'vitest'
import { createTodo, generateTodoId, getCurrentTimestamp } from './createTodo'

describe('generateTodoId', () => {
  it('빈 문자열이 아닌 문자열을 반환한다', () => {
    const id = generateTodoId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('연속 호출 시 서로 다른 값을 반환한다', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateTodoId()))
    expect(ids.size).toBe(50)
  })
})

describe('getCurrentTimestamp', () => {
  it('현재 ms 단위 타임스탬프를 반환한다', () => {
    const before = Date.now()
    const ts = getCurrentTimestamp()
    const after = Date.now()
    expect(ts).toBeGreaterThanOrEqual(before)
    expect(ts).toBeLessThanOrEqual(after)
  })
})

describe('createTodo', () => {
  it('title을 trim해 Todo를 생성한다', () => {
    const todo = createTodo('  우유 사기  ')
    expect(todo.title).toBe('우유 사기')
    expect(todo.completed).toBe(false)
    expect(typeof todo.id).toBe('string')
    expect(typeof todo.createdAt).toBe('number')
    expect(todo.updatedAt).toBe(todo.createdAt)
  })

  it('빈 문자열에 대해 throw한다', () => {
    expect(() => createTodo('')).toThrow()
    expect(() => createTodo('   ')).toThrow()
  })

  it('서로 다른 id를 생성한다', () => {
    const a = createTodo('a')
    const b = createTodo('b')
    expect(a.id).not.toBe(b.id)
  })

  it('Date.now를 모킹해도 동일하게 동작한다', () => {
    const spy = vi.spyOn(Date, 'now').mockReturnValue(1234567890)
    const todo = createTodo('test')
    expect(todo.createdAt).toBe(1234567890)
    expect(todo.updatedAt).toBe(1234567890)
    spy.mockRestore()
  })
})
