# 인터페이스 계약

## Todo 타입 예시

```ts
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
```

## Repository 인터페이스 예시

```ts
export interface TodoRepository {
  load(): Todo[]
  save(todos: Todo[]): void
  clear(): void
}
```

## Store 또는 Hook 반환 타입 예시

```ts
export type UseTodosResult = {
  todos: Todo[]
  filter: TodoFilter
  visibleTodos: Todo[]
  error: string | null
  addTodoAction(title: string): void
  toggleTodoAction(id: string): void
  updateTodoTitleAction(id: string, title: string): void
  removeTodoAction(id: string): void
  setFilterAction(filter: TodoFilter): void
  clearErrorAction(): void
}
```
