# Benchmark Leaderboard

- Rubric version: `1.0.0`
- Rubric sha256: `f27b5b9df8a5145cddd9479bae581172e6e6610d053f62d4bccf2099f9544298`
- Runs included: 1
- Generated: 2026-05-11T06:50:45.551Z

All scores are produced by deterministic tools only. No LLM-as-judge.

## Total ranking

| Rank | Model tag | Final | Correct | Robust | Quality | Efficiency | Discipline |
|---:|:---|---:|---:|---:|---:|---:|---:|
| 1 | `qwen/qwen3.6-27b` | **93.7** | 100.0% | 100.0% | 100.0% | 71.9% | 65.0% |

## Axis breakdown — raw values

### `qwen/qwen3.6-27b`

- Final: **93.7 / 100**
- correctness.step_pass_rate: **37/37** (100.0%)
- robustness.e2e_happy: **19/4** (100.0%)
- robustness.e2e_edge: **31/12** (100.0%)
- quality.eslint_violations: 0 (cap 50)
- quality.tsc_errors: 0 (cap 30)
- quality.design_token_violations: 0 (cap 20)
- quality.a11y_violations: 0 (cap 10)
- efficiency.first_pass_rate: 89.2%
- efficiency.avg_retries: 0.27
- efficiency.wall_time: 8787s
- discipline.scope_violations: 14
- discipline.signature_violations: 0

## Token efficiency

| Rank | Model tag | Steps✓ | Wall(s) | In total | Out total | Out/step | Tok/s |
|---:|:---|---:|---:|---:|---:|---:|---:|
| 1 | `qwen/qwen3.6-27b` | 37 | 8787.2 | 30039494 | 442037 | 11947 | 50.3 |

## Per-step breakdown

### `qwen/qwen3.6-27b`

| # | Step | Attempts | Wall(s) | In | Out | Tok/s | Gate |
|---:|:---|---:|---:|---:|---:|---:|:---:|
| 1 | 001-scaffold-config | 1 | 31.9 | 28189 | 1327 | 41.6 | ✓ |
| 2 | 002-scaffold-entries | 1 | 24.6 | 36147 | 1187 | 48.4 | ✓ |
| 3 | 003-wire-strict-gate | 1 | 18.1 | 17483 | 548 | 30.3 | ✓ |
| 4 | 004-generate-tokens-css | 1 | 34.9 | 33238 | 1605 | 46.0 | ✓ |
| 5 | 005-define-todo-types | 1 | 28.8 | 36666 | 978 | 34.0 | ✓ |
| 6 | 006-validate-title-empty | 2 | 1224.2 | 4726136 | 63128 | 51.6 | ✓ |
| 7 | 007-validate-title-trim | 1 | 263.4 | 635061 | 14478 | 55.0 | ✓ |
| 8 | 008-validate-title-max-length | 1 | 17.2 | 12660 | 285 | 16.6 | ✓ |
| 9 | 009-create-todo | 1 | 35.6 | 39819 | 1517 | 42.6 | ✓ |
| 10 | 010-add-todo | 1 | 30.2 | 35061 | 1133 | 37.5 | ✓ |
| 11 | 011-toggle-todo | 1 | 29.9 | 36825 | 1085 | 36.3 | ✓ |
| 12 | 012-update-todo-title | 1 | 33.7 | 38050 | 1323 | 39.3 | ✓ |
| 13 | 013-remove-todo | 1 | 26.1 | 28294 | 924 | 35.4 | ✓ |
| 14 | 014-filter-todos | 1 | 25.4 | 28332 | 875 | 34.4 | ✓ |
| 15 | 015-serialize-todos | 1 | 23.5 | 27345 | 733 | 31.2 | ✓ |
| 16 | 016-deserialize-todos | 1 | 33.0 | 43009 | 1198 | 36.3 | ✓ |
| 17 | 017-load-save-todos | 7 | 3239.1 | 14190242 | 166915 | 51.5 | ✓ |
| 18 | 018-use-todos-hook | 1 | 51.8 | 74548 | 2237 | 43.2 | ✓ |
| 19 | 019-todo-input-logic | 1 | 80.7 | 154930 | 3472 | 43.0 | ✓ |
| 20 | 020-todo-input-style | 1 | 94.1 | 165933 | 4740 | 50.4 | ✓ |
| 21 | 021-todo-item-logic | 1 | 57.2 | 77128 | 2236 | 39.1 | ✓ |
| 22 | 022-todo-item-style | 1 | 104.3 | 316371 | 4850 | 46.5 | ✓ |
| 23 | 023-todo-list-logic | 1 | 39.3 | 32205 | 1499 | 38.2 | ✓ |
| 24 | 024-todo-list-style | 2 | 566.5 | 687505 | 33588 | 59.3 | ✓ |
| 25 | 025-todo-filter-logic | 1 | 46.2 | 68622 | 1484 | 32.1 | ✓ |
| 26 | 026-todo-filter-style | 2 | 245.8 | 643590 | 12546 | 51.0 | ✓ |
| 27 | 027-app-shell-logic | 1 | 81.4 | 195534 | 3825 | 47.0 | ✓ |
| 28 | 028-app-shell-style | 1 | 90.2 | 283707 | 4067 | 45.1 | ✓ |
| 29 | 029-a11y-final-check | 1 | 101.4 | 288632 | 4253 | 41.9 | ✓ |
| 30 | 030-preview-check | 1 | 41.1 | 51198 | 1264 | 30.8 | ✓ |
| 31 | 031-e2e-infra | 1 | 389.7 | 1241924 | 19732 | 50.6 | ✓ |
| 32 | 032-e2e-add | 1 | 29.1 | 13599 | 697 | 23.9 | ✓ |
| 33 | 033-e2e-add-validation | 1 | 40.1 | 26480 | 1423 | 35.5 | ✓ |
| 34 | 034-e2e-toggle-remove | 2 | 1347.9 | 5263697 | 70411 | 52.2 | ✓ |
| 35 | 035-e2e-edit | 1 | 170.8 | 406619 | 7109 | 41.6 | ✓ |
| 36 | 036-e2e-filter | 1 | 42.5 | 27363 | 1479 | 34.8 | ✓ |
| 37 | 037-e2e-persistence | 1 | 47.7 | 27352 | 1886 | 39.5 | ✓ |
