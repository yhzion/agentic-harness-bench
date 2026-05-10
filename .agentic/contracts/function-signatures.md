# 함수 시그니처 계약

소형 LLM은 이 계약을 임의로 변경하지 않습니다.
변경이 필요하면 구현을 중단하고 failure-report를 작성합니다.

## 예시: Todo 도메인 함수

```ts
export type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; message: string }

export function validateTodoTitle(title: string): ValidationResult {
  throw new Error('Not implemented')
}

export function generateTodoId(): string {
  throw new Error('Not implemented')
}

export function getCurrentTimestamp(): number {
  throw new Error('Not implemented')
}

export function createTodo(title: string): Todo {
  throw new Error('Not implemented')
}

export function addTodo(todos: Todo[], title: string): Todo[] {
  throw new Error('Not implemented')
}

export function findTodoById(todos: Todo[], id: string): Todo | undefined {
  throw new Error('Not implemented')
}

export function toggleTodo(todos: Todo[], id: string): Todo[] {
  throw new Error('Not implemented')
}

export function updateTodoTitle(todos: Todo[], id: string, title: string): Todo[] {
  throw new Error('Not implemented')
}

export function removeTodo(todos: Todo[], id: string): Todo[] {
  throw new Error('Not implemented')
}

export function filterTodos(todos: Todo[], filter: TodoFilter): Todo[] {
  throw new Error('Not implemented')
}
```

## 예시: Storage 함수

```ts
export function serializeTodos(todos: Todo[]): string {
  throw new Error('Not implemented')
}

export function deserializeTodos(value: string): Todo[] {
  throw new Error('Not implemented')
}

export function loadTodos(): Todo[] {
  throw new Error('Not implemented')
}

export function saveTodos(todos: Todo[]): void {
  throw new Error('Not implemented')
}

export function clearTodosStorage(): void {
  throw new Error('Not implemented')
}
```
