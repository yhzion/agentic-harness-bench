# STEP 020. TodoInput 스타일 — button-primary + text-input 토큰 적용

## 작업 단위
TodoInput.module.css와 스타일 테스트를 신규 작성하고, TodoInput.tsx에 className 속성만 연결한다.

## DESIGN.md 토큰 컨트랙트 (이 STEP의 CSS는 다음 변수만 참조)

이 STEP에서 사용 가능한 CSS 변수:
- `--color-primary`, `--color-primary-active`, `--color-on-primary`, `--color-primary-disabled`
- `--color-canvas`, `--color-ink`, `--color-hairline`, `--color-hairline-strong`, `--color-muted`
- `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`
- `--radius-none`
- `--type-button-size`, `--type-button-tracking`, `--type-body-md-size`, `--type-body-md-line`
- `--font-weight-display`, `--font-weight-body`

DESIGN.md 참조 컴포넌트:
- `{component.button-primary}`: bg=primary, color=on-primary, padding=14px 32px, height=48px, radius=none, type=button(14px/700/0.5px tracking)
- `{component.text-input}`: bg=canvas, color=ink, padding=14px 16px, height=48px, radius=none, border=1px hairline, focus border=ink

## 사전 작성된 테스트 (verbatim 복사 → src/components/TodoInput.style.test.tsx)

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import styles from './TodoInput.module.css'
import { TodoInput } from './TodoInput'

describe('TodoInput - 스타일 결합', () => {
  it('CSS Module은 .input과 .buttonPrimary 클래스를 export한다', () => {
    expect(styles.input).toBeTruthy()
    expect(styles.buttonPrimary).toBeTruthy()
  })

  it('CSS Module은 .form 클래스를 export한다 (form 컨테이너)', () => {
    expect(styles.form).toBeTruthy()
  })

  it('input 요소에 .input 클래스가 적용된다', () => {
    render(<TodoInput onAdd={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveClass(styles.input)
  })

  it('button 요소에 .buttonPrimary 클래스가 적용된다', () => {
    render(<TodoInput onAdd={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveClass(styles.buttonPrimary)
  })
})
```

## CSS 작성 가이드 (필수 규칙)

src/components/TodoInput.module.css는 다음 셀렉터만 정의:

```css
.form { /* flex 레이아웃 — gap은 var(--space-sm) */ }
.input { /* text-input 토큰 적용 */ }
.buttonPrimary { /* button-primary 토큰 적용 */ }
.buttonPrimary:active { /* primary-active 색상 */ }
.buttonPrimary:disabled { /* primary-disabled 색상 */ }
.input:focus { /* border 색상 강화 */ }
```

추가 셀렉터, 가상 요소(::before/::after), 다른 클래스 정의 금지.
인라인 hex / rgb / px / 9999가 아닌 radius / box-shadow / font-weight 500 / 음수 letter-spacing 모두 금지.
모든 색·간격·radius·폰트 값은 위 토큰 컨트랙트의 var()로만 표현한다.

## TodoInput.tsx 수정 (className 연결만)

기존 input의 className에 styles.input, button의 className에 styles.buttonPrimary, form의 className에 styles.form을 추가. 다른 변경 금지.

## 수정 가능 파일 (정확히 3개)
- src/components/TodoInput.module.css (신규)
- src/components/TodoInput.style.test.tsx (신규)
- src/components/TodoInput.tsx (className 속성 추가만)

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- src/components/TodoInput.test.tsx (STEP 019 로직 테스트 보존)
- 위 3개 외 모든 파일

## 검증 명령

```bash
node .agentic/scripts/check-style-step.mjs src/components/TodoInput.tsx \
  && node .agentic/scripts/run-gate.mjs step
```

style-step 가드는 .tsx 파일의 인라인 style 속성, 인라인 hex, rgb/rgba/hsl/hsla 사용을 0건으로 강제.
design:check가 자동으로 다음을 검사:
- 인라인 hex/rgb 0건
- border-radius는 0/9999/var(--radius-none|pill|full)만
- box-shadow 미사용
- font-weight 500 미사용
- 음수 letter-spacing 미사용

## 완료 조건
- 검증 명령 exit 0
- TodoInput 로직 테스트 + 스타일 테스트 모두 통과
