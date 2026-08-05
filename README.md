# Quest VR Creator

**A-Frame immersive VR object creation experience for Meta Quest 3** — physics, super-hands, materials, persistence, export, holographic wrist tablet. Built entirely with Grok automations.

**Live:** [GitHub Pages](https://mattbannvan.github.io/quest-vr-creator/) (after deploy)

## Features (production, docs-synced 2026-08-05)

- **5 primitives**: cube / sphere / cylinder / cone / torus with matching or approx physics
- **Intelligent spawn**: camera-aware THREE.js forward placement, unique IDs, color + full PBR material (metalness/roughness/opacity)
- **Material system**: 5 presets (standard/metal/plastic/matte/glass) + live bidirectional M± R± O± adjust + APPLY
- **State & history**: undo, clear-all, delete by id/el, reactive `vr-state-changed` events
- **Persistence**: localStorage SAVE/LOAD, JSON export, minimal valid glTF 2.0 export, URL-hash share + auto-load
- **Tablet UI**: 5-row holographic-capable 3D tablet (tools + 13+ actions) with reactive stats (color + M/R/O)
- **Holographic wrist**: `makeWristHolographic()` attaches cyan-emissive tablet to leftHand
- **Gestures**: grip-down + double-grip (<450ms) delete on rightHand; keyboard fallbacks (1-5, U, M, S, L, E, G, X, H, D, o/Shift+o, Ctrl+C)
- **Error mitigation**: global + `safeExecute` wrappers, non-blocking emoji logs
- **Quest optimized**: low entity count, stats FPS monitor, 72-90 fps target

## Architecture (hooks — dependency order critical)

```
hooks/
  error-mitigation-hook.js   # safeExecute + global handlers
  state-management-hook.js   # VRCreatorState + all actions (persist/export/share/adjust/delete/holo)
  spawn-intelligence-hook.js # spawnIntelligentObject + spawn-button component
  tablet-ui-hook.js          # initTabletUI + makeWristHolographic + dynamic buttons
```

`index.html` loads them in order, boots tablet + holo + hash restore, wires keyboard + grip.

## Local Development Workflow (use every time)

1. **Analyze** — tree, key files, skill, TODO
2. **Plan** — one feature, Quest perf, error hooks
3. **Implement** — prefer hooks, safeExecute, modular
4. **Test** — `node --check`, `./scripts/validate-hooks.sh hooks/ index.html`, local serve, workflow, Quest Browser
5. **Automate** — push, update README/TODO/skill, docs must match code exactly
6. **Reflect** — harden validation gates further

## Validation Gates

- **Local**: `scripts/validate-hooks.sh` (syntax + size + features + index cross-check + docs overclaim advisory)
- **CI**: `.github/workflows/deploy-to-pages.yml` — hard-fails on syntax, placeholders, missing critical features (incl. O±), empty files, docs overclaims of unimplemented scale/rot/particle

## Next Priorities (see TODO.md)

1. Real Quest Browser full interaction test + feedback
2. Object scale live controls
3. Object rotation live controls
4. Particle / glow feedback on spawn & delete
5. Full binary GLTF via GLTFExporter (if CDN ok)
6. Cloud / short-link share

## Design Rules

- Always `safeExecute` / try-catch; validate entities
- Keep entity count low for Quest
- **Docs must match code exactly** — never mark complete until hooks + index + workflow confirm
- Everything done with Grok using automations — less errors, more intelligence

## License / Credits

Open for Meta Quest VR creation. Powered by A-Frame, aframe-physics-system, super-hands, event-set-component. Skill-driven development by Grok.
