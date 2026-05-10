# STEP 027. App 컴포넌트 — 통합 로직 (스타일 없음)

## 작업 단위
src/App.tsx를 useTodos hook + TodoInput + TodoFilter + TodoList로 합성한다. 스타일/className은 추가하지 않는다.

## 시그니처 (변경 금지)

```tsx
// src/App.tsx
export function App(): JSX.Element
```

## 사전 작성된 테스트 (verbatim 복사 → src/App.test.tsx)

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'
import { TODO_STORAGE_KEY } from './storage/todoStorage'

beforeEach(() => {
  localStorage.clear()
})

describe('App - 통합', () => {
  it('h1 "Todo"를 렌더링한다', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: /todo/i })).toBeInTheDocument()
  })

  it('TodoInput, TodoFilter, TodoList가 모두 렌더링된다', () => {
    render(<App />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^(all|전체)$/i })).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('전체 워크플로우 — 추가 → 토글 → 필터 → 삭제', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole('textbox'), '우유 사기{Enter}')
    expect(screen.getByText('우유 사기')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /^(completed|완료)$/i }))
    expect(screen.getAllByRole('listitem')).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: /^(active|미완료)$/i }))
    expect(screen.queryByRole('listitem')).toBeNull()

    await user.click(screen.getByRole('button', { name: /^(all|전체)$/i }))
    await user.click(screen.getByRole('button', { name: /delete|삭제|remove/i }))
    expect(screen.queryByRole('listitem')).toBeNull()
  })

  it('localStorage에 영속화된다', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByRole('textbox'), '저장 확인{Enter}')
    expect(localStorage.getItem(TODO_STORAGE_KEY)).toContain('저장 확인')
  })
})
```

## 작업 지시
- App은 useTodos를 호출하고 그 결과를 TodoInput, TodoFilter, TodoList에 전달.
- h1, main 등 시맨틱 마크업 사용.
- className 추가 금지 (다음 STEP의 책임).

## 수정 가능 파일 (정확히 2개)
- src/App.tsx
- src/App.test.tsx

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- 위 2개 외 모든 파일

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
- App.tsx에 className/style 속성 없음
