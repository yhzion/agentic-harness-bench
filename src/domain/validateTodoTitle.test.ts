import { describe, it, expect } from 'vitest'
import { validateTodoTitle, TODO_TITLE_MAX_LENGTH } from './validateTodoTitle'

describe('validateTodoTitle - 빈 문자열', () => {
  it('빈 문자열은 EMPTY 메시지로 실패한다', () => {
    const result = validateTodoTitle('')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toBe('EMPTY')
  })

  it('비어있지 않은 문자열은 그대로 통과한다', () => {
    expect(validateTodoTitle('우유 사기')).toEqual({ ok: true, value: '우유 사기' })
  })

  it('한 글자도 통과한다', () => {
    expect(validateTodoTitle('a')).toEqual({ ok: true, value: 'a' })
  })
})

describe('validateTodoTitle - 공백 처리', () => {
  it('공백만 있는 문자열은 EMPTY로 실패한다', () => {
    const result = validateTodoTitle('   ')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toBe('EMPTY')
  })

  it('탭과 개행만 있는 문자열은 EMPTY로 실패한다', () => {
    const result = validateTodoTitle('\t\n  ')
    expect(result.ok).toBe(false)
  })

  it('앞뒤 공백은 trim되어 통과한다', () => {
    expect(validateTodoTitle('  우유 사기  ')).toEqual({ ok: true, value: '우유 사기' })
  })

  it('내부 공백은 보존된다', () => {
    expect(validateTodoTitle('우유  사기')).toEqual({ ok: true, value: '우유  사기' })
  })
})

describe('validateTodoTitle - 길이 상한', () => {
  it('TODO_TITLE_MAX_LENGTH 상수는 200이다', () => {
    expect(TODO_TITLE_MAX_LENGTH).toBe(200)
  })

  it('상한 길이까지는 통과한다', () => {
    const title = 'a'.repeat(TODO_TITLE_MAX_LENGTH)
    expect(validateTodoTitle(title)).toEqual({ ok: true, value: title })
  })

  it('상한을 초과하면 TOO_LONG 메시지로 실패한다', () => {
    const title = 'a'.repeat(TODO_TITLE_MAX_LENGTH + 1)
    const result = validateTodoTitle(title)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toBe('TOO_LONG')
  })

  it('trim 후 길이로 판정한다 — 공백 포함 201자도 trim 결과가 200 이하면 통과', () => {
    const title = ' ' + 'a'.repeat(TODO_TITLE_MAX_LENGTH) + ' '
    expect(validateTodoTitle(title).ok).toBe(true)
  })
})
