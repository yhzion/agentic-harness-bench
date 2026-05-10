# STEP 013. removeTodo — 삭제

## 시그니처 (변경 금지)

```ts
// src/domain/removeTodo.ts
import type { Todo } from '../types/todo'

export function removeTodo(todos: readonly Todo[], id: string): Todo[]
```

## 사전 작성된 테스트 (verbatim 복사 → src/domain/removeTodo.test.ts)

```ts
import { describe, it, expect } from 'vitest'
import { removeTodo } from './removeTodo'
import type { Todo } from '../types/todo'

const sample = (): Todo[] => [
  { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
  { id: 'b', title: 'B', completed: false, createdAt: 2, updatedAt: 2 },
  { id: 'c', title: 'C', completed: true, createdAt: 3, updatedAt: 3 },
]

describe('removeTodo', () => {
  it('해당 id를 제거한 새 배열을 반환', () => {
    const result = removeTodo(sample(), 'b')
    expect(result.map((t) => t.id)).toEqual(['a', 'c'])
  })

  it('존재하지 않는 id면 원본과 동일한 새 배열', () => {
    const original = sample()
    const result = removeTodo(original, 'nope')
    expect(result).toEqual(original)
    expect(result).not.toBe(original)
  })

  it('원본 mutate 금지', () => {
    const original = sample()
    removeTodo(original, 'a')
    expect(original).toHaveLength(3)
  })

  it('빈 배열에서 호출 시 빈 배열 반환', () => {
    expect(removeTodo([], 'a')).toEqual([])
  })
})
```

## 수정 가능 파일 (정확히 2개)
- src/domain/removeTodo.ts
- src/domain/removeTodo.test.ts

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
