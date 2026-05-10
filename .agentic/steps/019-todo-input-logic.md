# STEP 019. TodoInput 컴포넌트 — 로직만 (스타일 없음)

## 시그니처 (변경 금지)

```tsx
// src/components/TodoInput.tsx
export type TodoInputProps = {
  onAdd: (title: string) => void
}

export function TodoInput(props: TodoInputProps): JSX.Element
```

## 사전 작성된 테스트 (verbatim 복사 → src/components/TodoInput.test.tsx)

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoInput } from './TodoInput'

describe('TodoInput - 로직', () => {
  it('input과 button을 렌더링한다', () => {
    render(<TodoInput onAdd={vi.fn()} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('input에 접근 가능한 이름이 있다 (aria-label 또는 label)', () => {
    render(<TodoInput onAdd={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveAccessibleName()
  })

  it('button 클릭 시 onAdd가 호출된다', async () => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<TodoInput onAdd={onAdd} />)
    await user.type(screen.getByRole('textbox'), '우유 사기')
    await user.click(screen.getByRole('button'))
    expect(onAdd).toHaveBeenCalledWith('우유 사기')
  })

  it('Enter 키로도 onAdd가 호출된다', async () => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<TodoInput onAdd={onAdd} />)
    await user.type(screen.getByRole('textbox'), '우유{Enter}')
    expect(onAdd).toHaveBeenCalledWith('우유')
  })

  it('제출 후 입력값은 초기화된다', async () => {
    const user = userEvent.setup()
    render(<TodoInput onAdd={vi.fn()} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.type(input, '우유{Enter}')
    expect(input.value).toBe('')
  })

  it('빈 또는 공백만 입력은 onAdd를 호출하지 않는다', async () => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<TodoInput onAdd={onAdd} />)
    await user.click(screen.getByRole('button'))
    expect(onAdd).not.toHaveBeenCalled()
    await user.type(screen.getByRole('textbox'), '   {Enter}')
    expect(onAdd).not.toHaveBeenCalled()
  })
})
```

## 작업 지시
- 컨트롤된 input 사용 (useState).
- form onSubmit으로 Enter와 button click을 함께 처리.
- 스타일 / className / 색상은 이 STEP에서 일절 추가하지 않는다 (다음 STEP의 책임).

## 수정 가능 파일 (정확히 2개)
- src/components/TodoInput.tsx
- src/components/TodoInput.test.tsx

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
- 컴포넌트에 className 또는 style 속성이 없음
