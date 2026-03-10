#!/bin/bash
# Copy mock data to data/ directory for demo purposes
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_DIR/data"

mkdir -p "$DATA_DIR/timelog" "$DATA_DIR/finance" "$DATA_DIR/activity" "$DATA_DIR/finance/images"

cp "$SCRIPT_DIR/projects.json" "$DATA_DIR/projects.json"
cp "$SCRIPT_DIR/timelog/2026-03.json" "$DATA_DIR/timelog/2026-03.json"
cp "$SCRIPT_DIR/finance/2026-03.json" "$DATA_DIR/finance/2026-03.json"
cp "$SCRIPT_DIR/activity/2026-03-10.json" "$DATA_DIR/activity/2026-03-10.json"

echo "✅ Mock data copied to data/ directory"
