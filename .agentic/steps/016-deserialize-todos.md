# STEP 016. deserializeTodos — JSON 역직렬화 + 검증

## 시그니처 (변경 금지)

```ts
// src/storage/deserializeTodos.ts
import type { Todo } from '../types/todo'

export function deserializeTodos(value: string): Todo[]
```

## 사전 작성된 테스트 (verbatim 복사 → src/storage/deserializeTodos.test.ts)

```ts
import { describe, it, expect } from 'vitest'
import { deserializeTodos } from './deserializeTodos'

describe('deserializeTodos', () => {
  it('유효한 JSON 배열을 Todo[]로 파싱한다', () => {
    const json = JSON.stringify([
      { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
    ])
    const result = deserializeTodos(json)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a')
  })

  it('빈 배열을 처리한다', () => {
    expect(deserializeTodos('[]')).toEqual([])
  })

  it('잘못된 JSON은 빈 배열을 반환한다', () => {
    expect(deserializeTodos('not json')).toEqual([])
  })

  it('JSON이 배열이 아니면 빈 배열을 반환한다', () => {
    expect(deserializeTodos('{"id":"a"}')).toEqual([])
    expect(deserializeTodos('123')).toEqual([])
    expect(deserializeTodos('null')).toEqual([])
  })

  it('Todo 형태가 아닌 항목은 제외된다', () => {
    const json = JSON.stringify([
      { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
      { id: 1 },
      null,
      'string',
    ])
    expect(deserializeTodos(json)).toHaveLength(1)
  })

  it('빈 문자열도 빈 배열', () => {
    expect(deserializeTodos('')).toEqual([])
  })
})
```

## 작업 지시
유효성 검사는 다음 모든 필드의 타입 일치를 확인한다: id(string), title(string), completed(boolean), createdAt(number), updatedAt(number). 하나라도 어긋나면 그 항목은 결과에서 제외한다.

## 수정 가능 파일 (정확히 2개)
- src/storage/deserializeTodos.ts
- src/storage/deserializeTodos.test.ts

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
