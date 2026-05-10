# Recovery Playbook

이 문서는 gate fail 발생 시 모델이 *처음으로* 읽는 진단·자가치유 가이드.
각 fail 마다 `.agentic/reports/recovery-hint.md` 가 자동 생성되며, 이 playbook 의 어느 패턴이 적용되는지 가리킨다.

## 자가치유 루프 원칙

1. **gate output 의 첫 줄을 읽고**, fail 한 gate 명을 식별한다.
2. **`.agentic/reports/recovery-hint.md` 를 읽는다** — 매칭된 패턴의 진단·자가검증 절차·금지 행동이 적힌다.
3. **`investigation_questions`** 에 답한다 — *답을 추측하지 말고 자가검증 절차로 확인*.
4. **`self_test_procedure`** 의 명령을 직접 실행한다 — 실제 출력을 본다.
5. 출력을 근거로 src/ 본체를 수정한다 (test/e2e/spec 우회 절대 금지).
6. 같은 gate 를 재실행한다.

## 매크로 원칙 — 절대 위반 금지

- **검증 환경 무결성**: 테스트가 통과하도록 *테스트 자체*를 patch 하면 검증의 의미가 사라진다. 실패하는 src/ 본체를 고친다.
- **계약 불변**: spec 의 verbatim 코드블록, .agentic/contracts/*, .agentic/scripts/* 는 STEP 진행 중 *어떤 이유로도* 변경 금지.
- **환경 인식**: vitest+jsdom 통과 ≠ 브라우저에서 동작. 항상 'npm run preview' + 'check-real-smoke' 로 검증.
- **답 추측 금지**: 모르면 self-test 명령을 실행해 *관찰*한다. 추측한 코드는 다음 retry 에서 또 fail.

## 환경 사실 (자주 헷갈리는 부분)

- **src/ 의 import 환경**: 브라우저 ESM (Vite-bundled). Node 빌트인 모듈 import 시 vite externalize → 빈 객체 → 호출 시 TypeError.
- **vitest 의 import 환경**: Node + jsdom. Node 빌트인은 native, 브라우저 글로벌은 jsdom polyfill. 즉 양쪽 다 동작 → 환경 차이 못 잡음.
- **e2e 의 환경**: Playwright + chromium. *test framework* 는 page.route 등 우회 도구를 *제공*하지만, 사용은 e2e-purity gate 가 차단.
- **check-real-smoke 의 환경**: raw chromium. 어떤 우회 도구도 사용하지 않음. 실제 사용자 환경.

전체 환경 사실: `.agentic/docs/runtime-environment.md`
검증 환경 무결성 절대 원칙: `.agentic/docs/test-environment-integrity.md`

## 자주 만나는 환경 funnel

```txt
vitest+jsdom 통과
  → vite build 통과 (warning 없을 때만)
    → bundle-purity 통과 (dead Node shim 없음)
      → e2e 통과 (e2e-purity 우회 없음)
        → real-smoke 통과 ✅ 실제 동작 보장
```

각 단계는 전 단계보다 더 *현실적인* 환경. 위쪽이 통과해도 아래에서 fail 하면 그 차이가 root cause.

## 패턴 색인

| pattern id | gate | 한 줄 요약 |
|---|---|---|
| verbatim-mismatch | verbatim | spec 코드블록과 byte 단위 sha256 불일치 |
| node-import-in-browser | src-imports | src/ 가 Node 빌트인 또는 미허용 패키지 import |
| e2e-environment-mutation | e2e-purity | e2e 가 page.route 등으로 검증 환경 조작 |
| bundle-has-dead-node-shims | bundle-purity | 빌드 산출물에 빈 Node CJS shim 존재 |
| real-browser-runtime-failure | real-smoke | raw chromium 에서 add 시나리오 실패 |
| scope-violation | step-scope | 현재 STEP 화이트리스트 외 파일 수정 |

상세 진단·절차는 `.agentic/contracts/failure-patterns.json` 참조.
