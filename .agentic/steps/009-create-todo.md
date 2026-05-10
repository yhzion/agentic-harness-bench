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

### 동작 요구 (테스트가 검증하는 행동 — 코드 아님)

- `generateTodoId()`: 50회 연속 호출 시 50개 모두 다른 값 반환 (uniqueness 강).
- `getCurrentTimestamp()`: 호출 직전 `Date.now()` 와 직후 `Date.now()` 사이의 ms 단위 정수.
- `createTodo(title)`: title 을 trim, 빈 문자열은 throw, createdAt = updatedAt 동일 시각.

### 환경 (반드시 준수 — 위반 시 src-imports gate fail)

- 이 코드는 브라우저 ESM 환경에서 실행됨. 자세한 환경 사실: `.agentic/docs/runtime-environment.md`.
- 단위 테스트는 vitest+jsdom 통과해도 *런타임 보장 아님*. `check-real-smoke` 가 ground truth.

### 금지 (제약 — 답을 leak 하지 않는 반례 목록)

- ❌ `import { randomUUID } from 'crypto'` (Node 빌트인. vite externalize → TypeError)
- ❌ `import { randomUUID } from 'node:crypto'` (동일)
- ❌ `import { v4 } from 'uuid'`, `nanoid`, `cuid`, `ulid` (allowlist 차단)
- ❌ `Math.random()` 단독 (50회 unique 보장 불가)
- ❌ `String(Date.now())` 기반 단독 id (동시 호출 충돌)

→ 위 제약 안에서 `## 동작 요구` 를 만족하는 *브라우저 표준* API 를 선택할 것. 환경 글로벌 목록은 `runtime-environment.md` 참조.

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
1. createTodo.ts 에 세 함수를 시그니처대로 구현한다.
2. createTodo 는 내부에서 validateTodoTitle 을 호출하고, 실패 시 `throw new Error(message)` 를 던진다.
3. id 생성: 위 `## 환경` + `## 금지` 안에서 `## 동작 요구` 를 만족하는 *브라우저 표준* API 를 선택. 의심되면 `runtime-environment.md` 의 "사용 가능 글로벌" 표 참조.

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
