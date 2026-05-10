#!/usr/bin/env bash
set -euo pipefail

MAX_RETRY="${MAX_RETRY:-3}"
GATE_MODE="${GATE_MODE:-step}"
PI_BIN="${PI_BIN:-pi}"
PI_MODE="${PI_MODE:-json}"
AUTO_COMMIT="${AUTO_COMMIT:-0}"
PROMPT_TEMPLATE=".agentic/prompts/pi-step-implementer.md"

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

run_pi_for_step() {
  local step_file="$1"
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
  } > "$prompt_file"

  echo "[agentic] invoking Pi: $PI_BIN --mode $PI_MODE <prompt>"
  "$PI_BIN" --mode "$PI_MODE" "$(cat "$prompt_file")"
  local status="$?"
  rm -f "$prompt_file"
  return "$status"
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
  git commit -m "Complete $step_file"
}

while true; do
  STEP_FILE="$(node .agentic/scripts/current-step-file.mjs)"

  if [ "$STEP_FILE" = "DONE" ]; then
    echo "[agentic] all steps completed."
    node .agentic/scripts/progress-summary.mjs
    exit 0
  fi

  echo "[agentic] current step: $STEP_FILE"
  attempt=1

  while [ "$attempt" -le "$MAX_RETRY" ]; do
    echo "[agentic] attempt $attempt/$MAX_RETRY"

    if ! run_pi_for_step "$STEP_FILE"; then
      echo "[agentic] Pi command failed for $STEP_FILE"
      node .agentic/scripts/mark-step.mjs fail "Pi command failed for $STEP_FILE"
    else
      echo "[agentic] running gate: npm run agent:gate:$GATE_MODE"
      if npm run "agent:gate:$GATE_MODE"; then
        echo "[agentic] gate passed for $STEP_FILE"
        npm run agent:scope || true
        node .agentic/scripts/mark-step.mjs pass
        commit_step_if_enabled "$STEP_FILE"
        break
      fi

      echo "[agentic] gate failed for $STEP_FILE"
      node .agentic/scripts/mark-step.mjs fail "Gate failed for $STEP_FILE on attempt $attempt"
    fi

    if [ "$attempt" -ge "$MAX_RETRY" ]; then
      echo "[agentic] max retries reached for $STEP_FILE"
      node .agentic/scripts/write-failure-report.mjs "$STEP_FILE" "Max retries reached."
      exit 1
    fi

    attempt=$((attempt + 1))
    echo "[agentic] retrying same step..."
  done
done
