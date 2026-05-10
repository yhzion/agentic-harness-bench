# Agentic Implementation Kit

소형 LLM과 Pi Agent 같은 터미널 기반 코딩 에이전트가 **현재 STEP 하나만 처리하면서도 끝까지 자율 구현**을 이어가도록 만드는 Git 저장소 템플릿입니다.

이 키트의 목적은 LLM에게 전체 개발 맥락을 계속 기억시키는 것이 아니라, 다음 구조를 파일로 고정하는 것입니다.

```txt
스펙
→ 계약
→ STEP
→ 테스트
→ 구현
→ 검증
→ 통과 시 다음 STEP
```

핵심 원칙은 간단합니다.

```txt
설계는 문서와 계약으로 고정한다.
구현은 현재 STEP 안에서만 수행한다.
평가는 테스트와 품질 게이트로 판단한다.
진행 상태는 progress 파일에 기록한다.
```

---

## 1. 이 저장소에 포함된 것

```txt
.agentic/
  docs/
    spec.md
    evaluation.md
    architecture.md
    dependency-rules.md
    quality-gates.md
    runbook.md
  contracts/
    function-signatures.md
    interfaces.md
  prompts/
    pi-agent-main.md
    current-step-runner.md
    reviewer.md
    failure-analysis.md
  steps/
    001-project-health.md
    002-contract-types.md
    003-validate-title-empty.md
    ...
    020-preview-check.md
  templates/
    step-template.md
    function-signature-template.ts
    interface-template.ts
    test-template.ts
  scripts/
    next-step.mjs
    mark-step.mjs
    run-gate.mjs
    check-step-scope.mjs
  progress.json
  progress.md

README.md
START_HERE.md
package.json
.gitignore
```

각 파일의 역할은 다음과 같습니다.

| 위치 | 역할 |
|---|---|
| `.agentic/docs/spec.md` | 구현할 앱의 확정 스펙 |
| `.agentic/docs/evaluation.md` | 구현 평가 기준 |
| `.agentic/docs/dependency-rules.md` | 의존성 방향 규칙 |
| `.agentic/docs/quality-gates.md` | 통과해야 할 품질 게이트 |
| `.agentic/contracts/interfaces.md` | 인터페이스, 추상 클래스, 저장소 계약 |
| `.agentic/contracts/function-signatures.md` | 함수 시그니처와 public API 계약 |
| `.agentic/steps/*.md` | 선형 구현 STEP |
| `.agentic/prompts/pi-agent-main.md` | Pi Agent 또는 코딩 에이전트 기본 지시문 |
| `.agentic/progress.json` | 현재 진행 단계 상태 |
| `.agentic/scripts/*.mjs` | STEP 확인, 진행 갱신, 검증 실행 스크립트 |

---

## 2. 압축 해제 후 바로 확인하기

압축 파일을 원하는 디렉토리에 풉니다.

```bash
mkdir my-agentic-todo
cd my-agentic-todo
unzip agentic-implementation-kit-git.zip
cd agentic-implementation-kit
```

이 ZIP은 Git 저장소 형태로 구성되어 있습니다. 압축 해제 후 다음 명령으로 확인할 수 있습니다.

```bash
git status
```

정상이라면 초기 커밋이 포함된 저장소로 인식됩니다.

```bash
git log --oneline
```

---

## 3. 기존 프로젝트에 적용하는 방법

이미 `my-todo-app` 같은 프로젝트가 있다면 이 키트의 `.agentic` 디렉토리만 복사해서 사용하는 방식이 가장 단순합니다.

```bash
cd my-todo-app
cp -R ../agentic-implementation-kit/.agentic .
```

필요하면 README도 함께 복사합니다.

```bash
cp ../agentic-implementation-kit/START_HERE.md ./AGENTIC_START_HERE.md
cp ../agentic-implementation-kit/README.md ./AGENTIC_README.md
```

기존 프로젝트가 이미 Git 저장소라면, 이 키트의 `.git` 디렉토리는 복사하지 않는 것이 좋습니다.

```txt
기존 프로젝트에 적용할 때 복사할 것:
- .agentic/
- AGENTIC_README.md 선택
- AGENTIC_START_HERE.md 선택

복사하지 않을 것:
- .git/
```

---

## 4. 새 프로젝트를 이 저장소에서 시작하는 방법

이 키트를 기반으로 새 앱을 만들고 싶다면, 압축을 푼 디렉토리를 그대로 프로젝트 루트로 사용하면 됩니다.

```bash
cd agentic-implementation-kit
```

앱 개발 도구를 설치하거나 프로젝트를 초기화합니다.

예를 들어 Vite 기반 앱을 현재 디렉토리에 생성하려면 다음처럼 사용할 수 있습니다.

```bash
npm create vite@latest .
```

그 뒤 `.agentic` 디렉토리는 그대로 유지합니다.

```txt
agentic-implementation-kit/
  .agentic/
  src/
  package.json
  README.md
```

이미 이 키트에 `package.json`이 있으므로, 실제 프론트엔드 프로젝트를 현재 디렉토리에 생성할 때는 도구가 기존 파일 덮어쓰기를 요구할 수 있습니다. 이 경우 다음 중 하나를 선택합니다.

```txt
방법 A: 앱 프로젝트를 먼저 만든 뒤 .agentic만 복사한다.
방법 B: 이 저장소를 루트로 쓰고 package.json을 실제 앱 기준으로 병합한다.
```

처음에는 **방법 A**를 추천합니다.

---

## 5. 구현 시작 전 반드시 수정할 파일

실제 개발에 들어가기 전에 아래 파일을 프로젝트에 맞게 수정합니다.

### 5.1 스펙 수정

```txt
.agentic/docs/spec.md
```

좋은 스펙 예:

```txt
Todo title은 빈 문자열일 수 없다.
Todo title은 앞뒤 공백이 제거되어 저장된다.
completed 기본값은 false다.
저장소는 LocalStorage를 사용한다.
삭제 시 확인창은 사용하지 않는다.
```

나쁜 스펙 예:

```txt
사용하기 좋게 만든다.
나중에 확장성 있게 만든다.
적당히 깔끔하게 구현한다.
```

소형 LLM에게는 추상적인 표현보다 검증 가능한 문장이 좋습니다.

### 5.2 계약 수정

```txt
.agentic/contracts/interfaces.md
.agentic/contracts/function-signatures.md
```

여기에 타입, 인터페이스, 함수 시그니처를 먼저 고정합니다.

예:

```ts
export type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: number
  updatedAt: number
}
```

```ts
export function addTodo(todos: Todo[], title: string): Todo[] {
  throw new Error('Not implemented')
}
```

이렇게 하면 소형 LLM은 “무엇을 만들지”가 아니라 “정해진 계약의 내부를 어떻게 채울지”에만 집중할 수 있습니다.

### 5.3 STEP 수정

```txt
.agentic/steps/*.md
```

샘플 STEP은 Todo 앱 기준입니다. 실제 프로젝트에 맞게 수정하거나 추가합니다.

좋은 STEP은 다음 정보를 포함해야 합니다.

```txt
목표
읽기 파일
수정 가능 파일
수정 금지 파일
구현 조건
테스트 조건
검증 명령
완료 조건
```

---

## 6. Pi Agent 또는 소형 LLM에게 주는 지시문

Pi Agent나 다른 코딩 에이전트에 아래 파일 내용을 기본 지시문으로 제공합니다.

```txt
.agentic/prompts/pi-agent-main.md
```

시작 프롬프트 예시는 다음과 같습니다.

```txt
이 저장소에서 .agentic/prompts/pi-agent-main.md를 지침으로 따르세요.
progress.json의 currentStep만 처리하세요.
현재 STEP 파일에 지정된 읽기 파일과 수정 가능 파일만 사용하세요.
테스트를 작성하거나 확인한 뒤 구현하세요.
검증 명령이 통과하면 progress를 업데이트하고 다음 STEP으로 이동하세요.
실패하면 같은 STEP 안에서 최대 3회 수정 루프를 수행하세요.
```

핵심은 이 문장입니다.

```txt
전체 앱을 구현하지 말고, 현재 STEP만 통과시켜라.
```

---

## 7. STEP 실행 방법

현재 STEP을 확인합니다.

```bash
npm run agent:next
```

또는 직접 실행할 수 있습니다.

```bash
node .agentic/scripts/next-step.mjs
```

현재 STEP 파일이 출력되면, 에이전트는 해당 STEP의 범위만 처리합니다.

작업 후 검증을 실행합니다.

```bash
npm run agent:gate:step
```

또는 직접 실행합니다.

```bash
node .agentic/scripts/run-gate.mjs step
```

STEP이 성공하면 다음처럼 표시합니다.

```bash
npm run agent:pass
```

또는 직접 실행합니다.

```bash
node .agentic/scripts/mark-step.mjs pass
```

STEP이 실패하면 원인을 기록합니다.

```bash
node .agentic/scripts/mark-step.mjs fail "validateTodoTitle 테스트 실패"
```

수정 범위를 확인하려면 다음 명령을 사용합니다.

```bash
npm run agent:scope
```

---

## 8. 권장 자동 구현 루프

소형 LLM에게 다음 루프를 반복하도록 합니다.

```txt
1. progress.json을 읽는다.
2. 현재 STEP 파일을 읽는다.
3. 현재 STEP에서 허용한 파일만 확인한다.
4. 테스트를 작성하거나 기존 테스트를 확인한다.
5. 구현한다.
6. 검증 명령을 실행한다.
7. 실패하면 같은 STEP 안에서 수정한다.
8. 3회 실패하면 failure-report.md를 작성하고 멈춘다.
9. 성공하면 progress.json을 갱신한다.
10. 다음 STEP으로 이동한다.
```

이 흐름을 다이어그램으로 표현하면 다음과 같습니다.

```txt
progress 확인
  ↓
현재 STEP 읽기
  ↓
허용 파일만 수정
  ↓
테스트/검증 실행
  ↓
통과?
  ├─ 아니오 → 원인 분석 → 수정 → 검증 재실행
  └─ 예 → progress 갱신 → 다음 STEP
```

---

## 9. 구현 평가 기준

각 STEP은 최소한 다음 조건을 만족해야 합니다.

```txt
- 현재 STEP 테스트 통과
- 기존 테스트 깨짐 없음
- 타입 에러 없음
- 수정 가능 파일 외 변경 없음
- public API 변경 없음
- 스펙 밖 기능 추가 없음
```

최종 완료 기준은 다음과 같습니다.

```txt
- 전체 테스트 통과
- 타입 체크 통과
- 린트 통과
- 빌드 성공
- 핵심 사용자 시나리오 통과
- Preview 환경에서 기능 확인
```

---

## 10. Git 운영 방식

이 저장소는 Git 저장소로 초기화되어 있습니다.

현재 상태 확인:

```bash
git status
```

초기 커밋 확인:

```bash
git log --oneline
```

실제 프로젝트에 적용한 뒤에는 STEP 단위로 커밋하는 방식을 추천합니다.

```bash
git add .
git commit -m "step 003: validate empty todo title"
```

추천 커밋 단위:

```txt
1 STEP = 1 커밋
```

좋은 커밋 메시지 예:

```txt
step 005: implement createTodo
step 010: implement todo filtering
step 014: add TodoInput component
```

실패하거나 중단된 작업은 커밋하지 말고, 먼저 현재 변경 사항을 확인합니다.

```bash
git diff
npm run agent:scope
```

---

## 11. 기존 프로젝트에 Git 저장소로 연결하기

새 프로젝트에 이 키트를 복사한 뒤 Git을 시작하려면 다음처럼 합니다.

```bash
git init
git add .
git commit -m "init project with agentic implementation kit"
```

원격 저장소가 있다면 연결합니다.

```bash
git remote add origin <YOUR_REPOSITORY_URL>
git branch -M main
git push -u origin main
```

이때 `<YOUR_REPOSITORY_URL>`은 실제 GitHub, GitLab, Bitbucket 등의 저장소 URL로 바꿉니다.

---

## 12. 문제 발생 시

현재 STEP이 무엇인지 다시 확인합니다.

```bash
npm run agent:next
```

변경된 파일을 확인합니다.

```bash
git status --short
```

STEP 허용 범위를 벗어난 변경이 있는지 확인합니다.

```bash
npm run agent:scope
```

검증을 다시 실행합니다.

```bash
npm run agent:gate:full
```

3회 이상 같은 STEP에서 실패했다면 아래 파일에 실패 원인을 기록합니다.

```txt
.agentic/reports/failure-report.md
```

---

## 13. 가장 중요한 운영 원칙

```txt
현재 STEP 밖을 구현하지 않는다.
함수 시그니처를 바꾸지 않는다.
테스트 없이 완료 처리하지 않는다.
검증 실패 상태로 다음 STEP으로 넘어가지 않는다.
진행 상태는 progress.json에 남긴다.
```

한 줄로 요약하면 다음과 같습니다.

```txt
소형 LLM은 전체 개발자가 아니라, 테스트와 계약으로 통제되는 STEP 실행자로 사용한다.
```
