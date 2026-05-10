# STEP 026. TodoFilter 스타일 — category-tab 패턴

## DESIGN.md 토큰 컨트랙트
사용 가능한 CSS 변수:
- `--color-canvas`, `--color-ink`, `--color-muted`
- `--space-xs`, `--space-sm`, `--space-md`
- `--radius-none`
- `--type-label-size`, `--type-label-tracking`
- `--font-weight-display`

DESIGN.md 참조: `{component.category-tab}` (transparent bg, muted text, label-uppercase typography) + `{component.category-tab-active}` (transparent bg, ink text, 2px ink underline).

## 사전 작성된 테스트 (verbatim 복사 → src/components/TodoFilter.style.test.tsx)

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import styles from './TodoFilter.module.css'
import { TodoFilter } from './TodoFilter'

describe('TodoFilter - 스타일 결합', () => {
  it('CSS Module이 .group, .tab, .tabActive를 export한다', () => {
    expect(styles.group).toBeTruthy()
    expect(styles.tab).toBeTruthy()
    expect(styles.tabActive).toBeTruthy()
  })

  it('group 컨테이너에 .group 클래스 적용', () => {
    const { container } = render(<TodoFilter value="all" onChange={vi.fn()} />)
    expect(container.querySelector(`.${styles.group}`)).not.toBeNull()
  })

  it('비활성 버튼에는 .tab만 적용', () => {
    render(<TodoFilter value="all" onChange={vi.fn()} />)
    const active = screen.getByRole('button', { name: /^(active|미완료)$/i })
    expect(active).toHaveClass(styles.tab)
    expect(active).not.toHaveClass(styles.tabActive)
  })

  it('활성 버튼에는 .tab과 .tabActive 둘 다 적용', () => {
    render(<TodoFilter value="active" onChange={vi.fn()} />)
    const active = screen.getByRole('button', { name: /^(active|미완료)$/i })
    expect(active).toHaveClass(styles.tab)
    expect(active).toHaveClass(styles.tabActive)
  })
})
```

## CSS 작성 가이드
정확히 .group, .tab, .tabActive 세 클래스만 정의. 추가 셀렉터/가상요소 금지.

## 수정 가능 파일 (정확히 3개)
- src/components/TodoFilter.module.css (신규)
- src/components/TodoFilter.style.test.tsx (신규)
- src/components/TodoFilter.tsx (className 속성 추가만)

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- src/components/TodoFilter.test.tsx

## 검증 명령

```bash
node .agentic/scripts/check-style-step.mjs src/components/TodoFilter.tsx \
  && node .agentic/scripts/run-gate.mjs step
```

style-step 가드: 인라인 style/hex/rgb 0건 강제.

## 완료 조건
- 검증 명령 exit 0
