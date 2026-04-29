#!/usr/bin/env bash
# Invoke Devin CLI in non-interactive mode with a pre-built context file.
# Usage: ./scripts/ask-expert.sh <task-id> [extra-prompt]
#
# The context file .virtual-context/<task-id>.md must already exist
# (written by the ask-expert Windsurf workflow before this script runs).

set -euo pipefail

TASK_ID="${1:?Usage: ask-expert.sh <task-id> [extra-prompt]}"
CONTEXT_FILE=".virtual-context/${TASK_ID}.md"

# Guarantee the directory exists (gitignored, so absent on fresh clones).
mkdir -p .virtual-context

if [[ ! -f "$CONTEXT_FILE" ]]; then
  echo "Error: context file not found: $CONTEXT_FILE" >&2
  exit 1
fi

# Optional inline suffix appended after the file prompt.
EXTRA_PROMPT="${2:-}"

echo "=== ask-expert: task=${TASK_ID} ===" >&2
echo "Context: ${CONTEXT_FILE}" >&2
echo "" >&2

CMD=(devin --prompt-file "$CONTEXT_FILE")
[[ -n "$EXTRA_PROMPT" ]] && CMD+=(-p "$EXTRA_PROMPT")
"${CMD[@]}"

EXIT_CODE=$?

echo "" >&2
echo "=== ask-expert done (exit ${EXIT_CODE}) ===" >&2
exit $EXIT_CODE
