# 아키텍처 기준

## 기본 의존성 방향

```txt
components
  ↓
store 또는 hooks
  ↓
domain
  ↓
types

store 또는 hooks
  ↓
storage
  ↓
types
```

## 레이어 역할

### types

```txt
앱 전체에서 공유되는 타입만 정의한다.
구현 로직을 포함하지 않는다.
컴포넌트를 import하지 않는다.
```

### domain

```txt
Todo 생성, 변경, 삭제, 필터링 같은 순수 로직을 담당한다.
UI 프레임워크를 import하지 않는다.
LocalStorage나 API를 직접 사용하지 않는다.
가능하면 순수 함수로 작성한다.
```

### storage

```txt
LocalStorage 또는 외부 저장소 접근을 담당한다.
도메인 규칙을 직접 판단하지 않는다.
직렬화, 역직렬화, 저장, 로드, 삭제만 담당한다.
```

### store 또는 hooks

```txt
상태를 보관한다.
domain 함수와 storage 함수를 연결한다.
UI 이벤트가 호출할 action을 제공한다.
```

### components

```txt
화면 렌더링과 사용자 이벤트 전달만 담당한다.
복잡한 도메인 규칙을 직접 구현하지 않는다.
```

## 파일 크기 기준

```txt
파일은 가능하면 300줄 이하를 유지한다.
함수는 가능하면 20줄 이하를 유지한다.
함수 인자는 가능하면 3개 이하를 유지한다.
```
