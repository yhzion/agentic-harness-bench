#!/usr/bin/env bash
set -euo pipefail

MAX_RETRY="${MAX_RETRY:-3}"
GATE_MODE="${GATE_MODE:-step}"
PI_BIN="${PI_BIN:-pi}"
PI_MODE="${PI_MODE:-json}"
AUTO_COMMIT="${AUTO_COMMIT:-0}"
LOG_LEVEL="${LOG_LEVEL:-normal}"
export LOG_LEVEL
PROMPT_TEMPLATE=".agentic/prompts/pi-step-implementer.md"
SCOPE_BASELINE=".agentic/scope-baseline.json"
RECOVERY_HINT=".agentic/reports/recovery-hint.md"
RECOVERY_PLAYBOOK=".agentic/contracts/recovery-playbook.md"

if [ ! -d ".agentic" ]; then
  echo "[agentic] .agentic directory not found. Run this from the project root."
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "[agentic] node is required."
  exit 1
fi

if ! command -v "$PI_BIN" >/dev/null 2>&1; then
  echo "[agentic] Pi command not found: $PI_BIN"
  echo "[agentic] Install Pi or set PI_BIN to the correct executable."
  exit 1
fi

if [ ! -f "$PROMPT_TEMPLATE" ]; then
  echo "[agentic] prompt template not found: $PROMPT_TEMPLATE"
  exit 1
fi

TOTAL_STEPS="$(find .agentic/steps -maxdepth 1 -name '*.md' | wc -l | tr -d ' ')"

node .agentic/scripts/init-progress.mjs
node .agentic/scripts/reset-runtime-stats.mjs

step_number_of() {
  local target_basename="$1"
  local n=0
  for f in $(ls .agentic/steps/*.md | sort); do
    n=$((n + 1))
    if [ "$(basename "$f" .md)" = "$target_basename" ]; then
      echo "$n"
      return 0
    fi
  done
  echo "0"
}

run_pi_for_step() {
  local step_file="$1"
  local step_num="$2"
  local attempt="$3"
  local prompt_file
  prompt_file="$(mktemp)"

  {
    cat "$PROMPT_TEMPLATE"
    echo ""
    echo "# Current STEP file"
    echo "$step_file"
    echo ""
    echo "# Current STEP content"
    cat "$step_file"
    if [ "$attempt" -gt 1 ] && [ -f "$RECOVERY_HINT" ]; then
      echo ""
      echo "# ⚠️ Previous attempt failed — Recovery Hint"
      echo ""
      echo "직전 시도가 gate 에서 실패했다. 아래 hint 와 \`$RECOVERY_PLAYBOOK\` 의 매크로 원칙을"
      echo "*반드시* 읽고 self_test_procedure 를 직접 실행한 뒤 수정하라. 같은 우회 시도는 다시 fail."
      echo ""
      cat "$RECOVERY_HINT"
    fi
  } > "$prompt_file"

  local step_name
  step_name="$(basename "$step_file" .md)"

  node .agentic/scripts/run-pi-step.mjs \
    --step-num "$step_num" \
    --total "$TOTAL_STEPS" \
    --step-name "$step_name" \
    --attempt "$attempt" \
    --max-retry "$MAX_RETRY" \
    --prompt-file "$prompt_file" \
    --pi-bin "$PI_BIN" \
    --pi-mode "$PI_MODE"
  local status=$?
  rm -f "$prompt_file"
  return $status
}

commit_step_if_enabled() {
  local step_file="$1"
  if [ "$AUTO_COMMIT" != "1" ]; then
    return 0
  fi

  if ! command -v git >/dev/null 2>&1; then
    echo "[agentic] AUTO_COMMIT=1 but git is not available. Skipping commit."
    return 0
  fi

  if git diff --quiet && git diff --cached --quiet; then
    echo "[agentic] no changes to commit."
    return 0
  fi

  git add -A
  git commit -m "Complete $(basename "$step_file" .md)"
}

while true; do
  STEP_FILE="$(node .agentic/scripts/current-step-file.mjs)"

  if [ "$STEP_FILE" = "DONE" ]; then
    echo ""
    echo "[agentic] all $TOTAL_STEPS steps completed."
    node .agentic/scripts/progress-summary.mjs
    exit 0
  fi

  STEP_BASENAME="$(basename "$STEP_FILE" .md)"
  STEP_NUM="$(step_number_of "$STEP_BASENAME")"
  PCT="$(awk -v n="$STEP_NUM" -v t="$TOTAL_STEPS" 'BEGIN{printf "%.1f", (n-1)/t*100}')"

  echo ""
  echo "╔══════════════════════════════════════════════════════════════════╗"
  printf "║ STEP %02d/%-2d  %5.1f%%  %-44s ║\n" "$STEP_NUM" "$TOTAL_STEPS" "$PCT" "$STEP_BASENAME"
  echo "║ model: ${PI_MODEL:-(auto)}   gate: $GATE_MODE   log: $LOG_LEVEL                       ║"
  echo "╚══════════════════════════════════════════════════════════════════╝"

  node .agentic/scripts/check-step-scope.mjs --write-baseline "$SCOPE_BASELINE"
  rm -f "$RECOVERY_HINT"

  attempt=1
  while [ "$attempt" -le "$MAX_RETRY" ]; do
    if ! run_pi_for_step "$STEP_FILE" "$STEP_NUM" "$attempt"; then
      echo "[agentic] Pi failed for $STEP_BASENAME (attempt $attempt/$MAX_RETRY)"
      node .agentic/scripts/mark-step.mjs fail "Pi failed on attempt $attempt"
    else
      echo "[agentic] running gate: $GATE_MODE"
      if npm run "agent:gate:$GATE_MODE" --silent; then
        echo "[agentic] ✓ gate passed for $STEP_BASENAME"
        node .agentic/scripts/mark-step.mjs pass
        echo "╚══ STEP $STEP_NUM ✓ PASS  $STEP_BASENAME ══════════════════════════════╝"
        commit_step_if_enabled "$STEP_FILE"
        break
      fi
      echo "[agentic] ✗ gate failed for $STEP_BASENAME (attempt $attempt/$MAX_RETRY)"
      node .agentic/scripts/mark-step.mjs fail "Gate failed on attempt $attempt"
    fi

    if [ "$attempt" -ge "$MAX_RETRY" ]; then
      echo "[agentic] max retries reached for $STEP_BASENAME"
      echo "╚══ STEP $STEP_NUM ✗ FAIL  $STEP_BASENAME ══════════════════════════════╝"
      node .agentic/scripts/write-failure-report.mjs "$STEP_FILE" "Max retries reached."
      exit 1
    fi

    attempt=$((attempt + 1))
    echo "[agentic] retrying $STEP_BASENAME ($attempt/$MAX_RETRY)..."
  done
done
