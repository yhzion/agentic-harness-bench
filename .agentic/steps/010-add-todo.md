# STEP 010. addTodo — 불변 추가

## 작업 단위
src/domain/addTodo.ts와 그 테스트를 생성한다.

## 시그니처 (변경 금지)

```ts
// src/domain/addTodo.ts
import type { Todo } from '../types/todo'

export function addTodo(todos: readonly Todo[], title: string): Todo[]
```

## 사전 작성된 테스트 (verbatim 복사 → src/domain/addTodo.test.ts)

```ts
import { describe, it, expect } from 'vitest'
import { addTodo } from './addTodo'
import type { Todo } from '../types/todo'

describe('addTodo', () => {
  it('빈 배열에 새 Todo를 추가한다', () => {
    const result = addTodo([], '첫번째')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('첫번째')
    expect(result[0].completed).toBe(false)
  })

  it('기존 배열을 변경하지 않는다 (불변)', () => {
    const original: Todo[] = []
    const result = addTodo(original, 'a')
    expect(original).toHaveLength(0)
    expect(result).not.toBe(original)
  })

  it('새 Todo는 배열의 마지막에 추가된다', () => {
    const first = addTodo([], 'a')
    const second = addTodo(first, 'b')
    expect(second[0].title).toBe('a')
    expect(second[1].title).toBe('b')
  })

  it('빈 title에 대해 throw한다', () => {
    expect(() => addTodo([], '')).toThrow()
    expect(() => addTodo([], '   ')).toThrow()
  })
})
```

## 작업 지시
addTodo는 내부에서 createTodo를 호출하고, 결과를 spread하여 새 배열을 반환한다.

## 수정 가능 파일 (정확히 2개)
- src/domain/addTodo.ts
- src/domain/addTodo.test.ts

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
