# STEP 012. updateTodoTitle — 제목 갱신

## 작업 단위
src/domain/updateTodoTitle.ts와 그 테스트를 생성한다.

## 시그니처 (변경 금지)

```ts
// src/domain/updateTodoTitle.ts
import type { Todo } from '../types/todo'

export function updateTodoTitle(todos: readonly Todo[], id: string, title: string): Todo[]
```

## 사전 작성된 테스트 (verbatim 복사 → src/domain/updateTodoTitle.test.ts)

```ts
import { describe, it, expect } from 'vitest'
import { updateTodoTitle } from './updateTodoTitle'
import type { Todo } from '../types/todo'

const sample = (): Todo[] => [
  { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
  { id: 'b', title: 'B', completed: false, createdAt: 2, updatedAt: 2 },
]

describe('updateTodoTitle', () => {
  it('해당 id의 title을 trim 후 갱신한다', () => {
    const result = updateTodoTitle(sample(), 'a', '  새 제목  ')
    expect(result[0].title).toBe('새 제목')
  })

  it('updatedAt을 현재 시각으로 갱신한다', () => {
    const before = Date.now()
    const result = updateTodoTitle(sample(), 'a', '새')
    expect(result[0].updatedAt).toBeGreaterThanOrEqual(before)
  })

  it('createdAt은 보존된다', () => {
    const result = updateTodoTitle(sample(), 'a', '새')
    expect(result[0].createdAt).toBe(1)
  })

  it('빈 문자열로 갱신하면 throw', () => {
    expect(() => updateTodoTitle(sample(), 'a', '')).toThrow()
    expect(() => updateTodoTitle(sample(), 'a', '   ')).toThrow()
  })

  it('존재하지 않는 id면 원본과 동일한 새 배열을 반환', () => {
    const original = sample()
    const result = updateTodoTitle(original, 'nope', '새')
    expect(result).toEqual(original)
    expect(result).not.toBe(original)
  })

  it('원본 mutate 금지', () => {
    const original = sample()
    updateTodoTitle(original, 'a', '새')
    expect(original[0].title).toBe('A')
  })
})
```

## 수정 가능 파일 (정확히 2개)
- src/domain/updateTodoTitle.ts
- src/domain/updateTodoTitle.test.ts

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
