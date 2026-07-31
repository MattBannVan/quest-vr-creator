# Quest VR Creator — Living TODO & Roadmap

**Status as of Grok automation session (2026-07-31):** Core intelligence layer fully restored and production-hardened. State-management-hook improved (robust DOM clear, full-mesh GLTF, url-safe #vrc= share, try-catch updateVRState). scripts/validate-hooks.sh added to repo. Workflow size/feature scans tightened. Avatar hands polish + opacity keyboard controls present. All 4 hooks integrated and syntax-validated (node --check zero errors), index.html complete with physics + super-hands + multi-tool reactive tablet (5 primitives + materials + persist + export JSON/GLTF + delete + holographic wrist + toggle + live adjust M/R via tablet + O via keys + URL hash share + double-grip), workflow validates syntax + size + feature presence. **Docs accuracy enforced as first-class rule.**

## Completed ✅
- [x] Error mitigation hook (global + safeExecute)
- [x] State management with history, events, selectTool, undoLastSpawn
- [x] Intelligent camera-aware spawning (cube/sphere/cylinder/cone/torus + matching/approx physics)
- [x] spawn-button component (click + triggerdown for Quest reliability)
- [x] Dynamic tablet UI with C/S/Y/N/T buttons + reactive stats
- [x] Full A-Frame scene (ground, lights, sample objects, dual controllers, raycasters)
- [x] GitHub Actions workflow with dual syntax gates (index + hooks) + intelligence scans + size baselines
- [x] Modular hooks architecture (error → state → spawn → tablet dependency order)
- [x] Desktop keyboard fallbacks (1-5 spawn, U undo, M mat, S save, L load, E JSON, G GLTF, X share, H holo, D del, Ctrl+C clear, o/Shift+o for opacity ±0.1)
- [x] **More primitives (cone, torus)** + unique IDs + color state support
- [x] **Material / color picker UI on tablet** (COLOR action button + selectedColor in state + reactive stats)
- [x] **Object delete / clear-all + improved undo** (CLEAR + UNDO + DEL action buttons on tablet, ID-based removal + grip-down gesture; clear now DOM-robust)
- [x] **a-stats / FPS monitor** enabled on scene for Quest perf tuning
- [x] **Advanced material system** (5 PBR presets: standard/metal/plastic/matte/glass; setMaterialPreset cycle; applied on spawn with opacity; MAT button + key; history stores material)
- [x] **Persist scene to localStorage** (SAVE / LOAD buttons + keys; full restore of objects + materials + state)
- [x] **Export scene as JSON** (JSON button + key; downloadable)
- [x] **deleteSpawnedObject by id/el** (DEL button + grip gesture on .spawned-object)
- [x] **Holographic wrist tablet support** (`makeWristHolographic()` — vision-aligned, auto-called on load, attaches to leftHand with cyan emissive)
- [x] **Improved GLTF export of spawned objects** (GLTF button + key G; minimal valid glTF 2.0 with actual cube mesh positions/indices + PBR materials)
- [x] **Full holographic wrist tablet polish + activation toggle** (HOLO button; polished offsets/scale/emissive; toggle attach/detach)
- [x] **Object delete on double-grip** (rightHand double-gripdown <450ms on .spawned-object deletes via raycaster) — refined & verified
- [x] **Advanced material panel (partial)** (M+ / R+ / APPLY buttons for live metalness/roughness adjust + apply-to-last; custom preset; reactive stats show M/R; handlers ready for M-/R-/O±)
- [x] **Scene share via URL-safe hash** (SHARE button + key X; #vrc= base64 encode state to location.hash + clipboard/prompt; auto-load on boot)
- [x] **Opacity live controls (keyboard)** (key o / Shift+o for ±0.1 via adjustMaterial; full tablet O± buttons still next)
- [x] **Avatar hands polish from visions/** (semi-transparent lowPoly controller models opacity 0.55 applied on model-loaded + timeout; maintains visual connection)
- [x] **Local validate-hooks.sh in repo** + workflow hardened for improved features (size ≥18kB state, toBase64/vrc= scans)

## Next Priorities (one at a time, follow Local Development Workflow from skill)
1. [ ] Real device Quest Browser full interaction test + feedback loop
2. [ ] Full bidirectional material panel on tablet (add M- R- O+ O- buttons + taller 5-row layout + reactive O in stats) — handlers already exist
3. [ ] Full binary GLTF with mesh extraction via official GLTFExporter (if CDN compatible) — current is valid minimal glTF JSON with cube mesh; binary/GLB next
4. [ ] Scene share via simple cloud or shortened link (beyond hash)
5. [ ] Particle feedback / glow on spawn and delete for richer UX
6. [ ] Object scale live controls (S+/S- parallel to material panel)

## Design Rules for All Future Work
- Always use safeExecute / try-catch
- Validate entity existence before mutate
- Keep entity count low for Quest 72-90 fps
- **Docs must match code exactly** — never mark complete until hooks + index + workflow scans confirm presence; update TODO/PROOF/README + skill in same commit
- Test: node --check → local validate-hooks.sh → local serve → workflow → Quest Browser
- Update skill after meaningful changes

**Guiding principle:** Everything done with Grok using automations — less errors, more intelligence. Docs accuracy is now a first-class error-reduction gate.
