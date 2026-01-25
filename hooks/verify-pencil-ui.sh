#!/bin/bash
# Pencil.dev UI Verification Hook
# Checks if Pencil MCP is available for UI-related tasks
# Returns warning (non-blocking) if Pencil is not running

set -e

# Read input from stdin (APL hook context)
INPUT=$(cat)

# Extract task description and files
TASK_DESC=$(echo "$INPUT" | jq -r '.context.task_description // .context.description // ""' 2>/dev/null || echo "")
FILES=$(echo "$INPUT" | jq -r '.context.files_modified[]? // empty' 2>/dev/null || echo "")

# UI-related keywords to check for
UI_KEYWORDS="component|ui|button|card|header|footer|layout|design|nav|menu|modal|form|input|page|view|style|css|tailwind"

# Check if this is a UI-related task
if echo "$TASK_DESC $FILES" | grep -qiE "$UI_KEYWORDS"; then
  # This is a UI task - check if Pencil MCP is available

  # Try to detect Pencil MCP availability
  # Pencil auto-installs MCP when the app is running
  PENCIL_AVAILABLE=false

  # Check if claude mcp command shows pencil tools
  if command -v claude &> /dev/null; then
    if claude mcp 2>/dev/null | grep -qi "pencil"; then
      PENCIL_AVAILABLE=true
    fi
  fi

  # Alternative: check if Pencil process is running
  if pgrep -x "Pencil" > /dev/null 2>&1 || pgrep -f "pencil" > /dev/null 2>&1; then
    PENCIL_AVAILABLE=true
  fi

  if [ "$PENCIL_AVAILABLE" = true ]; then
    echo '{"status": "success", "message": "UI task detected - Pencil MCP available for visual verification", "data": {"pencil_available": true, "task_type": "ui"}}'
  else
    echo '{"status": "warning", "message": "UI task detected but Pencil MCP not available. Launch Pencil desktop app for visual verification of UI components.", "block_workflow": false, "data": {"pencil_available": false, "task_type": "ui", "recommendation": "Launch Pencil app before working on UI tasks"}}'
  fi
else
  # Not a UI task - skip Pencil verification
  echo '{"status": "success", "message": "Non-UI task - Pencil verification not required", "data": {"pencil_available": null, "task_type": "non-ui"}}'
fi
