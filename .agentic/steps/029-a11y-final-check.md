# STEP 029. 접근성 최종 검증 — App 풀 렌더 + jest-axe

## 작업 단위
정확히 1개의 테스트 파일(src/App.a11y.test.tsx)을 신규 작성한다. 컴포넌트 코드는 일절 수정하지 않는다.

## 선행 조건
- STEP 027 (app-shell-logic) 까지 완료되어 `<App />`이 풀 렌더 가능한 상태.
- STEP 001에서 jest-axe + @types/jest-axe가 devDependencies에 설치되어 있다.

## 사전 작성된 테스트 (verbatim 복사 → src/App.a11y.test.tsx)

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { App } from './App'
import { TODO_STORAGE_KEY } from './storage/todoStorage'

expect.extend(toHaveNoViolations)

beforeEach(() => {
  localStorage.clear()
})

describe('App - 접근성 (axe-core)', () => {
  it('빈 상태에서 axe violations가 0건', async () => {
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('데이터가 있는 상태에서 axe violations가 0건', async () => {
    localStorage.setItem(
      TODO_STORAGE_KEY,
      JSON.stringify([
        { id: 'a', title: '우유 사기', completed: false, createdAt: 1, updatedAt: 1 },
        { id: 'b', title: '운동', completed: true, createdAt: 2, updatedAt: 2 },
        { id: 'c', title: '책 읽기', completed: false, createdAt: 3, updatedAt: 3 },
      ]),
    )
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

## 작업 지시
1. 위 테스트를 verbatim 복사한다.
2. 테스트 실행 시 axe violations가 발견되면, 이 STEP에서는 어떤 컴포넌트 코드도 수정하지 않는다.
3. 대신 fail 메시지를 `.agentic/reports/a11y-violations.md` 에 적은 뒤 STEP을 fail 처리한다(쉘 게이트가 자동 처리).
4. 컴포넌트 a11y 결함은 해당 컴포넌트 STEP(018~028 중 하나)으로 돌아가 수정해야 한다 — 하지만 그 결정은 STEP 진행자(인간)가 한다. Pi는 절대로 수정 가능 파일 외를 변경하지 않는다.

## 검증 범위 (jest-axe 기본 룰)
- ARIA 속성 유효성, role 충돌
- form 컨트롤 label 결합 (aria-label / aria-labelledby / for)
- 버튼/링크 접근 가능 이름
- heading 순서 (h1→h2→h3)
- list 시맨틱 (ul/ol/li 구조)
- 중복 id

## 검증 범위 외 (jest-axe + jsdom 한계)
- **색 대비**: jsdom이 외부 CSS 파일의 computed style을 적용하지 않으므로 axe color-contrast 룰은 비활성화/위양성. DESIGN.md 토큰 강제(`design:check`)로 간접 보장.
- **포커스 순서/실제 포커스 트랩**: 실제 브라우저 환경 필요. 본 게이트의 범위 외.

## 수정 가능 파일 (정확히 1개)
- src/App.a11y.test.tsx (신규)

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- src/App.tsx (STEP 027/028의 산출물 — 변경 시 회귀)
- src/components/** (각 컴포넌트 STEP의 산출물)
- 위 1개 외 모든 파일

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

전체 8단 게이트가 자동으로 실행되며, 그중 4번(test) 단계에서 이 a11y 테스트가 함께 통과해야 한다.

## 완료 조건
- 검증 명령 exit 0
- src/App.a11y.test.tsx 의 두 케이스 모두 axe violations 0건으로 통과
