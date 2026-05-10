# STEP 015. serializeTodos — JSON 직렬화

## 시그니처 (변경 금지)

```ts
// src/storage/serializeTodos.ts
import type { Todo } from '../types/todo'

export function serializeTodos(todos: readonly Todo[]): string
```

## 사전 작성된 테스트 (verbatim 복사 → src/storage/serializeTodos.test.ts)

```ts
import { describe, it, expect } from 'vitest'
import { serializeTodos } from './serializeTodos'
import type { Todo } from '../types/todo'

const sample: Todo[] = [
  { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
  { id: 'b', title: 'B', completed: true, createdAt: 2, updatedAt: 2 },
]

describe('serializeTodos', () => {
  it('JSON 문자열을 반환한다', () => {
    const result = serializeTodos(sample)
    expect(typeof result).toBe('string')
    expect(JSON.parse(result)).toEqual(sample)
  })

  it('빈 배열은 "[]"를 반환한다', () => {
    expect(serializeTodos([])).toBe('[]')
  })

  it('원본 mutate 금지', () => {
    const original = [...sample]
    serializeTodos(original)
    expect(original).toEqual(sample)
  })
})
```

## 수정 가능 파일 (정확히 2개)
- src/storage/serializeTodos.ts
- src/storage/serializeTodos.test.ts

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
