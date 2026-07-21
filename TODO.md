# TODO List: Typical Features in 3D Object Creation Applications

**Prepared for Quest VR Creator Project**  
**Date:** July 21, 2026  
**Source:** Thorough web search across VR apps (Gravity Sketch, SculptVR, Open Brush, ShapesXR, Adobe Substance 3D Modeler, Masterpiece X), web tools (Clara.io, Spline, Virtual Maker, Needle Engine, 3D AI Studio, HTC Viverse, Merge Creator, WebVrDev), desktop (Blender, ZBrush), and platforms like Meta Horizon.

This list serves as a **Todo / Roadmap** for expanding the immersive A-Frame WebXR 3D object creator for Meta Quest. Prioritize features that enhance intuitive VR interactions, performance on standalone hardware, and WebXR compatibility (GLB export, hand/controller input).

## Feature List

### 1. Primitive Shapes Instantiation
**Description:** Allows quick addition of basic geometric primitives (cube, sphere, cylinder, plane, cone, torus, etc.) with customizable parameters like size, radius, height, segments.
**How it is Used:** In VR (e.g., Gravity Sketch, Quest apps): Open radial menu or tablet UI, select primitive, trigger spawn at controller position or gaze. Adjust params via sliders or gestures before/after placement. In desktop: Toolbar buttons or add menu.
**Relevance to Quest VR Creator / A-Frame:** Core starting point. Implement via A-Frame primitives (`<a-box>`, `<a-sphere>`) or custom component for dynamic creation with physics. Add symmetry toggle or grid placement as in current progress.

### 2. Direct Manipulation & Transformation (Grab, Move, Rotate, Scale)
**Description:** Intuitive 3D manipulation of objects using controllers/hands for translation, rotation, and uniform/non-uniform scaling. Includes gizmos or freehand.
**How it is Used:** VR: Grab object with grip button or pinch (hand tracking), move/rotate with hand motion; use second hand or UI for precise scale. Two-hand scale common. Snapping optional. Desktop: Gizmo handles + numeric input.
**Relevance:** Fundamental for VR immersion. Use A-Frame + physics-system for grab (already in project?), raycaster for selection, custom 'grab' component. Add precision mode or axis constraints.

### 3. Material, Color & Texture Editing
**Description:** Apply and edit surface properties: base color, PBR maps (roughness, metallic, normal, AO), emissive. Support texture upload or procedural.
**How it is Used:** Select object → open properties panel/tablet → color picker, sliders for PBR values, or paint brush in some VR tools. Real-time viewport update with lighting. Export with materials in GLB.
**Relevance:** Essential for visual polish. In A-Frame: Use `material` component with shaders or PBR. Add UI for color picker (A-Frame color input or custom). Support texture loading via assets.

### 4. Sculpting / Brush-Based Modeling
**Description:** Freeform sculpting tools using brushes to add/subtract/smooth/inflate geometry on meshes or voxels. Supports organic shapes.
**How it is Used:** VR apps (SculptVR, Substance Modeler, Masterpiece X): Hold brush tool, stroke with controller in 3D space. Adjust brush size/strength via UI or gestures. Desktop ZBrush: Similar with pen pressure.
**Relevance:** High value for creative freedom in VR. Advanced for A-Frame/Three.js: Requires custom vertex manipulation component or SDF integration. Start with simple sphere inflation or plan for later (see skill notes on sculpting).

### 5. Import / Export & Asset Interoperability
**Description:** Load external 3D models (GLB, OBJ, FBX, STL, USDZ) and export scenes/objects in optimized formats for web, print, or other apps.
**How it is Used:** Drag-drop or file picker to import. One-click export buttons for GLB (WebXR/Quest), STL (print). Many tools auto-optimize on export.
**Relevance:** Critical for practical use. Implement Three.js GLTFLoader/Exporter in A-Frame scene. Add UI button for export. Support model library import. gltfpack or similar for Quest perf.

### 6. Lighting, Sky & Environment Controls
**Description:** Add/edit lights (directional, point, ambient), set HDRI skyboxes, fog, post-processing effects for realistic or stylized rendering.
**How it is Used:** Place light entities via menu; adjust color/intensity/position with manipulators. Choose environment presets. Live preview in viewport/VR.
**Relevance:** Improves immersion and visuals. A-Frame has `<a-light>`, `environment` component or custom. Add simple UI for env selection. Physics + lighting for nice demos.

### 7. Physics Simulation & Interactive Testing
**Description:** Enable rigid body dynamics, gravity, collisions, joints on objects for realistic behavior and testing interactions.
**How it is Used:** Toggle physics per object or globally. Run sim to see falling, bouncing, stacking. Pause/reset. VR: Interact while simulating.
**Relevance:** Already foundational in Quest VR Builder (physics-system). Extend in Creator with more shapes, constraints, or event triggers. Great for prototyping playable scenes.

### 8. AI-Powered Generation (Text/Image to 3D)
**Description:** Generate 3D models, textures, or variations from text prompts or reference images using generative AI. Includes auto-rig, remesh.
**How it is Used:** Type prompt or upload image → generate base asset in seconds → edit/refine. Used in Meta Horizon, 3D AI Studio, Merge Creator, Viverse for quick starts or inspiration.
**Relevance:** Game-changer for accessibility. Integrate via API calls if possible (or mock for now). Add "Generate" button in UI tablet. Lowers entry barrier for Quest users.

### 9. Animation Recording & Timeline
**Description:** Record object movements, controller paths, or keyframe animations. Playback with controls, easing, looping. Some support skeletal/morph.
**How it is Used:** VR (AnimVR): Record performance in real-time with timeline scrub. Add keyframes manually. Desktop: Full animation editors.
**Relevance:** Enables dynamic content. A-Frame has `animation` component or custom recorder using Three.js. Add simple record button + playback entity. Future: export USD/ glTF animations.

### 10. Scene Hierarchy, Grouping & Outliner UI
**Description:** Visual tree or list of all objects in scene with parent-child relations, search, hide/lock, multi-select, group/ungroup.
**How it is Used:** Floating panel or side UI in desktop/VR tablet. Click to select/focus. Drag to reparent. Essential for managing complexity.
**Relevance:** Prevents cluttered scenes. Implement A-Frame entity hierarchy naturally. Add custom 'outliner' component rendering list on tablet UI (expandable as in current project). Search/filter.

### 11. Precision Tools: Snapping, Grids, Measurement, Alignment
**Description:** Toggle grid snapping, vertex/edge alignment, distance measurement tools, distribute/align functions, numeric property editing.
**How it is Used:** Snap objects to grid or each other during transform. Measure tool for planning. Useful in product/architecture design.
**Relevance:** For accurate work in VR. Add visual grid plane entity, snap logic in grab component. UI inputs for exact position/rotation/scale values on tablet.

### 12. Immersive VR Interactions & UI (Hand Tracking, Menus, Locomotion)
**Description:** Natural interactions via controllers or hand tracking (grab, pinch, point), radial/context menus, wrist/tablet UI, teleport/joystick locomotion, world scaling, passthrough support.
**How it is Used:** Core to all Quest VR apps. Use dominant hand for tools, non-dominant for menu. Two-hand for scale/rotate. Comfortable locomotion to explore large scenes.
**Relevance:** The heart of the project. Current implementation has joystick locomotion, trigger creation, raycast, tablet UI. Expand with hand tracking support (WebXR), better menus, multi-tool switching, comfort settings (snap turn, vignette).

## Additional Cross-Cutting Features
- **Undo/Redo & History**: Full action stack, non-destructive where possible.
- **Collaboration**: Future multi-user sync (A-Frame + WebSockets or third-party).
- **Optimization**: Auto LOD, mesh simplification, performance HUD for Quest FPS.
- **Publishing**: One-click to GitHub Pages or shareable WebXR link.
- **Help/Tutorials**: In-app guided tours or tooltips.

## Next Steps / Action Items (Todo)
- [ ] Research and prototype top 3 priority features (e.g., primitives expansion, material editor, export) in index.html
- [ ] Update TODO.md and README with progress
- [ ] Test all changes in Quest Browser / GitHub Pages
- [ ] Gather user feedback on implemented features
- [ ] Explore integration with AI generation APIs if feasible

This document was created through comprehensive research to provide a solid foundation for feature development in the Quest VR Creator. It honors open-source principles by contributing structured knowledge back to the project.

**Pushed to repository as TODO.md to serve as living Todo list.**