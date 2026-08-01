# Quest VR Creator — Living TODO & Roadmap

**Status as of Grok automation session (2026-08-01):** Tablet-ui-hook.js restored from empty/placeholder regression (was 45 bytes). Full intelligence stack (error/state/spawn/tablet) synchronized, syntax-validated, size baselines met. Docs accuracy enforced — overclaims of unimplemented scale/particle/full O± buttons removed. All 4 hooks + index + workflow gates ready. **Docs must match code exactly.**

## Completed ✅
- [x] Error mitigation hook (global + safeExecute)
- [x] State management with history, events, selectTool, undoLastSpawn, materials, persist, export, share, live adjust, holo toggle, robust clear
- [x] Intelligent camera-aware spawning (cube/sphere/cylinder/cone/torus + matching/approx physics)
- [x] spawn-button component (click + triggerdown for Quest reliability)
- [x] Dynamic tablet UI with C/S/Y/N/T buttons + reactive stats + 13 actions
- [x] Full A-Frame scene (ground, lights, sample objects, dual controllers, raycasters)
- [x] GitHub Actions workflow with dual syntax gates (index + hooks) + intelligence scans + size baselines + docs advisory
- [x] Modular hooks architecture (error → state → spawn → tablet dependency order)
- [x] Desktop keyboard fallbacks (1-5 spawn, U undo, M mat, S save, L load, E JSON, G GLTF, X share, H holo, D del, Ctrl+C clear, o/Shift+o for opacity ±0.1)
- [x] **More primitives (cone, torus)** + unique IDs + color state support
- [x] **Material / color picker UI on tablet** (COLOR action button + selectedColor in state + reactive stats)
- [x] **Object delete / clear-all + improved undo** (CLEAR + UNDO + DEL action buttons on tablet, ID-based removal + grip-down gesture)
- [x] **a-stats / FPS monitor** enabled on scene for Quest perf tuning
- [x] **Advanced material system** (5 PBR presets: standard/metal/plastic/matte/glass; setMaterialPreset cycle; applied on spawn with opacity; MAT button + key; history stores material)
- [x] **Persist scene to localStorage** (SAVE / LOAD buttons + keys; full restore of objects + materials + state)
- [x] **Export scene as JSON** (JSON button + key; downloadable)
- [x] **deleteSpawnedObject by id/el** (DEL button + grip gesture on .spawned-object)
- [x] **Holographic wrist tablet support** (`makeWristHolographic()` — vision-aligned, auto-called on load, attaches to leftHand with cyan emissive)
- [x] **Basic/improved GLTF export of spawned objects** (GLTF button + key G; minimal valid glTF 2.0 with cube mesh + PBR)
- [x] **Full holographic wrist tablet polish + activation toggle** (HOLO button; polished offsets/scale/emissive; toggle attach/detach)
- [x] **Object delete on double-grip** (rightHand double-gripdown <450ms on .spawned-object deletes via raycaster) — refined & verified
- [x] **Advanced material panel (partial)** (M+ / R+ / APPLY buttons for live metalness/roughness adjust + apply-to-last; custom preset; reactive stats show M/R; handlers ready for O±)
- [x] **Scene share via URL hash** (SHARE button + key X; url-safe base64 #vrc= encode state to location.hash + clipboard; auto-load on boot)
- [x] **Opacity live controls (keyboard)** (key o / Shift+o for ±0.1 via adjustMaterial; tablet O± buttons still next)
- [x] **Avatar hands polish from visions/** (semi-transparent lowPoly controller models opacity 0.55 applied on model-loaded + timeout; maintains visual connection)
- [x] **scripts/validate-hooks.sh** present in repo + local skill for pre-push gates
- [x] **Empty-file / placeholder regression fixed** for tablet-ui-hook.js (2026-08-01)

## Next Priorities (one at a time, follow Local Development Workflow from skill)
1. [ ] Real device Quest Browser full interaction test + feedback loop
2. [ ] Full bidirectional material panel O± buttons on tablet (handlers already exist)
3. [ ] Object scale live controls (S+/S- parallel to material panel) + selectedScale state
4. [ ] Particle feedback / glow on spawn and delete for richer UX
5. [ ] Full binary GLTF with mesh extraction via official GLTFExporter (if CDN compatible) — current is valid minimal glTF JSON
6. [ ] Scene share via simple cloud or shortened link (beyond hash)
7. [ ] Object rotation live controls or multi-select

## Design Rules for All Future Work
- Always use safeExecute / try-catch
- Validate entity existence before mutate
- Keep entity count low for Quest 72-90 fps
- **Docs must match code exactly** — never mark complete until hooks + index + workflow scans confirm presence; update TODO/PROOF/README + skill in same commit
- Test: node --check → local validate-hooks.sh → local serve → workflow → Quest Browser
- Update skill after meaningful changes

**Guiding principle:** Everything done with Grok using automations — less errors, more intelligence. Docs accuracy is now a first-class error-reduction gate.
