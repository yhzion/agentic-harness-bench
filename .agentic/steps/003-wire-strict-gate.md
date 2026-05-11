# STEP 003. zero-warning 게이트 스크립트 연결

## 작업 단위
package.json의 scripts 섹션에 zero-warning 게이트 + 번들 사이즈 게이트 항목을 추가한다. 다른 작업은 하지 않는다.

## 추가할 npm 스크립트 (정확히 이 이름과 명령으로)

```json
{
  "format:check": "prettier --check .",
  "format:write": "prettier --write .",
  "lint": "eslint . --max-warnings 0",
  "design:lock": "node .agentic/scripts/verify-design-lock.mjs",
  "design:check": "node .agentic/scripts/check-design-tokens.mjs",
  "rubric:lock": "node .agentic/scripts/verify-rubric-lock.mjs",
  "build:strict": "node .agentic/scripts/build-strict.mjs",
  "bundle:check": "node .agentic/scripts/check-bundle-size.mjs"
}
```

## 작업 지시
1. package.json을 읽는다.
2. 위 8개 항목을 scripts 객체에 추가한다(기존 스크립트는 그대로 둔다).
3. 키 순서는 자유. 다른 필드(dependencies, devDependencies 등)는 절대 변경하지 않는다.
4. `package.json`은 STEP 001이 잠궈둔 파일이다. 본 STEP에서 정당하게 수정하므로, 작업 후 STEP 001의 snapshot lock을 갱신해야 한다:

   ```bash
   node .agentic/scripts/verify-step-snapshots.mjs --refresh 001-scaffold-config
   ```

   이 명령을 누락하면 게이트 0단(snapshot-verify)에서 즉시 fail한다.

## 수정 가능 파일 (정확히 1개)
- package.json

## 수정 금지
- 위 1개 외 모든 파일
- `.agentic/contracts/benchmark-rubric.json` (벤치마크 루브릭은 모든 STEP에서 변경 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step
```

이 게이트는 `step` 모드에서 다음 9단을 순차 실행하고, 첫 실패에서 즉시 중단한다.
1. format:check (prettier — 차이 0)
2. lint (eslint --max-warnings 0 — jsx-a11y 포함)
3. typecheck (tsc --noEmit)
4. test (vitest run)
5. design:lock (DESIGN.md sha256 검증)
6. design:check (CSS 토큰 정적 분석 — CSS 파일이 없으면 skip)
7. rubric:lock (benchmark-rubric.json sha256 검증 — 평가 루브릭 변조 차단)
8. build:strict (vite build — warning 라인 검출 시 fail)
9. bundle:check (dist/assets gzipped 사이즈 — `.agentic/contracts/bundle-budget.json` 기준)

## 완료 조건
- 검증 명령 exit 0
- package.json에 8개 스크립트 모두 존재
