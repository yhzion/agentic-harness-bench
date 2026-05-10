# STEP 025. TodoFilter 컴포넌트 — 로직만

## 시그니처 (변경 금지)

```tsx
// src/components/TodoFilter.tsx
import type { TodoFilter as TodoFilterValue } from '../types/todo'

export type TodoFilterProps = {
  value: TodoFilterValue
  onChange: (value: TodoFilterValue) => void
}

export function TodoFilter(props: TodoFilterProps): JSX.Element
```

## 사전 작성된 테스트 (verbatim 복사 → src/components/TodoFilter.test.tsx)

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoFilter } from './TodoFilter'

describe('TodoFilter - 로직', () => {
  it('all/active/completed 세 버튼을 렌더링한다', () => {
    render(<TodoFilter value="all" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /^(all|전체)$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^(active|미완료)$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^(completed|완료)$/i })).toBeInTheDocument()
  })

  it('현재 value 버튼은 aria-pressed=true', () => {
    render(<TodoFilter value="active" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /^(active|미완료)$/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /^(all|전체)$/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('버튼 클릭 시 onChange 호출', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<TodoFilter value="all" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /^(completed|완료)$/i }))
    expect(onChange).toHaveBeenCalledWith('completed')
  })
})
```

## 작업 지시
- 세 개의 button 요소.
- 각 button에 aria-pressed로 현재 선택 상태 표시.
- 스타일/className 금지.

## 수정 가능 파일 (정확히 2개)
- src/components/TodoFilter.tsx
- src/components/TodoFilter.test.tsx

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

## 완료 조건
- 검증 명령 exit 0
