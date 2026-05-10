# Pi Agentic Shell Runner Kit

이 저장소는 **Pi Coding Agent + 소형 LLM**으로 STEP 기반 자율 구현을 수행하기 위한 템플릿입니다.

핵심 설계는 다음과 같습니다.

```txt
Pi Agent = 현재 STEP 구현자
Shell Script = STEP 오케스트레이터
```

즉, Pi에게 전체 진행 상태를 맡기지 않습니다.

Shell Script가 다음을 담당합니다.

```txt
currentStep 확인
→ 현재 STEP 파일 선택
→ Pi를 비인터랙티브 명령으로 실행
→ 검증 명령 실행
→ 성공하면 다음 STEP으로 이동
→ 실패하면 같은 STEP 재시도
→ 최대 재시도 초과 시 중단
```

Pi는 오직 현재 STEP의 구현만 담당합니다.

---

## 왜 Pi 기준으로 이렇게 구성하는가?

Pi는 공식 문서에서 **minimal terminal coding harness**로 설명됩니다. 또한 확장, 스킬, 프롬프트 템플릿, 테마, 패키지로 워크플로우를 맞추는 구조입니다.

이 키트는 그 철학에 맞춰 Pi 내부에 복잡한 STEP 관리자나 플래너를 넣지 않고, **쉘 스크립트가 외부 오케스트레이터 역할**을 하도록 구성했습니다.

Pi의 JSON event stream mode는 다음 형태로 실행할 수 있습니다.

```bash
pi --mode json "Your prompt"
```

이 키트의 runner는 이 방식을 사용해 Pi를 비인터랙티브 명령형으로 호출합니다.

---

## 디렉토리 구조

```txt
.agentic/
  bin/
    run-pi-step-loop.sh

  contracts/
    function-signatures.md
    interfaces.md

  docs/
    spec.md
    architecture.md
    dependency-rules.md
    evaluation.md
    quality-gates.md
    runbook.md

  prompts/
    pi-step-implementer.md
    pi-agent-main.md
    current-step-runner.md
    failure-analysis.md
    reviewer.md

  reports/
    failure-report.md

  scripts/
    current-step-file.mjs
    next-step.mjs
    mark-step.mjs
    run-gate.mjs
    check-step-scope.mjs
    progress-summary.mjs
    write-failure-report.mjs

  steps/
    001-project-health.md
    002-contract-types.md
    ...

  progress.json
  progress.md

README.md
START_HERE.md
package.json
```

---

## 설치 전제

### 1. Node.js

Node.js 18 이상을 권장합니다.

```bash
node --version
```

### 2. Pi 설치

Linux 또는 macOS:

```bash
curl -fsSL https://pi.dev/install.sh | sh
```

또는 npm:

```bash
npm install -g @earendil-works/pi-coding-agent
```

설치 확인:

```bash
pi --version
```

### 3. Pi 인증 또는 API Key 설정

Pi를 처음 사용한다면 한 번은 대화형으로 실행해서 로그인합니다.

```bash
pi
```

Pi 안에서:

```txt
/login
```

또는 사용하는 provider에 맞는 API Key를 환경 변수로 설정합니다.

예:

```bash
export ANTHROPIC_API_KEY="..."
```

---

## 사용 방법

### 1. 압축 해제

```bash
unzip pi-agentic-shell-runner-kit.zip
cd pi-agentic-shell-runner-kit
```

### 2. 현재 STEP 확인

```bash
npm run agent:current
```

또는 상세 내용 확인:

```bash
npm run agent:next
```

### 3. Pi 기반 명령형 STEP 루프 실행

```bash
npm run agent:run:pi
```

이 명령은 다음 루프를 자동으로 수행합니다.

```txt
현재 STEP 확인
→ Pi에게 현재 STEP만 구현 요청
→ npm run agent:gate:step 실행
→ 통과하면 progress.json 갱신
→ 다음 STEP으로 이동
→ 실패하면 같은 STEP 재시도
→ 3회 실패하면 failure-report.md 작성 후 중단
```

---

## 실행 흐름

```txt
.agentic/progress.json
  ↓
.agentic/scripts/current-step-file.mjs
  ↓
.agentic/bin/run-pi-step-loop.sh
  ↓
pi --mode json "현재 STEP 구현 프롬프트"
  ↓
npm run agent:gate:step
  ↓
성공?
  ├─ Yes → mark-step.mjs pass → 다음 STEP
  └─ No  → mark-step.mjs fail → 같은 STEP 재시도
                         └─ MAX_RETRY 초과 → failure-report.md 작성 후 종료
```

---

## Pi에게 주입되는 역할

Pi는 `.agentic/prompts/pi-step-implementer.md`를 기본 프롬프트로 받습니다.

핵심 내용은 다음과 같습니다.

```txt
너는 오케스트레이터가 아니다.
쉘 스크립트가 오케스트레이터다.
너는 현재 STEP의 구현만 담당한다.
progress.json을 수정하지 마라.
다음 STEP으로 이동하지 마라.
현재 STEP의 수정 가능 파일만 수정하라.
```

따라서 Pi는 다음을 하지 않습니다.

```txt
- STEP 이동 판단
- progress.json 직접 갱신
- 전체 앱 구현
- 미래 STEP 선행 구현
- 스펙 외 기능 추가
```

---

## 환경 변수

### MAX_RETRY

한 STEP에서 실패 시 재시도할 최대 횟수입니다.

기본값:

```txt
3
```

사용 예:

```bash
MAX_RETRY=5 npm run agent:run:pi
```

### GATE_MODE

검증 모드를 지정합니다.

가능한 값:

```txt
smoke
step
full
```

사용 예:

```bash
GATE_MODE=full npm run agent:run:pi
```

또는 미리 정의된 스크립트:

```bash
npm run agent:run:pi:smoke
npm run agent:run:pi:full
```

### PI_BIN

Pi 실행 파일명이 다를 때 사용합니다.

```bash
PI_BIN=pi npm run agent:run:pi
```

### PI_MODE

기본값은 `json`입니다.

```bash
PI_MODE=json npm run agent:run:pi
```

runner는 내부적으로 다음 형태를 사용합니다.

```bash
pi --mode json "prompt"
```

### AUTO_COMMIT

STEP 통과 후 자동 커밋을 만들고 싶을 때 사용합니다.

```bash
AUTO_COMMIT=1 npm run agent:run:pi
```

---

## 검증 명령

### 현재 STEP 파일 출력

```bash
npm run agent:current
```

### 현재 STEP 상세 출력

```bash
npm run agent:next
```

### STEP 검증

```bash
npm run agent:gate:step
```

### 전체 검증

```bash
npm run agent:gate:full
```

### 진행 상태 요약

```bash
npm run agent:summary
```

### 변경 파일 확인

```bash
npm run agent:scope
```

---

## STEP 파일 작성 규칙

각 STEP은 가능한 작게 유지합니다.

좋은 STEP:

```txt
validateTodoTitle 함수가 빈 문자열을 실패 처리하도록 구현한다.
```

나쁜 STEP:

```txt
Todo 도메인 로직 전체를 구현한다.
```

권장 STEP 구조:

```md
# STEP 003. validateTodoTitle 빈 문자열 처리

## 목표

빈 문자열 title은 실패해야 한다.

## 읽기 파일

- src/domain/validateTodoTitle.ts
- src/domain/validateTodoTitle.test.ts

## 수정 가능 파일

- src/domain/validateTodoTitle.ts
- src/domain/validateTodoTitle.test.ts

## 수정 금지

- src/components/*
- src/store/*
- src/storage/*

## 구현 조건

- validateTodoTitle('')는 실패 결과를 반환한다.
- 예외를 던지지 않는다.
- 공백 문자열 처리는 다음 STEP에서 한다.

## 검증 명령

npm test -- validateTodoTitle

## 완료 조건

- 테스트 통과
- 타입 에러 없음
- 수정 가능 파일 외 변경 없음
```

---

## 실제 프로젝트에 적용하는 방법

이미 존재하는 프로젝트에 적용하려면 `.agentic` 디렉토리와 필요한 스크립트만 복사합니다.

```bash
cp -R pi-agentic-shell-runner-kit/.agentic ./my-project/.agentic
cp pi-agentic-shell-runner-kit/START_HERE.md ./my-project/START_HERE.md
```

`package.json`에는 다음 스크립트를 추가합니다.

```json
{
  "scripts": {
    "agent:current": "node .agentic/scripts/current-step-file.mjs",
    "agent:next": "node .agentic/scripts/next-step.mjs",
    "agent:summary": "node .agentic/scripts/progress-summary.mjs",
    "agent:gate:smoke": "node .agentic/scripts/run-gate.mjs smoke",
    "agent:gate:step": "node .agentic/scripts/run-gate.mjs step",
    "agent:gate:full": "node .agentic/scripts/run-gate.mjs full",
    "agent:scope": "node .agentic/scripts/check-step-scope.mjs",
    "agent:run:pi": "bash .agentic/bin/run-pi-step-loop.sh",
    "agent:run:pi:smoke": "GATE_MODE=smoke bash .agentic/bin/run-pi-step-loop.sh",
    "agent:run:pi:full": "GATE_MODE=full bash .agentic/bin/run-pi-step-loop.sh"
  }
}
```

---

## 운영 추천

처음부터 끝까지 자동으로 돌리기보다 다음 순서를 추천합니다.

```txt
1. 1~2 STEP 수동 확인
2. 3~5 STEP 자동 실행
3. 실패 패턴 확인
4. STEP 크기 조정
5. 10~20 STEP 자동 실행
6. 안정되면 전체 실행
```

소형 LLM에서는 STEP을 작게 나누는 것이 중요합니다.

```txt
좋음:
- 타입 하나 정의
- 함수 하나의 조건 하나 구현
- 테스트 하나 추가
- 컴포넌트 props 하나 연결
- 버튼 이벤트 하나 연결

나쁨:
- 전체 앱 구현
- 상태 관리 전체 구현
- UI 전체 구현
- 대규모 리팩터링
```

---

## 실패 시 확인할 파일

```txt
.agentic/reports/failure-report.md
.agentic/progress.json
.agentic/progress.md
git diff
```

실패 후에는 다음 중 하나를 선택합니다.

```txt
1. STEP 명세를 더 작게 쪼갠다.
2. 수정 가능 파일 범위를 명확히 한다.
3. 검증 명령을 현실적으로 조정한다.
4. 사람이 해당 STEP을 직접 수정한 후 runner를 다시 실행한다.
```

---

## 핵심 원칙

```txt
Pi는 구현자다.
Shell Script는 오케스트레이터다.
테스트와 명령 결과가 성공 여부를 판단한다.
```

가장 중요한 문장:

```txt
Pi에게 STEP 이동을 맡기지 말고, 쉘 스크립트가 명시적으로 이동시킨다.
```
