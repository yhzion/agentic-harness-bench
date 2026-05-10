# Test Environment Integrity

이 문서는 *검증 환경 무결성* 의 절대 원칙을 정의한다.
테스트·e2e·검증 코드는 **검증 대상**의 동작을 측정해야 한다. 검증 환경 자체를 조작하면 측정의 의미가 사라진다.

## 절대 원칙

### 원칙 1 — 검증 환경 자체를 patch 하지 말 것

테스트가 실패할 때, 첫 번째 본능은 *src/ 본체의 결함*을 의심하는 것이다.
테스트를 우회하거나 patch 하면 *증상만 가리고 결함은 남는다*. 그 결함은 사용자 환경에서 발현된다.

### 원칙 2 — verbatim 코드블록은 한 글자도 변경 금지

step spec 의 ` ```ts ... ``` ` 블록 중 "verbatim 복사" 또는 "verbatim append" 마커가 붙은 것은 *계약*이다.
sha256 일치를 강제 (gate: `verbatim`). 추가 import, helper 함수, polyfill, 주석 모두 위반.

### 원칙 3 — 우회 도구는 사용 가능하지만 사용 금지

Playwright 는 강력한 환경 조작 API 를 *제공* 한다. 이는 디버깅 목적으로 유용하나, *e2e 시나리오 안에서* 사용하면 신뢰할 수 없는 측정.

## 금지 API 목록

### Playwright (e2e/*)

`.agentic/contracts/e2e-forbidden-apis.json` 가 게이트 검증의 source of truth. 핵심:

| API | 위험 |
|---|---|
| `page.route` / `context.route` | 네트워크 응답 가로채기·변조 |
| `route.fulfill` / `route.continue` / `route.fallback` | 가로챈 요청에 임의 응답 주입 |
| `addInitScript` | 페이지 로드 전 임의 스크립트 주입 |
| `page.evaluate` / `frame.evaluate` / `evaluateHandle` | 페이지 컨텍스트에서 임의 JS 실행 |
| `page.exposeFunction` / `exposeBinding` | Node 함수를 브라우저 글로벌로 노출 |
| `setExtraHTTPHeaders` | 헤더 임의 변형 |
| `page.setContent` | HTML 전체 교체 |

### vitest (src/**/*.test.ts)

| 패턴 | 위험 |
|---|---|
| 글로벌 `crypto`, `fetch`, `localStorage` 등에 `vi.stubGlobal()` | 런타임과 다른 환경 만들기 |
| `vi.mock()` 으로 *내부 모듈* 모킹 | 단위 테스트 의도와 어긋남 (외부 경계만 모킹) |
| `import 'vitest/setup'` 내 임의 polyfill | 런타임과 일관성 깨짐 |

### 일반 (모든 테스트/e2e/spec)

- 테스트 파일에 *프로덕션 결함을 가리는* helper 함수 추가
- 빌드 산출물 (dist/) 직접 수정 또는 후처리
- runtime config (vite.config.ts) 에 폴리필 alias 추가하여 검증 우회

## "테스트가 실패할 때" 체크리스트

1. **에러 메시지의 stack trace 첫 번째 src/ 라인**을 본다 — 거기가 진짜 결함 위치.
2. 그 라인이 호출하는 API 가 *현재 환경*에서 정의되어 있는가? (`runtime-environment.md` 참조)
3. 정의돼 있지 않다면 → src/ 코드를 *환경에 맞게* 수정. 테스트는 손대지 않는다.
4. 정의돼 있다면 → 호출 인자/순서 등 src/ 로직 결함. src/ 수정.
5. **테스트의 polyfill/patch 추가는 어떤 경우에도 정답이 아니다**.

## 자가 검증 — 우회를 사용하지 않았는지 확인

```bash
# 1. e2e 가 환경 조작 API 사용 안 하는지
node .agentic/scripts/check-e2e-purity.mjs

# 2. e2e/test 파일이 verbatim 계약을 지키는지
node .agentic/scripts/verify-tests-verbatim.mjs

# 3. raw chromium (Playwright API 0개 사용) 으로 동작하는지
node .agentic/scripts/check-real-smoke.mjs
```

세 가지 모두 통과해야 검증 환경 무결성 보장.
