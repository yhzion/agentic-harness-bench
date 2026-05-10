# STEP 018. useTodos — 통합 상태 hook

## 시그니처 (변경 금지)

```ts
// src/hooks/useTodos.ts
import type { Todo, TodoFilter } from '../types/todo'

export type UseTodosResult = {
  todos: Todo[]
  filter: TodoFilter
  visibleTodos: Todo[]
  addTodoAction(title: string): void
  toggleTodoAction(id: string): void
  updateTodoTitleAction(id: string, title: string): void
  removeTodoAction(id: string): void
  setFilterAction(filter: TodoFilter): void
}

export function useTodos(): UseTodosResult
```

## 사전 작성된 테스트 (verbatim 복사 → src/hooks/useTodos.test.tsx)

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTodos } from './useTodos'
import { TODO_STORAGE_KEY } from '../storage/todoStorage'

beforeEach(() => {
  localStorage.clear()
})

describe('useTodos', () => {
  it('초기 todos는 localStorage에서 로드된다', () => {
    localStorage.setItem(
      TODO_STORAGE_KEY,
      JSON.stringify([
        { id: 'x', title: 'X', completed: false, createdAt: 1, updatedAt: 1 },
      ]),
    )
    const { result } = renderHook(() => useTodos())
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].id).toBe('x')
  })

  it('초기 filter는 all', () => {
    const { result } = renderHook(() => useTodos())
    expect(result.current.filter).toBe('all')
  })

  it('addTodoAction은 todo를 추가하고 저장한다', () => {
    const { result } = renderHook(() => useTodos())
    act(() => result.current.addTodoAction('첫번째'))
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].title).toBe('첫번째')
    expect(localStorage.getItem(TODO_STORAGE_KEY)).toContain('첫번째')
  })

  it('toggleTodoAction은 completed를 반전한다', () => {
    const { result } = renderHook(() => useTodos())
    act(() => result.current.addTodoAction('a'))
    const id = result.current.todos[0].id
    act(() => result.current.toggleTodoAction(id))
    expect(result.current.todos[0].completed).toBe(true)
  })

  it('updateTodoTitleAction은 title을 갱신한다', () => {
    const { result } = renderHook(() => useTodos())
    act(() => result.current.addTodoAction('a'))
    const id = result.current.todos[0].id
    act(() => result.current.updateTodoTitleAction(id, '새 제목'))
    expect(result.current.todos[0].title).toBe('새 제목')
  })

  it('removeTodoAction은 삭제한다', () => {
    const { result } = renderHook(() => useTodos())
    act(() => result.current.addTodoAction('a'))
    const id = result.current.todos[0].id
    act(() => result.current.removeTodoAction(id))
    expect(result.current.todos).toHaveLength(0)
  })

  it('setFilterAction과 visibleTodos는 연동된다', () => {
    const { result } = renderHook(() => useTodos())
    act(() => result.current.addTodoAction('a'))
    act(() => result.current.addTodoAction('b'))
    const idA = result.current.todos[0].id
    act(() => result.current.toggleTodoAction(idA))
    act(() => result.current.setFilterAction('completed'))
    expect(result.current.visibleTodos).toHaveLength(1)
    expect(result.current.visibleTodos[0].id).toBe(idA)
    act(() => result.current.setFilterAction('active'))
    expect(result.current.visibleTodos).toHaveLength(1)
    expect(result.current.visibleTodos[0].id).not.toBe(idA)
  })
})
```

## 작업 지시
- React useState로 todos, filter를 관리한다.
- 초기값은 loadTodos() 결과 + 'all'.
- 모든 변경 action 후 saveTodos를 호출한다.
- visibleTodos는 useMemo로 filterTodos 결과를 계산.

## 수정 가능 파일 (정확히 2개)
- src/hooks/useTodos.ts
- src/hooks/useTodos.test.tsx

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
