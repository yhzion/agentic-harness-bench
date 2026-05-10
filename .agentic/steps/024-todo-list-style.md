# STEP 024. TodoList 스타일 — model-card 그리드 패턴

## DESIGN.md 토큰 컨트랙트
사용 가능한 CSS 변수:
- `--color-canvas`, `--color-surface-card`, `--color-ink`, `--color-muted`, `--color-hairline`
- `--space-md`, `--space-lg`, `--space-xl`, `--space-section`
- `--radius-none`
- `--type-title-md-size`, `--type-body-sm-size`, `--type-body-md-size`, `--type-body-md-line`
- `--font-weight-display`, `--font-weight-body`

DESIGN.md 참조: `{component.model-card}` (canvas bg, padding=24px, radius=none, title=title-md/700/18px). 이 STEP은 list 컨테이너 + 각 list-item을 model-card 패턴으로 표시.

## 사전 작성된 테스트 (verbatim 복사 → src/components/TodoList.style.test.tsx)

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import styles from './TodoList.module.css'
import { TodoList } from './TodoList'
import type { Todo } from '../types/todo'

const sample: Todo[] = [
  { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
]
const noop = vi.fn()

describe('TodoList - 스타일 결합', () => {
  it('CSS Module이 .list, .item, .empty 클래스를 export한다', () => {
    expect(styles.list).toBeTruthy()
    expect(styles.item).toBeTruthy()
    expect(styles.empty).toBeTruthy()
  })

  it('ul에 .list 클래스가 적용된다', () => {
    render(<TodoList todos={sample} onToggle={noop} onRemove={noop} onUpdateTitle={noop} />)
    expect(screen.getByRole('list')).toHaveClass(styles.list)
  })

  it('각 li에 .item 클래스가 적용된다', () => {
    render(<TodoList todos={sample} onToggle={noop} onRemove={noop} onUpdateTitle={noop} />)
    expect(screen.getByRole('listitem')).toHaveClass(styles.item)
  })

  it('빈 상태 컨테이너에 .empty 클래스가 적용된다', () => {
    const { container } = render(
      <TodoList todos={[]} onToggle={noop} onRemove={noop} onUpdateTitle={noop} />,
    )
    expect(container.querySelector(`.${styles.empty}`)).not.toBeNull()
  })
})
```

## CSS 작성 가이드
src/components/TodoList.module.css에는 정확히 .list, .item, .empty 세 클래스만 정의.

```css
.list { /* list-style none + flex/grid + gap=var(--space-md) */ }
.item { /* model-card 패턴: canvas bg + padding=var(--space-lg) + border 1px hairline + radius-none */ }
.empty { /* muted text-color + body-md typography + 중앙 정렬 + padding=var(--space-section) */ }
```

추가 클래스/셀렉터 금지. 인라인 hex/px/rgb/box-shadow/font-weight 500/음수 letter-spacing 금지.

## 수정 가능 파일 (정확히 3개)
- src/components/TodoList.module.css (신규)
- src/components/TodoList.style.test.tsx (신규)
- src/components/TodoList.tsx (className 속성 추가만)

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- src/components/TodoList.test.tsx (STEP 023 로직 테스트)

## 검증 명령

```bash
node .agentic/scripts/check-style-step.mjs src/components/TodoList.tsx \
  && node .agentic/scripts/run-gate.mjs step
```

style-step 가드: 인라인 style/hex/rgb 0건 강제.

## 완료 조건
- 검증 명령 exit 0
