# STEP 004. DESIGN.md 토큰을 CSS 변수로 추출

## 작업 단위
DESIGN.md의 colors / typography / spacing / rounded YAML 토큰을 CSS 커스텀 프로퍼티로 변환해 src/styles/tokens.css에 작성한다. src/main.tsx에서 이를 import한다.

## 사전 작성된 파일 (verbatim 복사)

### src/styles/tokens.css (신규)

```css
:root {
  /* === colors (BMW DESIGN.md) === */
  --color-primary: #1c69d4;
  --color-primary-active: #0653b6;
  --color-primary-disabled: #d6d6d6;
  --color-ink: #262626;
  --color-body: #3c3c3c;
  --color-body-strong: #1a1a1a;
  --color-muted: #6b6b6b;
  --color-muted-soft: #9a9a9a;
  --color-hairline: #e6e6e6;
  --color-hairline-strong: #cccccc;
  --color-canvas: #ffffff;
  --color-surface-soft: #f7f7f7;
  --color-surface-card: #fafafa;
  --color-surface-strong: #ebebeb;
  --color-surface-dark: #1a2129;
  --color-surface-dark-elevated: #262e38;
  --color-on-primary: #ffffff;
  --color-on-dark: #ffffff;
  --color-on-dark-soft: #bbbbbb;
  --color-m-blue-light: #0066b1;
  --color-m-blue-dark: #1c69d4;
  --color-m-red: #e22718;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #dc2626;

  /* === spacing (8px base) === */
  --space-xxs: 4px;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-xxl: 48px;
  --space-section: 80px;

  /* === radius (rectangular only) === */
  --radius-none: 0px;
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 9999px;
  --radius-full: 9999px;

  /* === typography === */
  --font-family-base: 'BMW Type Next Latin', system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-weight-display: 700;
  --font-weight-body: 300;
  --font-weight-utility: 400;

  --type-display-xl-size: 64px;
  --type-display-xl-line: 1.05;
  --type-display-lg-size: 48px;
  --type-display-lg-line: 1.1;
  --type-display-md-size: 32px;
  --type-display-md-line: 1.15;
  --type-display-sm-size: 24px;
  --type-display-sm-line: 1.25;
  --type-title-lg-size: 20px;
  --type-title-md-size: 18px;
  --type-title-sm-size: 16px;
  --type-body-md-size: 16px;
  --type-body-md-line: 1.55;
  --type-body-sm-size: 14px;
  --type-body-sm-line: 1.55;
  --type-caption-size: 12px;
  --type-caption-tracking: 0.5px;
  --type-label-size: 13px;
  --type-label-tracking: 1.5px;
  --type-button-size: 14px;
  --type-button-tracking: 0.5px;
  --type-nav-size: 14px;
  --type-nav-tracking: 0.3px;
}

html,
body {
  margin: 0;
  padding: 0;
  background: var(--color-canvas);
  color: var(--color-ink);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-body);
  font-size: var(--type-body-md-size);
  line-height: var(--type-body-md-line);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}
```

### src/main.tsx (수정 — import 한 줄 추가)

기존 import 영역에 다음 한 줄을 추가한다(다른 변경 없이).

```tsx
import './styles/tokens.css'
```

수정 후 src/main.tsx 전체:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

## 작업 지시
1. src/styles/tokens.css를 위 내용 그대로 작성한다.
2. src/main.tsx에 토큰 import 한 줄을 추가한다(다른 줄 변경 금지).

## 수정 가능 파일 (정확히 2개)
- src/styles/tokens.css
- src/main.tsx

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- 위 2개 외 모든 파일

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

design:check가 tokens.css의 hex 정의는 허용하고, 다른 파일의 인라인 hex는 거부함을 확인.

## 완료 조건
- 검증 명령 exit 0
- src/styles/tokens.css에 모든 DESIGN.md 토큰이 CSS 변수로 정의됨
