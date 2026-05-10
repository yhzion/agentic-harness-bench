# STEP 028. App Shell 스타일 — hero-band-dark + footer + 80px 섹션

## DESIGN.md 토큰 컨트랙트
사용 가능한 CSS 변수:
- `--color-canvas`, `--color-surface-soft`, `--color-surface-dark`, `--color-on-dark`, `--color-on-dark-soft`
- `--color-ink`, `--color-body`, `--color-muted`
- `--space-md`, `--space-lg`, `--space-xl`, `--space-xxl`, `--space-section`
- `--radius-none`
- `--type-display-xl-size`, `--type-display-xl-line`, `--type-display-md-size`
- `--type-body-md-size`, `--type-body-md-line`, `--type-body-sm-size`
- `--font-weight-display`, `--font-weight-body`

DESIGN.md 참조:
- `{component.hero-band-dark}`: bg=surface-dark, color=on-dark, padding=80px, h1=display-xl(64px/700)
- `{component.footer}`: bg=surface-soft (#f7f7f7), color=body, body-sm typography, padding=64px
- 섹션 리듬: light → dark → light (DESIGN.md "Don't repeat the same surface mode" 규칙)
- max-width 1440px center

## 사전 작성된 테스트 (verbatim 복사 → src/App.style.test.tsx)

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'
import styles from './App.module.css'

describe('App Shell - 스타일 결합', () => {
  it('CSS Module이 .hero, .container, .body, .footer를 export한다', () => {
    expect(styles.hero).toBeTruthy()
    expect(styles.container).toBeTruthy()
    expect(styles.body).toBeTruthy()
    expect(styles.footer).toBeTruthy()
  })

  it('h1이 .hero 컨테이너 내부에 있다', () => {
    render(<App />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.closest(`.${styles.hero}`)).not.toBeNull()
  })

  it('contentinfo(footer) 역할 요소가 .footer 클래스를 가진다', () => {
    render(<App />)
    expect(screen.getByRole('contentinfo')).toHaveClass(styles.footer)
  })
})
```

## CSS 작성 가이드
src/App.module.css에는 정확히 .hero, .container, .body, .footer 네 클래스만 정의.
- .hero: hero-band-dark 토큰 (surface-dark, on-dark, 80px padding, display-xl typography)
- .container: 1440px max-width + center
- .body: 80px section padding + canvas bg
- .footer: surface-soft bg + body-sm typography + 64px padding + role="contentinfo"

App.tsx 수정: 기존 구조에 className만 부여 + footer 역할의 footer 요소 추가(저작권 한 줄 정도). 도메인 로직 변경 금지.

## 수정 가능 파일 (정확히 3개)
- src/App.module.css (신규)
- src/App.style.test.tsx (신규)
- src/App.tsx (className 추가 + footer 요소 1개 추가만)

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- src/App.test.tsx (STEP 027 통합 테스트 — 변경하면 회귀)

## 검증 명령

```bash
node .agentic/scripts/check-style-step.mjs src/App.tsx \
  && node .agentic/scripts/run-gate.mjs step
```

style-step 가드: 인라인 style/hex/rgb 0건 강제. (footer 1개 추가는 JSX 트리 변경에 해당하지만 본 가드는 인라인 style 시리즈만 검사하므로 통과.)

## 완료 조건
- 검증 명령 exit 0
- 모든 이전 STEP의 테스트가 여전히 통과
