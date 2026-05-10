# STEP 014. filterTodos — 상태 필터링

## 시그니처 (변경 금지)

```ts
// src/domain/filterTodos.ts
import type { Todo, TodoFilter } from '../types/todo'

export function filterTodos(todos: readonly Todo[], filter: TodoFilter): Todo[]
```

## 사전 작성된 테스트 (verbatim 복사 → src/domain/filterTodos.test.ts)

```ts
import { describe, it, expect } from 'vitest'
import { filterTodos } from './filterTodos'
import type { Todo } from '../types/todo'

const sample = (): Todo[] => [
  { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
  { id: 'b', title: 'B', completed: true, createdAt: 2, updatedAt: 2 },
  { id: 'c', title: 'C', completed: false, createdAt: 3, updatedAt: 3 },
]

describe('filterTodos', () => {
  it('all은 전체를 반환한다', () => {
    expect(filterTodos(sample(), 'all').map((t) => t.id)).toEqual(['a', 'b', 'c'])
  })

  it('active는 미완료만 반환한다', () => {
    expect(filterTodos(sample(), 'active').map((t) => t.id)).toEqual(['a', 'c'])
  })

  it('completed는 완료만 반환한다', () => {
    expect(filterTodos(sample(), 'completed').map((t) => t.id)).toEqual(['b'])
  })

  it('빈 입력에 대해 빈 배열 반환', () => {
    expect(filterTodos([], 'all')).toEqual([])
    expect(filterTodos([], 'active')).toEqual([])
    expect(filterTodos([], 'completed')).toEqual([])
  })

  it('원본 mutate 금지', () => {
    const original = sample()
    filterTodos(original, 'active')
    expect(original).toHaveLength(3)
  })
})
```

## 수정 가능 파일 (정확히 2개)
- src/domain/filterTodos.ts
- src/domain/filterTodos.test.ts

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
