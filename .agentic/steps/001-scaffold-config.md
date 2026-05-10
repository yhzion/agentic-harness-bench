# STEP 001. 스캐폴딩 — 패키지 + 도구 설정

## 작업 단위
package.json 과 모든 도구 설정 파일(10개)을 생성한다. 진입점(index.html / src 컴포넌트 코드)은 STEP 002의 책임이며 이 STEP에서는 작성하지 않는다. 단, `src/vite-env.d.ts`는 Vite의 CSS / CSS Module side-effect import 가 strict TypeScript 환경에서 컴파일되도록 하는 ambient 타입 선언 파일이므로 본 STEP의 스캐폴딩에 포함한다.

## 기술 스택 (정확한 버전 범위 — 임의 변경 금지)

```txt
typescript               ^6.0.0
vite                     ^8.0.0
@vitejs/plugin-react     ^5.0.0
react                    ^19.0.0
react-dom                ^19.0.0
vitest                   ^3.0.0
@testing-library/react       ^16.0.0
@testing-library/jest-dom    ^6.0.0
@testing-library/user-event  ^14.0.0
jsdom                        ^25.0.0
eslint                       ^9.0.0
typescript-eslint            ^8.0.0
eslint-plugin-react-hooks    ^5.0.0
eslint-plugin-react-refresh  ^0.4.0
prettier                     ^3.0.0
```

## 사전 작성된 파일 (verbatim 복사 — 한 글자도 변경 금지)

### package.json (기존 파일을 다음 내용으로 완전히 교체)

```json
{
  "name": "pi-agentic-shell-runner-kit",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "A Pi-based shell-orchestrated STEP runner kit for small LLM implementation agents.",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "agent:next": "node .agentic/scripts/next-step.mjs",
    "agent:pass": "node .agentic/scripts/mark-step.mjs pass",
    "agent:gate:smoke": "node .agentic/scripts/run-gate.mjs smoke",
    "agent:gate:bootstrap": "node .agentic/scripts/run-gate.mjs bootstrap",
    "agent:gate:step": "node .agentic/scripts/run-gate.mjs step",
    "agent:gate:full": "node .agentic/scripts/run-gate.mjs full",
    "agent:scope": "node .agentic/scripts/check-step-scope.mjs",
    "agent:current": "node .agentic/scripts/current-step-file.mjs",
    "agent:summary": "node .agentic/scripts/progress-summary.mjs",
    "agent:score": "node .agentic/scripts/score-run.mjs",
    "agent:leaderboard": "node .agentic/scripts/leaderboard.mjs",
    "agent:benchmark": "node .agentic/scripts/score-run.mjs && node .agentic/scripts/leaderboard.mjs",
    "agent:run:pi": "bash .agentic/bin/run-pi-step-loop.sh",
    "agent:run:pi:smoke": "GATE_MODE=smoke bash .agentic/bin/run-pi-step-loop.sh"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/jest-axe": "^3.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "eslint": "^9.0.0",
    "eslint-plugin-jsx-a11y": "^6.0.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "jest-axe": "^9.0.0",
    "jsdom": "^25.0.0",
    "prettier": "^3.0.0",
    "typescript": "^6.0.0",
    "typescript-eslint": "^8.0.0",
    "vite": "^8.0.0",
    "vitest": "^3.0.0"
  },
  "engines": {
    "node": ">=18"
  }
}
```

### tsconfig.json (신규)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tsconfig.node.json (신규)

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

### vite.config.ts (신규)

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### vitest.config.ts (신규)

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
```

### eslint.config.js (신규)

```js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '.agentic/scripts/**', '*.config.*'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
)
```

### .prettierrc.json (신규)

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

### .prettierignore (신규)

```
dist
node_modules
.agentic
```

### .gitignore (신규)

```
node_modules
dist
*.local
.DS_Store
```

### src/vite-env.d.ts (신규)

```ts
/// <reference types="vite/client" />
```

이 한 줄로 Vite 가 제공하는 ambient module 선언(`*.css`, `*.module.css`, `*.svg` 등)이 활성화되어, 이후 STEP 들에서 `import './foo.css'` 또는 `import styles from './bar.module.css'` 가 별도의 `// @ts-expect-error` 우회 없이 컴파일된다.

## 수정 가능 파일 (정확히 10개)
- package.json
- tsconfig.json
- tsconfig.node.json
- vite.config.ts
- vitest.config.ts
- eslint.config.js
- .prettierrc.json
- .prettierignore
- .gitignore
- src/vite-env.d.ts

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- 위 10개 외 모든 파일 (.agentic/** 포함)
- src/** (STEP 002의 책임) — 단 위 목록의 `src/vite-env.d.ts` 만 예외로 허용
- index.html (STEP 002의 책임)

## 검증 명령

```bash
npm install --no-audit --no-fund \
  && node .agentic/scripts/run-gate.mjs step
```

이 STEP은 src/ 가 사실상 비어 있으므로(`src/vite-env.d.ts` ambient 선언 한 줄만 존재) run-gate.mjs 의 typecheck/test/build 단계는 검사 대상이 없거나 trivially 통과한다(format:check, lint, design:lock 만 실제 실행). 진입점이 추가된 STEP 002에서 typecheck + build 가 본격적으로 실행된다.

## 완료 조건
- 검증 명령 exit 0
- node_modules 디렉토리 생성됨
- src/ 하위에는 `vite-env.d.ts` 단 하나만 존재 (App.tsx · main.tsx · index.html 등 STEP 002 산출물 미생성)
