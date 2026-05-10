# STEP 017. loadTodos / saveTodos — localStorage 어댑터

## 시그니처 (변경 금지)

```ts
// src/storage/todoStorage.ts
import type { Todo } from '../types/todo'

export const TODO_STORAGE_KEY = 'todos'

export function loadTodos(): Todo[]
export function saveTodos(todos: readonly Todo[]): void
export function clearTodosStorage(): void
```

## 사전 작성된 테스트 (verbatim 복사 → src/storage/todoStorage.test.ts)

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  TODO_STORAGE_KEY,
  loadTodos,
  saveTodos,
  clearTodosStorage,
} from './todoStorage'
import type { Todo } from '../types/todo'

beforeEach(() => {
  localStorage.clear()
})

describe('TODO_STORAGE_KEY', () => {
  it('"todos" 문자열이다', () => {
    expect(TODO_STORAGE_KEY).toBe('todos')
  })
})

describe('loadTodos', () => {
  it('저장 전에는 빈 배열을 반환한다', () => {
    expect(loadTodos()).toEqual([])
  })

  it('저장된 데이터를 읽어온다', () => {
    const todos: Todo[] = [
      { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
    ]
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos))
    expect(loadTodos()).toEqual(todos)
  })

  it('저장된 값이 깨졌으면 빈 배열을 반환한다', () => {
    localStorage.setItem(TODO_STORAGE_KEY, 'not json')
    expect(loadTodos()).toEqual([])
  })
})

describe('saveTodos', () => {
  it('Todo 배열을 직렬화해 저장한다', () => {
    const todos: Todo[] = [
      { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
    ]
    saveTodos(todos)
    const raw = localStorage.getItem(TODO_STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toEqual(todos)
  })

  it('빈 배열도 저장된다', () => {
    saveTodos([])
    expect(localStorage.getItem(TODO_STORAGE_KEY)).toBe('[]')
  })
})

describe('clearTodosStorage', () => {
  it('저장 키를 제거한다', () => {
    localStorage.setItem(TODO_STORAGE_KEY, '[]')
    clearTodosStorage()
    expect(localStorage.getItem(TODO_STORAGE_KEY)).toBeNull()
  })
})
```

## 작업 지시
loadTodos는 deserializeTodos를, saveTodos는 serializeTodos를 사용한다(STEP 015, 016 산출물).

## 수정 가능 파일 (정확히 2개)
- src/storage/todoStorage.ts
- src/storage/todoStorage.test.ts

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
