# STEP 029. 접근성 최종 검증 — App 풀 렌더 + jest-axe

## 작업 단위
`src/App.a11y.test.tsx`를 신규 작성해 axe 검증을 수행한다. 위반이 발견되면 **이 STEP 안에서** 해당 컴포넌트의 a11y 속성을 최소 수정하여 0건으로 만든다.

> ⚠ 본 STEP은 "검증 + 위반 시 최소 a11y 수정"을 단일 단위로 묶는다. 컴포넌트의 동작/시각 스타일은 변경하지 않는다(a11y 속성 추가/조정만 허용).

## 선행 조건
- STEP 027 (app-shell-logic)까지 완료되어 `<App />`이 풀 렌더 가능한 상태.
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
1. 위 테스트를 verbatim 복사해 `src/App.a11y.test.tsx`에 저장한다.
2. 게이트의 4번(test) 단계를 실행해 axe 결과를 확인한다.
3. **violations이 0건이면** 다른 파일은 일절 건드리지 말고 종료한다.
4. **violations이 1건 이상이면** 다음 절차를 따른다:
   - 4-1. `.agentic/reports/a11y-violations.md`에 발견된 룰/요소/수정 방향을 기록한다.
   - 4-2. 해당 컴포넌트(`src/components/<Name>.tsx`)에 **a11y 속성만** 추가/수정한다. 허용되는 변경:
     - `aria-label`, `aria-labelledby`, `aria-describedby`, `role`, `<label htmlFor>` 추가
     - `id` 부여(라벨 연결 목적)
     - 시맨틱 태그 교체가 불가피한 경우 동일 의미의 태그(예: `<div role="list">` → `<ul>`)
   - 4-3. 금지되는 변경:
     - 기능 로직 수정(state, props, 이벤트 핸들러, 렌더 분기)
     - CSS 모듈/스타일 변경
     - 새로운 자식 요소 추가(라벨 텍스트 노드는 허용)
   - 4-4. 모든 위반이 0건이 될 때까지 4-1~4-3을 반복한다.
5. 최종적으로 게이트가 exit 0이 되면 STEP 통과.

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

## 수정 가능 파일
- `src/App.a11y.test.tsx` (신규, 필수)
- `.agentic/reports/a11y-violations.md` (위반 발견 시에만)
- `src/components/*.tsx` (위반 발견 시, **a11y 속성 변경만** — 위 4-2/4-3 규칙 준수)

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- `src/App.tsx` (STEP 027/028의 산출물)
- `src/components/*.module.css` (스타일은 본 STEP의 범위 외)
- `src/components/*.test.tsx`, `src/components/*.style.test.tsx` (컴포넌트 STEP의 산출물)
- 위 "수정 가능 파일" 외 모든 파일

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

전체 8단 게이트가 자동으로 실행되며, 그중 4번(test) 단계에서 이 a11y 테스트가 함께 통과해야 한다.

## 완료 조건
- 검증 명령 exit 0
- `src/App.a11y.test.tsx`의 두 케이스 모두 axe violations 0건으로 통과
- 컴포넌트 변경이 발생한 경우, 해당 컴포넌트의 기존 테스트(`*.test.tsx`, `*.style.test.tsx`)도 회귀 없이 통과

## 설계 메모
- 본 STEP은 원래 "검증 only"로 설계되었으나, strict-gate 자동화 환경에서는 위반 발견 시 회귀 경로(이전 컴포넌트 STEP 자동 재오픈)가 없어 데드락이 발생했다. 검증과 a11y 한정 수정을 단일 STEP으로 묶어 자동 통과 경로를 확보한다.
- 컴포넌트의 기능/스타일 회귀를 막기 위해 수정 가능 범위를 "a11y 속성"으로 좁히고, 회귀는 기존 컴포넌트 테스트(STEP 018~028 산출물)로 검출한다.
