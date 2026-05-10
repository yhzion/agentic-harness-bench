# STEP 022. TodoItem 스타일 — 완료/편집 상태 표현

## DESIGN.md 토큰 컨트랙트
사용 가능한 CSS 변수:
- `--color-canvas`, `--color-ink`, `--color-body`, `--color-muted`, `--color-muted-soft`
- `--color-hairline`, `--color-error`
- `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`
- `--radius-none`
- `--type-body-md-size`, `--type-body-md-line`, `--type-label-size`, `--type-label-tracking`
- `--font-weight-display`, `--font-weight-body`, `--font-weight-utility`

DESIGN.md 참조:
- 완료된 항목은 `{colors.muted-soft}`로 약화 (취소선 추가 가능 — text-decoration: line-through 허용)
- 편집 input은 `{component.text-input}` 토큰 적용
- 삭제 버튼은 `{typography.label-uppercase}` (UPPERCASE + 1.5px tracking) 패턴

## 사전 작성된 테스트 (verbatim 복사 → src/components/TodoItem.style.test.tsx)

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import styles from './TodoItem.module.css'
import { TodoItem } from './TodoItem'
import type { Todo } from '../types/todo'

const make = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'a',
  title: 'Sample',
  completed: false,
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
})

describe('TodoItem - 스타일 결합', () => {
  it('CSS Module이 .row, .checkbox, .title, .titleCompleted, .removeButton, .editInput를 export', () => {
    expect(styles.row).toBeTruthy()
    expect(styles.checkbox).toBeTruthy()
    expect(styles.title).toBeTruthy()
    expect(styles.titleCompleted).toBeTruthy()
    expect(styles.removeButton).toBeTruthy()
    expect(styles.editInput).toBeTruthy()
  })

  it('미완료 title에 .title 클래스가 적용된다', () => {
    render(
      <TodoItem todo={make()} onToggle={vi.fn()} onRemove={vi.fn()} onUpdateTitle={vi.fn()} />,
    )
    expect(screen.getByText('Sample')).toHaveClass(styles.title)
  })

  it('완료된 title에 .titleCompleted 클래스가 추가된다', () => {
    render(
      <TodoItem
        todo={make({ completed: true })}
        onToggle={vi.fn()}
        onRemove={vi.fn()}
        onUpdateTitle={vi.fn()}
      />,
    )
    expect(screen.getByText('Sample')).toHaveClass(styles.titleCompleted)
  })

  it('removeButton에 .removeButton 클래스가 적용된다', () => {
    render(
      <TodoItem todo={make()} onToggle={vi.fn()} onRemove={vi.fn()} onUpdateTitle={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /delete|삭제|remove/i })).toHaveClass(
      styles.removeButton,
    )
  })
})
```

## CSS 작성 가이드
src/components/TodoItem.module.css에는 정확히 다음 클래스만:
.row, .checkbox, .title, .titleCompleted, .removeButton, .editInput

추가 클래스/셀렉터 금지. 인라인 hex/rgb/box-shadow/font-weight 500/음수 letter-spacing/비허용 radius 금지.

## 수정 가능 파일 (정확히 3개)
- src/components/TodoItem.module.css (신규)
- src/components/TodoItem.style.test.tsx (신규)
- src/components/TodoItem.tsx (className 속성 추가만)

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- src/components/TodoItem.test.tsx

## 검증 명령

```bash
node .agentic/scripts/check-style-step.mjs src/components/TodoItem.tsx \
  && node .agentic/scripts/run-gate.mjs step
```

style-step 가드: 인라인 style/hex/rgb 0건 강제.

## 완료 조건
- 검증 명령 exit 0
