# STEP 023. TodoList 컴포넌트 — 로직만 (TodoItem 합성)

## 시그니처 (변경 금지)

```tsx
// src/components/TodoList.tsx
import type { Todo } from '../types/todo'

export type TodoListProps = {
  todos: readonly Todo[]
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onUpdateTitle: (id: string, title: string) => void
}

export function TodoList(props: TodoListProps): JSX.Element
```

## 사전 작성된 테스트 (verbatim 복사 → src/components/TodoList.test.tsx)

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TodoList } from './TodoList'
import type { Todo } from '../types/todo'

const sample: Todo[] = [
  { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
  { id: 'b', title: 'B', completed: true, createdAt: 2, updatedAt: 2 },
]

const noop = vi.fn()

describe('TodoList - 로직', () => {
  it('빈 배열일 때 안내 텍스트를 표시한다', () => {
    render(<TodoList todos={[]} onToggle={noop} onRemove={noop} onUpdateTitle={noop} />)
    expect(screen.getByText(/할\s*일|empty|no/i)).toBeInTheDocument()
  })

  it('각 항목을 list 역할로 렌더링한다', () => {
    render(
      <TodoList todos={sample} onToggle={noop} onRemove={noop} onUpdateTitle={noop} />,
    )
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('각 Todo의 title을 표시한다', () => {
    render(
      <TodoList todos={sample} onToggle={noop} onRemove={noop} onUpdateTitle={noop} />,
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })
})
```

## 선행 조건
- STEP 021 (TodoItem 로직) 완료 — `src/components/TodoItem.tsx` 가 존재하고 export됨.

## 작업 지시
- TodoList는 todos를 받아 `<ul>` 컨테이너로 렌더링한다.
- 각 항목은 `<li>` 내부에 `import { TodoItem } from './TodoItem'` 를 사용해 렌더링한다.
  - TodoItem 에 `todo`, `onToggle`, `onRemove`, `onUpdateTitle` props 를 그대로 통과시킨다.
  - 임시 inline button / 임시 title 표시 금지 (TodoItem 이 이미 모든 요소를 제공함).
- 빈 배열일 때 ul 외부 컨테이너에 "할 일이 없습니다" 안내 메시지를 표시한다.
- 스타일/className 추가 금지 (스타일은 STEP 024의 책임).

## 수정 가능 파일 (정확히 2개)
- src/components/TodoList.tsx
- src/components/TodoList.test.tsx

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
