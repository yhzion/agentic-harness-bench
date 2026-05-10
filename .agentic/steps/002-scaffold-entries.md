# STEP 002. 스캐폴딩 — 진입점 (HTML / src 코드)

## 작업 단위
index.html, src/main.tsx, src/App.tsx, src/test/setup.ts (정확히 4개)를 생성한다. 도메인 코드, 컴포넌트 디렉토리, 테스트 코드는 생성하지 않는다.

## 선행 조건
- STEP 001 완료 — package.json, tsconfig.json, vite.config.ts 등이 존재하고 npm install 이 끝나 있어야 한다.

## 사전 작성된 파일 (verbatim 복사 — 한 글자도 변경 금지)

### index.html (신규)

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Todo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### src/main.tsx (신규)

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### src/App.tsx (신규 — 최소 컨테이너)

```tsx
export function App() {
  return (
    <main>
      <h1>Todo</h1>
    </main>
  )
}
```

### src/test/setup.ts (신규)

```ts
import '@testing-library/jest-dom/vitest'
```

## 수정 가능 파일 (정확히 4개)
- index.html
- src/main.tsx
- src/App.tsx
- src/test/setup.ts

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- 위 4개 외 모든 파일
- 특히 STEP 001에서 작성한 package.json, tsconfig.json 등 — 이 STEP에서 변경 금지
- src/styles/, src/types/, src/domain/, src/storage/, src/hooks/, src/components/ 디렉토리는 후속 STEP의 책임이며 이 STEP에서 생성하지 않는다.

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

이 시점에 `src/` 가 처음 등장하므로 typecheck 와 build:strict 가 활성화된다. test 단계는 *.test.* 파일이 없어 자동 skip 된다. design:check 는 CSS 파일이 없어 skip.

## 완료 조건
- 검증 명령 exit 0
- dist/index.html, dist/assets/*.js 생성됨
- src/types, src/domain, src/components 등 후속 STEP 영역 미생성
