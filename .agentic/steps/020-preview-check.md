# STEP 020. Preview 확인

## 목표

사용자에게 전달 가능한 Preview 상태를 확인한다.

## 읽기 파일

- package.json
- 배포 또는 Preview 설정 파일

## 수정 가능 파일

- Preview 설정 관련 파일
- README.md

## 구현 조건

- Preview 빌드를 실행한다.
- Preview 환경에서 핵심 시나리오를 확인한다.
- Preview URL을 기록한다.

## 테스트 조건

- Preview 환경에서 앱이 열린다.
- Todo 추가/완료/삭제/필터가 동작한다.

## 검증 명령

```bash
npm run build
```

## 완료 조건

- Preview URL 확인
- 사용자 전달 준비 완료
