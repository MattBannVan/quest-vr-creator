#!/usr/bin/env bash
# Local mirror of the GitHub Actions validation gates for quest-vr-creator hooks + index.
# Enhanced for more intelligence: optional index.html cross-check, stricter size baselines for expanded + improved features (robust GLTF mesh, url-safe share), docs advisory.
# Now also detects placeholder text regressions.
# Run from skill dir or repo root after changes. Embodies less-errors + more-intelligence.
# Usage: ./scripts/validate-hooks.sh [hooks-dir] [index.html path]
set -euo pipefail

HOOKS_DIR="${1:-hooks}"
INDEX_HTML="${2:-index.html}"
if [ ! -d "$HOOKS_DIR" ]; then
  echo "❌ No hooks/ dir at $HOOKS_DIR"
  exit 1
fi

echo "🧠 Validating hooks syntax + size + feature presence (mirrors + extends deploy workflow)..."
expected=("error-mitigation-hook.js" "state-management-hook.js" "spawn-intelligence-hook.js" "tablet-ui-hook.js")
for e in "${expected[@]}"; do
  if [ ! -f "$HOOKS_DIR/$e" ]; then
    echo "❌ Missing required intelligence hook: $e"
    exit 1
  fi
done

for hook in "$HOOKS_DIR"/*.js; do
  echo "Checking $hook ..."
  node --check "$hook" || { echo "❌ Syntax fail: $hook"; exit 1; }
  size=$(wc -c < "$hook")
  if [ "$size" -lt 500 ]; then
    echo "❌ $hook too small ($size bytes) — possible placeholder"
    exit 1
  fi
  if grep -qE "PLACEHOLDER_WILL_BE_REPLACED|TODO_REPLACE|EMPTY_HOOK" "$hook" 2>/dev/null; then
    echo "❌ $hook contains placeholder text — intelligence regression"
    exit 1
  fi
  # Stricter baselines matching current expanded + improved feature set
  base=$(basename "$hook")
  if [ "$base" = "spawn-intelligence-hook.js" ] && [ "$size" -lt 5000 ]; then
    echo "⚠️ $hook smaller than expected for 5-primitives + materials ($size)"
  fi
  if [ "$base" = "state-management-hook.js" ] && [ "$size" -lt 18000 ]; then
    echo "⚠️ $hook smaller than expected for robust materials/persist/export/GLTF-mesh/share/adjust ($size)"
  fi
  if [ "$base" = "tablet-ui-hook.js" ] && [ "$size" -lt 14000 ]; then
    echo "⚠️ $hook smaller than expected for 5 tools + 13 actions + holographic ($size)"
  fi
  echo "✅ $hook OK ($size bytes)"
done

# Feature presence (non-blocking advisory but critical for intelligence)
echo "🧠 Feature intelligence scan (hooks)..."
CRITICAL_FEATS=("VRCreatorState" "safeExecute" "spawnIntelligentObject" "initTabletUI" "clearAllSpawned" "setSelectedColor" "setMaterialPreset" "saveSceneToStorage" "loadSceneFromStorage" "exportSceneJSON" "makeWristHolographic" "deleteSpawnedObject" "exportSceneGLTF" "shareSceneViaHash" "loadSceneFromHash" "toggleHolographic" "adjustMaterial" "applyMaterialToLast" "toBase64" "vrc=")
for feat in "${CRITICAL_FEATS[@]}"; do
  if grep -q "$feat" "$HOOKS_DIR"/*.js 2>/dev/null; then
    echo "✅ $feat present"
  else
    echo "⚠️ $feat not found in hooks — potential intelligence regression"
  fi
done

# Cross-check index.html if present (more intelligence, less desync errors)
if [ -f "$INDEX_HTML" ]; then
  echo "🧠 Cross-checking index.html references + boot intelligence..."
  for hookfile in "${expected[@]}"; do
    if grep -q "hooks/$hookfile" "$INDEX_HTML"; then
      echo "✅ index.html references hooks/$hookfile"
    else
      echo "⚠️ index.html missing script src for $hookfile — load order risk"
    fi
  done
  for feat in "initTabletUI" "makeWristHolographic" "spawnIntelligentObject" "safeExecute" "VRCreatorState" "stats" "exportSceneGLTF" "shareSceneViaHash" "toggleHolographic" "loadSceneFromHash" "model-loaded" "opacity = 0.55"; do
    if grep -q "$feat" "$INDEX_HTML"; then
      echo "✅ index.html uses $feat"
    else
      echo "⚠️ index.html may lack $feat reference"
    fi
  done
  # Extract and syntax-check inline script
  if command -v node >/dev/null 2>&1; then
    node -e '
      const fs = require("fs");
      const html = fs.readFileSync(process.argv[1], "utf8");
      const m = html.match(/<script>([\s\S]*?)<\/script>/);
      if (m && m[1]) {
        fs.writeFileSync("/tmp/vr-inline-check.js", m[1].trim());
        console.log("Inline script extracted, length:", m[1].trim().length);
      } else {
        console.log("No inline <script> found");
        process.exit(0);
      }
    ' "$INDEX_HTML"
    if [ -f /tmp/vr-inline-check.js ]; then
      if node --check /tmp/vr-inline-check.js; then
        echo "✅ Inline index.html script syntax PASSED"
      else
        echo "❌ Inline index.html script syntax FAILED"
        exit 1
      fi
    fi
  fi
else
  echo "ℹ️ No index.html at $INDEX_HTML — skipping cross-check (ok for pure skill hooks validation)"
fi

# Docs consistency advisory (reduce future desync errors)
if [ -f "TODO.md" ]; then
  echo "🧠 Docs advisory (TODO.md presence of overclaimed vs actual)..."
  if grep -q "Basic export of spawned objects as GLTF\|Scene share via URL hash\|Advanced material panel\|double-grip" TODO.md 2>/dev/null; then
    if ! grep -q "exportSceneGLTF\|loadSceneFromHash\|adjustMaterial\|toBase64\|vrc=" "$HOOKS_DIR"/*.js 2>/dev/null; then
      echo "⚠️ TODO.md mentions advanced features (GLTF/share/adjust) not present in hooks — docs desync risk. Correct TODO before claiming complete."
    fi
  fi
fi

echo "✅ All local validation gates passed. Ready for push / workflow. Intelligence + error-reduction maximized."
