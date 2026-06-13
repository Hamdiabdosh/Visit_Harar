#!/usr/bin/env bash
# Resolve Flutter from PATH or the default install location (see apps/flutter/README.md).
set -euo pipefail

if command -v flutter >/dev/null 2>&1; then
  FLUTTER=(flutter)
elif [[ -x "${HOME}/flutter/bin/flutter" ]]; then
  FLUTTER=("${HOME}/flutter/bin/flutter")
else
  echo "Flutter not found. Install it or add ~/flutter/bin to PATH:" >&2
  echo "  export PATH=\"\$HOME/flutter/bin:\$PATH\"" >&2
  echo "  source ~/.zshrc" >&2
  exit 127
fi

exec "${FLUTTER[@]}" "$@"
