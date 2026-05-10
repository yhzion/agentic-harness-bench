# START HERE

이 키트는 Pi Coding Agent를 명령형으로 실행하기 위한 STEP 기반 자동 구현 템플릿입니다.

핵심 방식:

```txt
Shell Script가 STEP 진행을 관리한다.
Pi는 현재 STEP 구현만 한다.
```

## 1. Pi 설치 확인

```bash
pi --version
```

설치되어 있지 않다면:

```bash
npm install -g @earendil-works/pi-coding-agent
```

또는:

```bash
curl -fsSL https://pi.dev/install.sh | sh
```

## 2. 현재 STEP 확인

```bash
npm run agent:current
```

상세 내용 확인:

```bash
npm run agent:next
```

## 3. 명령형 자동 루프 실행

```bash
npm run agent:run:pi
```

## 4. 더 엄격한 검증으로 실행

```bash
npm run agent:run:pi:full
```

## 5. 실패 시 확인

```bash
cat .agentic/reports/failure-report.md
cat .agentic/progress.json
git diff
```

## 6. 점수 산출 및 리더보드 갱신

```bash
MODEL_TAG=my-small-llm npm run agent:benchmark
```

## 7. 실제 프로젝트에 적용할 때

1. `.agentic/docs/spec.md`를 실제 스펙으로 수정합니다.
2. `.agentic/contracts/interfaces.md`를 실제 인터페이스로 수정합니다.
3. `.agentic/contracts/function-signatures.md`를 실제 함수 시그니처로 수정합니다.
4. `.agentic/steps/*.md`를 실제 STEP으로 나눕니다.
5. `npm run agent:run:pi`를 실행합니다.
