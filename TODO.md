# Quest VR Creator — Living TODO & Roadmap

**Status as of Grok automation session (2026-08-04): Corrected long-standing docs overclaims of unimplemented scale/rotation/particle features. Wired full bidirectional O± material buttons + reactive O stats + taller consistent 5-row tablet (height 1.12). All prior production features remain. Hooks + index syntax clean. Workflow + validate-hooks.sh hardened to hard-fail on docs overclaims for less errors + more intelligence. Docs now match code exactly.**

## Completed ✅
- [x] Error mitigation hook (global + safeExecute)
- [x] State management with history, events, selectTool, undoLastSpawn
- [x] Intelligent camera-aware spawning (cube/sphere/cylinder/cone/torus + matching/approx physics)
- [x] spawn-button component (click + triggerdown for Quest reliability)
- [x] Dynamic tablet UI with C/S/Y/N/T buttons + reactive stats
- [x] Full A-Frame scene (ground, lights, sample objects, dual controllers, raycasters)
- [x] GitHub Actions workflow with dual syntax gates (index + hooks) + intelligence scans + size baselines
- [x] Modular hooks architecture (error → state → spawn → tablet dependency order)
- [x] Desktop keyboard fallbacks (1-5 spawn, U undo, M mat, S save, L load, E JSON, G GLTF, X share, H holo, D del, Ctrl+C clear, o/Shift+o opacity)
- [x] **More primitives (cone, torus)** + unique IDs + color state support
- [x] **Material / color picker UI on tablet** (COLOR action button + selectedColor in state + reactive stats)
- [x] **Object delete / clear-all + improved undo** (CLEAR + UNDO + DEL action buttons on tablet, ID-based removal + grip-down gesture)
- [x] **a-stats / FPS monitor** enabled on scene for Quest perf tuning
- [x] **Advanced material system** (5 PBR presets: standard/metal/plastic/matte/glass; setMaterialPreset cycle; applied on spawn with opacity; MAT button + key; history stores material)
- [x] **Persist scene to localStorage** (SAVE / LOAD buttons + keys; full restore of objects + materials + state)
- [x] **Export scene as JSON** (JSON button + key; downloadable)
- [x] **deleteSpawnedObject by id/el** (DEL button + grip gesture on .spawned-object)
- [x] **Holographic wrist tablet support** (`makeWristHolographic()` — vision-aligned, auto-called on load, attaches to leftHand with cyan emissive)
- [x] **Basic GLTF export of spawned objects** (GLTF button + key G; minimal valid glTF 2.0 with PBR materials + cube mesh data)
- [x] **Full holographic wrist tablet polish + activation toggle** (HOLO button; polished offsets/scale/emissive; toggle attach/detach)
- [x] **Object delete on double-grip** (rightHand double-gripdown <450ms on .spawned-object deletes via raycaster) — refined & verified
- [x] **Scene share via URL hash** (SHARE button + key X; base64 encode state to location.hash + clipboard; auto-load on boot if present)
- [x] **Avatar hands polish from visions/** (semi-transparent lowPoly controller models opacity 0.55 applied on model-loaded + timeout)
- [x] **Live material adjust** (adjustMaterial metalness/roughness/opacity, M+/R+/APPLY buttons + o/Shift+o keys, reactive M/R/O in stats, applyMaterialToLast)
- [x] **Full bidirectional material panel O± buttons on tablet** (O+/O- buttons + handlers + taller 5-row + reactive O) — completed 2026-08-04
- [x] **Taller consistent 5-row tablet design + quality assessment** (height 1.12, all wired including O±, modular safeExecute, zero errors)

## Next Priorities (one at a time, follow Local Development Workflow from skill)
1. [ ] Real device Quest Browser full interaction test + feedback loop
2. [ ] Object scale live controls (selectedScale + adjustScale + S± tablet + keyboard + spawn respects + live apply + Sc stats)
3. [ ] Object rotation live controls (selectedRotationY + adjustRotation + ROT± tablet + keyboard + live + spawn + Rot stats)
4. [ ] Particle feedback / glow on spawn and delete (emissive pulse / red flash) for richer UX
5. [ ] Full binary GLTF with mesh extraction via official GLTFExporter (if CDN compatible) — current is valid minimal glTF JSON
6. [ ] Scene share via simple cloud or shortened link (beyond hash)
7. [ ] Multi-select or object group transform tools

## Design Rules for All Future Work
- Always use safeExecute / try-catch
- Validate entity existence before mutate
- Keep entity count low for Quest 72-90 fps
- **Docs must match code exactly** — never mark complete until hooks + index + workflow scans confirm presence; update TODO/PROOF/README + skill in same commit
- Test: node --check → local validate-hooks.sh → local serve → workflow → Quest Browser
- Update skill after meaningful changes

**Guiding principle:** Everything done with Grok using automations — less errors, more intelligence. Docs accuracy is now a first-class error-reduction gate (hard-fail in CI).
