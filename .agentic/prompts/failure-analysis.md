# Failure Analysis Prompt

현재 STEP이 반복 실패했을 때만 사용한다.

## 분석할 것

```txt
실패한 명령
에러 메시지
수정한 파일
시도한 접근
스펙과 테스트의 충돌 여부
시그니처 변경 필요 여부
사람의 판단이 필요한 부분
```

## 출력 형식

```txt
# Failure Report

## Step

## Failed Command

## Error Summary

## Attempts

## Suspected Cause

## Human Decision Needed
```
