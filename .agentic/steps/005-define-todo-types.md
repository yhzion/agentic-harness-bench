# STEP 005. Todo 도메인 타입 정의

## 작업 단위
src/types/todo.ts와 src/types/index.ts를 생성한다. 함수나 컴포넌트는 작성하지 않는다.

## 시그니처 (변경 금지)

```ts
// src/types/todo.ts
export type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: number
  updatedAt: number
}

export type TodoFilter = 'all' | 'active' | 'completed'

export type TodoCreateInput = {
  title: string
}

export type TodoUpdateInput = {
  id: string
  title: string
}

export type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; message: string }
```

## 사전 작성된 테스트 (verbatim 복사 → src/types/todo.test.ts)

```ts
import { describe, it, expectTypeOf } from 'vitest'
import type { Todo, TodoFilter, TodoCreateInput, TodoUpdateInput, ValidationResult } from './todo'

describe('Todo 타입 계약', () => {
  it('Todo는 id, title, completed, createdAt, updatedAt 필드를 가진다', () => {
    expectTypeOf<Todo>().toEqualTypeOf<{
      id: string
      title: string
      completed: boolean
      createdAt: number
      updatedAt: number
    }>()
  })

  it('TodoFilter는 all/active/completed 유니온이다', () => {
    expectTypeOf<TodoFilter>().toEqualTypeOf<'all' | 'active' | 'completed'>()
  })

  it('TodoCreateInput은 title만 가진다', () => {
    expectTypeOf<TodoCreateInput>().toEqualTypeOf<{ title: string }>()
  })

  it('TodoUpdateInput은 id, title을 가진다', () => {
    expectTypeOf<TodoUpdateInput>().toEqualTypeOf<{ id: string; title: string }>()
  })

  it('ValidationResult는 성공/실패 유니온이다', () => {
    expectTypeOf<ValidationResult>().toEqualTypeOf<
      { ok: true; value: string } | { ok: false; message: string }
    >()
  })
})
```

### src/types/index.ts (re-export)

```ts
export type {
  Todo,
  TodoFilter,
  TodoCreateInput,
  TodoUpdateInput,
  ValidationResult,
} from './todo'
```

## 작업 지시
1. src/types/todo.ts에 위 시그니처를 verbatim 작성한다.
2. src/types/todo.test.ts에 위 테스트를 verbatim 복사한다.
3. src/types/index.ts에 위 re-export를 작성한다.

## 수정 가능 파일 (정확히 3개)
- src/types/todo.ts
- src/types/todo.test.ts
- src/types/index.ts

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- 위 3개 외 모든 파일

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
- 도메인/스토리지/컴포넌트 코드는 미작성
