# STEP 029 — 접근성 위반 보고서

## 발견된 위반 (axe-core 4.9)

### 위반 1: `label` — Form elements must have labels

| 항목 | 내용 |
|---|---|
| **룰** | `label` (Form elements must have labels) |
| **영향 요소** | `li > input[type="checkbox"]` (TodoItem 내 체크박스, 3개) |
| **원인** | `<input type="checkbox">`에 연결된 `<label>` 또는 `aria-label` 없음 |
| **수정 파일** | `src/components/TodoItem.tsx` |
| **수정 내용** | 체크박스에 `aria-label={\`완료: ${todo.title}\`}` 추가 |
| **추가 수정** | 편집 모드 input에도 `aria-label="제목 수정"` 추가 |

## 최종 결과
- 위반 0건 → axe violations 0건으로 해결
- 기존 테스트 113개 모두 통과 (회귀 없음)
- 게이트 8단계 전체 통과
