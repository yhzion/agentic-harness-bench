# STEP 011. toggleTodo — 완료 상태 토글

## 작업 단위
src/domain/toggleTodo.ts와 그 테스트를 생성한다.

## 시그니처 (변경 금지)

```ts
// src/domain/toggleTodo.ts
import type { Todo } from '../types/todo'

export function toggleTodo(todos: readonly Todo[], id: string): Todo[]
```

## 사전 작성된 테스트 (verbatim 복사 → src/domain/toggleTodo.test.ts)

```ts
import { describe, it, expect } from 'vitest'
import { toggleTodo } from './toggleTodo'
import type { Todo } from '../types/todo'

const sample = (): Todo[] => [
  { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
  { id: 'b', title: 'B', completed: true, createdAt: 2, updatedAt: 2 },
]

describe('toggleTodo', () => {
  it('id에 해당하는 Todo의 completed를 반전한다', () => {
    const result = toggleTodo(sample(), 'a')
    expect(result[0].completed).toBe(true)
    expect(result[1].completed).toBe(true)
  })

  it('true에서 false로도 토글된다', () => {
    const result = toggleTodo(sample(), 'b')
    expect(result[1].completed).toBe(false)
  })

  it('해당 Todo의 updatedAt을 갱신한다', () => {
    const before = Date.now()
    const result = toggleTodo(sample(), 'a')
    expect(result[0].updatedAt).toBeGreaterThanOrEqual(before)
  })

  it('존재하지 않는 id면 원본과 동일한 내용의 새 배열을 반환한다', () => {
    const original = sample()
    const result = toggleTodo(original, 'nope')
    expect(result).toEqual(original)
    expect(result).not.toBe(original)
  })

  it('원본 배열을 mutate하지 않는다', () => {
    const original = sample()
    toggleTodo(original, 'a')
    expect(original[0].completed).toBe(false)
  })
})
```

## 수정 가능 파일 (정확히 2개)
- src/domain/toggleTodo.ts
- src/domain/toggleTodo.test.ts

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
