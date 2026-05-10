# STEP 009. createTodo — Todo 객체 팩토리

## 작업 단위
src/domain/createTodo.ts와 그 테스트를 생성한다.

## 시그니처 (변경 금지)

```ts
// src/domain/createTodo.ts
import type { Todo } from '../types/todo'

export function generateTodoId(): string
export function getCurrentTimestamp(): number
export function createTodo(title: string): Todo
```

## 사전 작성된 테스트 (verbatim 복사 → src/domain/createTodo.test.ts)

```ts
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
```

## 작업 지시
1. createTodo.ts에 세 함수를 시그니처대로 구현한다.
2. createTodo는 내부에서 validateTodoTitle을 호출하고, 실패 시 throw new Error(message)를 던진다.
3. id 생성은 crypto.randomUUID() 사용을 권장(별도 라이브러리 추가 금지).

## 수정 가능 파일 (정확히 2개)
- src/domain/createTodo.ts
- src/domain/createTodo.test.ts

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- 위 2개 외 모든 파일

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
