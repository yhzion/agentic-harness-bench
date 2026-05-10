# 시작 방법

## 1. 프로젝트 루트에 압축 해제

예를 들어 `my-todo-app` 프로젝트가 있다면 다음처럼 풉니다.

```bash
cd my-todo-app
unzip agentic-implementation-kit.zip
```

압축을 풀면 프로젝트 안에 `.agentic` 디렉토리가 생깁니다.

```txt
my-todo-app/
  src/
  package.json
  .agentic/
```

## 2. 스펙 확정

먼저 아래 파일을 실제 프로젝트 기준으로 수정합니다.

```txt
.agentic/docs/spec.md
```

이미 개발 스펙이 있다면 기존 내용을 붙여넣고, 에이전트가 추론하지 않도록 명확히 씁니다.

좋은 스펙 예:

```txt
Todo title은 빈 문자열일 수 없다.
Todo title은 앞뒤 공백이 제거되어 저장된다.
completed 기본값은 false다.
저장소는 LocalStorage를 사용한다.
```

나쁜 스펙 예:

```txt
사용하기 좋게 알아서 구현한다.
나중에 확장 가능하게 만든다.
```

## 3. 계약 먼저 작성

다음 파일에 타입, 인터페이스, 함수 시그니처를 먼저 고정합니다.

```txt
.agentic/contracts/function-signatures.md
.agentic/contracts/interfaces.md
```

그리고 실제 코드에도 stub을 만들어 둡니다.

```ts
export function addTodo(todos: Todo[], title: string): Todo[] {
  throw new Error('Not implemented')
}
```

## 4. STEP 조정

샘플 STEP은 Todo 앱 기준입니다. 실제 앱에 맞게 `.agentic/steps`의 파일을 수정하거나 추가하세요.

각 STEP은 반드시 다음 정보를 가져야 합니다.

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

## 5. Pi Agent에 줄 지시문

Pi Agent 또는 사용하는 코딩 에이전트에 아래 파일 내용을 기본 지시문으로 넣습니다.

```txt
.agentic/prompts/pi-agent-main.md
```

에이전트에게는 이렇게 시작시키면 됩니다.

```txt
이 저장소에서 .agentic/prompts/pi-agent-main.md를 지침으로 따르세요.
progress.json의 currentStep만 처리하세요.
현재 STEP이 통과하면 progress를 업데이트하고 다음 STEP으로 이동하세요.
```

## 6. 진행 상태 확인

현재 단계 확인:

```bash
node .agentic/scripts/next-step.mjs
```

단계 성공 처리:

```bash
node .agentic/scripts/mark-step.mjs pass
```

단계 실패 처리:

```bash
node .agentic/scripts/mark-step.mjs fail "원인 요약"
```

## 7. 검증 실행

프로젝트에 맞게 `.agentic/scripts/run-gate.mjs`를 수정하세요.
기본값은 다음 순서입니다.

```txt
npm test
npm run typecheck
npm run lint
npm run build
```

프로젝트에 해당 스크립트가 없으면 package.json에 추가하거나 run-gate.mjs에서 제외하세요.

## 8. 추천 구현 시작 순서

1. 스펙 문서 수정
2. 타입과 함수 시그니처 확정
3. 첫 STEP을 아주 작게 유지
4. 테스트 하나 작성
5. 구현 하나 수행
6. 검증 통과
7. progress 업데이트
8. 반복

핵심은 “한 번에 하나의 STEP만”입니다.
