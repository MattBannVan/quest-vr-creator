# Quest VR Creator

**A-Frame immersive VR object creation experience for Meta Quest 3**  
Hosted on GitHub Pages · Built & hardened with Grok automations

[Live Demo (GitHub Pages)](https://mattbannvan.github.io/quest-vr-creator/) · Everything done with Grok using automations

## Architecture (Intelligence Layer)

| Layer | File | Role |
|-------|------|------|
| Error mitigation | `hooks/error-mitigation-hook.js` | Global error + unhandledrejection listeners, `safeExecute()` wrapper |
| State | `hooks/state-management-hook.js` | `VRCreatorState`, materials, history, undo/clear/delete, localStorage, JSON/GLTF export (full mesh), URL-safe hash share, live material adjust, holo toggle |
| Spawn | `hooks/spawn-intelligence-hook.js` | Camera-aware placement (THREE.js), 5 primitives + physics, color + PBR material, unique IDs, `spawn-button` component |
| Tablet UI | `hooks/tablet-ui-hook.js` | Dynamic 5-tool + 13-action holographic tablet, reactive stats, `makeWristHolographic()`, `initTabletUI()` |
| Scene | `index.html` | A-Frame 1.6 + physics + super-hands + dual controllers + keyboard + grip-delete + double-grip + boot + avatar hands polish |
| Local gates | `scripts/validate-hooks.sh` | Pre-push mirror of CI (syntax/size/features/docs) |

**Load order is critical:** error → state → spawn → tablet.

## Features (Production-Ready)

- **5 primitives**: cube, sphere, cylinder, cone, torus (camera-forward spawn, ground-safe Y)
- **Materials**: 5 PBR presets (standard / metal / plastic / matte / glass) + live metalness/roughness/opacity adjust (M+/R+/O via keys + APPLY) + opacity for glass
- **Color**: selectedColor state + random palette + reactive tablet stats
- **History & undo**: unique object IDs, `undoLastSpawn()`, `clearAllSpawned()` (DOM-robust), `deleteSpawnedObject(idOrEl)`
- **Persistence**: `saveSceneToStorage()` / `loadSceneFromStorage()` (localStorage)
- **Export**: JSON download + improved minimal valid glTF 2.0 (with actual cube mesh data + PBR)
- **Share**: URL-safe base64 `#vrc=` hash encode + clipboard/prompt + auto-load on boot (`shareSceneViaHash` / `loadSceneFromHash`)
- **Holographic wrist tablet**: `makeWristHolographic()` + `toggleHolographic()` (HOLO button) — cyan emissive, vision-aligned
- **Gestures**: grip-down delete + double-grip (<450 ms) on right controller raycast / super-hands
- **Desktop fallbacks**: 1-5 spawn, U undo, M mat, S save, L load, E JSON, G GLTF, X share, H holo, D del, Ctrl+C clear, o/Shift+o opacity
- **Perf**: `stats` component, simple geometries, low entity count, Quest 72-90 fps target
- **Avatar hands polish**: semi-transparent lowPoly controllers (opacity 0.55)

## Tablet Layout (4 consistent rows)

1. **Tools**: C / S / Y / N / T (cube sphere cylinder cone torus)
2. **Core actions**: UNDO / CLEAR / COLOR / MAT
3. **Persist & export**: SAVE / LOAD / JSON / GLTF / DEL
4. **Advanced**: SHARE / HOLO / M+ / R+ / APPLY

## Local Development Workflow (Zero Untested Code)

1. **Analyze** — tree + file contents + skill + TODO
2. **Plan** — one feature, modular, Quest-safe, error-wrapped
3. **Implement** — edit hooks first, keep safeExecute + validation
4. **Test** (mandatory):
   - `node --check hooks/*.js` + extract inline from index
   - `./scripts/validate-hooks.sh hooks/ index.html` (now in repo)
   - Local serve + keyboard/mouse
   - Push → GitHub Actions (syntax + size ≥18kB state + feature scan incl. toBase64/vrc= + docs advisory + Pages)
   - Quest Browser interaction test
5. **Correct immediately** on any failure
6. **Sync skill** + update TODO / PROOF / README / SKILL.md

## Validation Gates (CI + Local)

The deploy workflow **fails** on:
- Any JS syntax error (index inline or any hook)
- Empty / undersized hooks (state ≥18 kB, tablet ≥14 kB, spawn ≥5 kB)
- Missing critical feature symbols (incl. improved GLTF/share)
- Wrong hook load order
- Empty critical files

Local mirror: `scripts/validate-hooks.sh` — run before every push.

## Docs Accuracy Rule

**Never mark a feature complete in TODO/PROOF/README until the symbol exists in hooks + index + workflow scan passes.**  
Docs desync is treated as a first-class error source.

## Next Priorities

See `TODO.md`. Current focus: real-device Quest Browser feedback loop, full bidirectional material panel (O± buttons), full binary GLTFExporter (if CDN-compatible).

---

**Guiding principle:** Everything done with Grok using automations — less errors, more intelligence.
