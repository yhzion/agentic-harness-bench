# Runtime Environment

이 문서는 src/ 코드가 *어디서 어떻게* 실행되는지에 대한 환경 사실(canonical facts)을 정의한다.
모든 step 의 코드 작성/디버깅 시 *반드시* 이 사실에 부합하도록 구현해야 한다.

## src/ 코드의 실행 환경

| 항목 | 값 |
|---|---|
| 런타임 | 브라우저 ESM (Vite-bundled) |
| 모듈 시스템 | ECMAScript modules |
| 번들러 | vite |
| TypeScript | tsc --noEmit (타입체크만) |
| 타깃 | ES2022, DOM, DOM.Iterable |

### 사용 가능 글로벌

브라우저 표준 globalThis 의 일부:

- DOM: `document`, `window`, `Node`, `Element`, `HTMLElement`, ...
- Web APIs: `globalThis.crypto` (Web Crypto API), `fetch`, `Request`, `Response`, `Headers`, `URL`, `URLSearchParams`, `FormData`, `Blob`, `File`, `FileReader`, `localStorage`, `sessionStorage`, `IndexedDB`, `WebSocket`, `EventSource`, `Notification`
- 표준 ECMAScript: `Date`, `Math`, `JSON`, `Array`, `Object`, `String`, `Number`, `BigInt`, `Boolean`, `Symbol`, `Map`, `Set`, `WeakMap`, `WeakSet`, `Promise`, `Proxy`, `Reflect`, `Error`, `RegExp`, `ArrayBuffer`, `TypedArray`, `Intl`
- Timer: `setTimeout`, `setInterval`, `setImmediate`(없음), `queueMicrotask`, `requestAnimationFrame`

### 사용 불가능 (절대 import 금지)

Node.js 빌트인 모듈은 *모두 차단*. vite 가 빈 객체로 externalize → 호출 시 TypeError.

| 차단된 모듈 | 같은 기능의 브라우저 API |
|---|---|
| `crypto`, `node:crypto` | `globalThis.crypto` (Web Crypto API) |
| `fs`, `node:fs`, `fs/promises` | (없음 — localStorage / IndexedDB 사용) |
| `path`, `node:path` | (브라우저는 경로 개념 없음 — URL 사용) |
| `os`, `node:os` | (브라우저 환경엔 OS 추상 없음) |
| `child_process`, `node:child_process` | (브라우저는 프로세스 spawn 불가) |
| `util`, `node:util` | (대부분 표준 ES 또는 lodash-equivalent 직접 작성) |
| `stream`, `node:stream` | `ReadableStream`, `WritableStream`, `TransformStream` |
| `buffer`, `node:buffer` | `Uint8Array`, `ArrayBuffer`, `TextEncoder`, `TextDecoder` |
| `process`, `node:process` | (브라우저엔 process 없음 — `import.meta.env` for vite env) |

### 미허용 third-party 패키지

`react`, `react-dom`, `react/jsx-runtime` 외 npm specifier 는 src-imports gate 가 차단.
`uuid`, `nanoid`, `cuid`, `lodash`, 기타 패키지 모두 추가 금지 (필요 기능은 표준 API 또는 직접 작성).

전체 allowlist: `.agentic/contracts/src-import-allowlist.json`.

## 테스트 환경 vs 런타임 환경 (가장 자주 헷갈리는 부분)

| 환경 | 모듈 시스템 | Node 빌트인 | 브라우저 글로벌 | 결론 |
|---|---|---|---|---|
| vitest + jsdom | ESM + Node | ✅ 사용 가능 (native) | ✅ jsdom polyfill | 통과해도 *런타임 보장 아님* |
| vite build (production) | ESM | ❌ externalize | (사용자 코드 안 들어감) | warning 만으론 부족 — bundle-purity gate 필요 |
| Playwright + chromium | (테스트 컨텍스트) | (드라이버 격) | ✅ 진짜 브라우저 | e2e-purity gate 통과 시 신뢰 가능 |
| Raw chromium (real-smoke) | ESM | ❌ | ✅ 진짜 브라우저 | **유일한 ground-truth — 통과 = 실제 동작** |

→ 같은 코드가 vitest 통과 + raw chromium 실패할 수 있음. 이 funnel 은 의도된 설계.

## src/ 가 아닌 영역의 환경

- `e2e/`: Playwright + Node (테스트 시 별도 컨텍스트). 단 환경 조작 API 사용은 e2e-purity gate 가 차단.
- `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`: Node 환경. Node 빌트인 import 가능.
- `.agentic/scripts/*.mjs`: Node 환경. 빌트인 import 가능. (단 모든 STEP 에서 수정 금지.)

## 자가 검증 명령

src/ 코드의 환경 적합성을 의심할 때 직접 실행:

```bash
# 1. vite build 가 어떤 모듈을 externalize 했는지 확인
npm run build 2>&1 | grep -i "externalized"

# 2. 빌드된 bundle 에 dead Node shim 있는지
node .agentic/scripts/check-bundle-purity.mjs

# 3. 실제 브라우저에서 add 시나리오 동작하는지
node .agentic/scripts/check-real-smoke.mjs

# 4. src/ 의 import 가 allowlist 안에 있는지
node .agentic/scripts/check-src-imports.mjs
```
