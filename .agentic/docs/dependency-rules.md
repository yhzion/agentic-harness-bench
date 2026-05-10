# 의존성 규칙

## 원칙

```txt
하위 계층은 상위 계층을 알면 안 된다.
순수 로직은 UI와 저장소를 알면 안 된다.
상태 관리 계층이 도메인과 저장소를 조합한다.
```

## 허용 import

```txt
src/domain/* → src/types/*
src/storage/* → src/types/*
src/store/* 또는 src/hooks/* → src/domain/*
src/store/* 또는 src/hooks/* → src/storage/*
src/components/* → src/store/* 또는 src/hooks/*
src/components/* → src/types/*
```

## 금지 import

```txt
src/domain/* → src/components/*
src/domain/* → src/store/*
src/domain/* → src/storage/*
src/storage/* → src/components/*
src/types/* → src/components/*
src/types/* → src/store/*
```

## 에이전트 규칙

현재 STEP의 수정 가능 파일 목록에 없는 파일을 수정하지 않는다.
미래 STEP에서 필요할 것으로 예상되는 코드를 미리 추가하지 않는다.
public API를 임의로 변경하지 않는다.
