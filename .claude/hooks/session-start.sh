#!/bin/bash
set -euo pipefail

# Authorship, so it does not depend on anyone remembering.
#
# The container's global identity is `Claude <noreply@anthropic.com>`; this
# repository's commits are the owner's. Setting it on the repository rather
# than globally leaves any other checkout alone. Idempotent by nature: git
# config overwrites.
git -C "$CLAUDE_PROJECT_DIR" config user.name "rembednarczyk"
git -C "$CLAUDE_PROJECT_DIR" config user.email "remuerte@gmail.com"

# The quality gates need the toolchain. `npm install` rather than `npm ci`
# so a warm container skips the work, and only when it is actually missing.
if [ ! -d "$CLAUDE_PROJECT_DIR/node_modules" ]; then
  npm install --prefix "$CLAUDE_PROJECT_DIR"
fi
