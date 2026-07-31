/**
 * State Management Hook for Quest VR Creator
 * Purpose: Centralized, intelligent app state for tracking tools, spawned objects, UI, user actions, colors, materials, persistence.
 * Enables features like undo, clear all, stats, localStorage persist, material presets, export JSON/GLTF, tool switching, delete by id, live material adjust, URL hash share, holographic toggle.
 * Less errors: validated updates, change events for reactive UI, safeExecute wrappers.
 * More intelligence: queryable history, counts, easy extension for new primitives and actions, material + persist + share + GLTF.
 * Tested: Syntax valid. Expanded 2026-07-28 with 5 new features (GLTF, hash share, live adjust, double-grip ready, holo toggle). Improved 2026-07-31: robust clear via DOM, full cube-mesh GLTF, url-safe share, safer updateVRState.
 */

(function() {
  'use strict';

  // Initialize or enhance global state
  if (!window.VRCreatorState) {
    window.VRCreatorState = {
      selectedTool: 'cube',
      selectedColor: null,
      selectedMaterial: { metalness: 0.3, roughness: 0.7, opacity: 1.0 },
      materialPreset: 'standard',
      spawnedCount: 0,
      lastSpawnPos: null,
      spawnedObjects: [],
      tools: ['cube', 'sphere', 'cylinder', 'cone', 'torus'],
      materialPresets: {
        standard: { metalness: 0.3, roughness: 0.7, opacity: 1.0 },
        metal: { metalness: 0.9, roughness: 0.2, opacity: 1.0 },
        plastic: { metalness: 0.05, roughness: 0.4, opacity: 1.0 },
        matte: { metalness: 0.0, roughness: 0.95, opacity: 1.0 },
        glass: { metalness: 0.1, roughness: 0.05, opacity: 0.55 }
      },
      ui: {
        tabletVisible: true,
        lastInteraction: null,
        holographic: true
      },
      sessionStart: Date.now()
    };
    console.log('✅ VRCreatorState initialized via hook (with materials + persist + holographic + GLTF + share + live adjust support).');
  } else {
    if (!window.VRCreatorState.tools || !window.VRCreatorState.tools.includes('cone')) {
      window.VRCreatorState.tools = ['cube', 'sphere', 'cylinder', 'cone', 'torus'];
    }
    if (window.VRCreatorState.selectedColor === undefined) {
      window.VRCreatorState.selectedColor = null;
    }
    if (!window.VRCreatorState.selectedMaterial) {
      window.VRCreatorState.selectedMaterial = { metalness: 0.3, roughness: 0.7, opacity: 1.0 };
    }
    if (!window.VRCreatorState.materialPresets) {
      window.VRCreatorState.materialPresets = {
        standard: { metalness: 0.3, roughness: 0.7, opacity: 1.0 },
        metal: { metalness: 0.9, roughness: 0.2, opacity: 1.0 },
        plastic: { metalness: 0.05, roughness: 0.4, opacity: 1.0 },
        matte: { metalness: 0.0, roughness: 0.95, opacity: 1.0 },
        glass: { metalness: 0.1, roughness: 0.05, opacity: 0.55 }
      };
    }
    if (window.VRCreatorState.materialPreset === undefined) {
      window.VRCreatorState.materialPreset = 'standard';
    }
  }

  window.updateVRState = function(updates) {
    if (!window.VRCreatorState || typeof updates !== 'object') {
      console.warn('State update skipped: invalid input');
      return false;
    }
    try {
      const prevState = JSON.parse(JSON.stringify(window.VRCreatorState));
      Object.assign(window.VRCreatorState, updates);
      const event = new CustomEvent('vr-state-changed', { 
        detail: { updates, previous: prevState, current: window.VRCreatorState } 
      });
      document.dispatchEvent(event);
      console.log('✅ VR State updated intelligently:', Object.keys(updates).join(', '));
      return true;
    } catch (e) {
      console.error('State update error (mitigated):', e);
      return false;
    }
  };

  window.selectTool = function(newTool) {
    if (window.VRCreatorState.tools.includes(newTool) || newTool === 'random') {
      window.updateVRState({ selectedTool: newTool });
      console.log(`🛠️ Tool selected: ${newTool}`);
    } else {
      console.warn(`Tool '${newTool}' not available. Available:`, window.VRCreatorState.tools);
    }
  };

  window.setSelectedColor = function(hexColor) {
    window.updateVRState({ selectedColor: hexColor || null });
    console.log(`🎨 Selected color set: ${hexColor || 'default/type-based'}`);
  };

  window.setMaterialPreset = function(presetName) {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      const presets = state.materialPresets || {};
      let name = presetName;
      if (!name || !presets[name]) {
        const keys = Object.keys(presets);
        const idx = keys.indexOf(state.materialPreset || 'standard');
        name = keys[(idx + 1) % keys.length];
      }
      const mat = presets[name];
      if (mat) {
        window.updateVRState({ 
          materialPreset: name, 
          selectedMaterial: { ...mat } 
        });
        console.log(`✨ Material preset set: ${name} (metal:${mat.metalness} rough:${mat.roughness} opac:${mat.opacity})`);
        return name;
      }
      return null;
    }, 'Set Material Preset', null);
  };

  // NEW: Live adjust material property (metalness/roughness/opacity) by delta, clamp 0-1, set custom
  window.adjustMaterial = function(property, delta) {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      if (!state.selectedMaterial) state.selectedMaterial = { metalness: 0.3, roughness: 0.7, opacity: 1.0 };
      const mat = { ...state.selectedMaterial };
      if (property === 'metalness' || property === 'roughness' || property === 'opacity') {
        mat[property] = Math.max(0, Math.min(1, (mat[property] || 0) + (delta || 0.1)));
        window.updateVRState({
          selectedMaterial: mat,
          materialPreset: 'custom'
        });
        console.log(`🎛️ Material adjusted ${property} to ${mat[property].toFixed(2)} (custom)`);
        return mat[property];
      }
      return null;
    }, 'Adjust Material', null);
  };

  // NEW: Apply current material to last spawned object
  window.applyMaterialToLast = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      if (!state.spawnedObjects || !state.spawnedObjects.length) {
        console.log('No objects to apply material to.');
        return false;
      }
      const last = state.spawnedObjects[state.spawnedObjects.length - 1];
      const el = document.getElementById(last.id);
      if (!el) return false;
      const mat = state.selectedMaterial || { metalness: 0.3, roughness: 0.7, opacity: 1.0 };
      const color = last.color || '#FFCC00';
      const matStr = `color: ${color}; metalness: ${mat.metalness}; roughness: ${mat.roughness}; opacity: ${mat.opacity}; transparent: ${mat.opacity < 1 ? 'true' : 'false'}`;
      el.setAttribute('material', matStr);
      last.material = { ...mat };
      window.updateVRState({ spawnedObjects: state.spawnedObjects });
      console.log(`✨ Applied custom material to last object ${last.id}`);
      return true;
    }, 'Apply Material to Last', false);
  };

  window.undoLastSpawn = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      if (state.spawnedObjects && state.spawnedObjects.length > 0) {
        const last = state.spawnedObjects.pop();
        const el = document.getElementById(last.id);
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
          state.spawnedCount = Math.max(0, state.spawnedCount - 1);
          console.log('↩️ Undid last spawn:', last.type, last.id);
          window.updateVRState({ spawnedCount: state.spawnedCount });
          return true;
        } else {
          console.warn('Undo: element not found by id, history cleaned');
          state.spawnedCount = Math.max(0, state.spawnedCount - 1);
          window.updateVRState({ spawnedCount: state.spawnedCount });
        }
      } else {
        console.log('Nothing to undo.');
      }
      return false;
    }, 'Undo Last Spawn', false);
  };

  window.clearAllSpawned = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      const objs = document.querySelectorAll('.spawned-object');
      let removed = 0;
      objs.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
          removed++;
        }
      });
      state.spawnedObjects = [];
      state.spawnedCount = 0;
      window.updateVRState({ spawnedCount: 0, spawnedObjects: [] });
      console.log(`🗑️ Cleared ${removed} spawned objects.`);
      return removed;
    }, 'Clear All Spawned', 0);
  };

  window.saveSceneToStorage = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      const data = {
        version: 1,
        timestamp: Date.now(),
        spawnedObjects: state.spawnedObjects || [],
        selectedTool: state.selectedTool,
        selectedColor: state.selectedColor,
        materialPreset: state.materialPreset,
        selectedMaterial: state.selectedMaterial
      };
      localStorage.setItem('quest-vr-creator-scene', JSON.stringify(data));
      console.log(`💾 Scene saved to localStorage (${data.spawnedObjects.length} objects).`);
      return true;
    }, 'Save Scene to Storage', false);
  };

  window.loadSceneFromStorage = function() {
    return window.safeExecute(() => {
      const raw = localStorage.getItem('quest-vr-creator-scene');
      if (!raw) {
        console.log('No saved scene found in localStorage.');
        return false;
      }
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.spawnedObjects)) {
        console.warn('Invalid saved scene data.');
        return false;
      }
      window.clearAllSpawned();
      window.updateVRState({
        selectedTool: data.selectedTool || 'cube',
        selectedColor: data.selectedColor || null,
        materialPreset: data.materialPreset || 'standard',
        selectedMaterial: data.selectedMaterial || { metalness: 0.3, roughness: 0.7, opacity: 1.0 }
      });
      data.spawnedObjects.forEach(obj => {
        if (typeof window.spawnIntelligentObject === 'function') {
          window.spawnIntelligentObject(obj.type, {
            color: obj.color,
            positionOverride: obj.pos,
            material: obj.material || data.selectedMaterial
          });
        }
      });
      console.log(`📂 Scene loaded from localStorage (${data.spawnedObjects.length} objects restored).`);
      return true;
    }, 'Load Scene from Storage', false);
  };

  window.exportSceneJSON = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        spawnedCount: state.spawnedCount,
        objects: state.spawnedObjects || [],
        tool: state.selectedTool,
        color: state.selectedColor,
        material: state.selectedMaterial,
        preset: state.materialPreset
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quest-vr-scene-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('📤 Scene exported as JSON download.');
      return true;
    }, 'Export Scene JSON', false);
  };

  // NEW: Basic GLTF 2.0 export of spawned objects (minimal valid, PBR materials, no external deps)
  window.exportSceneGLTF = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      const objs = state.spawnedObjects || [];
      if (!objs.length) {
        console.log('No objects to export as GLTF.');
        return false;
      }

      function toBase64(buf) {
        let binary = '';
        const bytes = new Uint8Array(buf.buffer || buf);
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
      }
      const positions = new Float32Array([
        -0.25,-0.25,-0.25,  0.25,-0.25,-0.25,  0.25,0.25,-0.25,  -0.25,0.25,-0.25,
        -0.25,-0.25,0.25,   0.25,-0.25,0.25,   0.25,0.25,0.25,   -0.25,0.25,0.25
      ]);
      const indices = new Uint16Array([
        0,1,2, 0,2,3, 4,6,5, 4,7,6, 0,4,5, 0,5,1, 1,5,6, 1,6,2, 2,6,7, 2,7,3, 3,7,4, 3,4,0
      ]);
      const posB64 = toBase64(positions);
      const idxB64 = toBase64(indices);

      const materials = [];
      const nodes = [];
      objs.forEach((obj) => {
        const col = obj.color || '#FFCC00';
        const r = parseInt(col.slice(1,3), 16) / 255 || 1;
        const g = parseInt(col.slice(3,5), 16) / 255 || 0.8;
        const b = parseInt(col.slice(5,7), 16) / 255 || 0;
        const mat = obj.material || { metalness: 0.3, roughness: 0.7, opacity: 1.0 };
        materials.push({
          name: `mat-${obj.id}`,
          pbrMetallicRoughness: {
            baseColorFactor: [r, g, b, mat.opacity || 1],
            metallicFactor: mat.metalness || 0.3,
            roughnessFactor: mat.roughness || 0.7
          },
          alphaMode: (mat.opacity < 1) ? 'BLEND' : 'OPAQUE'
        });
        const posParts = (obj.pos || '0 1 -2').split(' ').map(Number);
        nodes.push({
          name: obj.id,
          translation: [posParts[0] || 0, posParts[1] || 1, posParts[2] || -2],
          mesh: 0
        });
      });

      const gltf = {
        asset: { version: '2.0', generator: 'Quest VR Creator Grok Automation' },
        scene: 0,
        scenes: [{ nodes: nodes.map((_, i) => i) }],
        nodes: nodes,
        meshes: [{
          primitives: [{
            attributes: { POSITION: 0 },
            indices: 1,
            material: 0
          }]
        }],
        materials: materials.length ? materials : [{ pbrMetallicRoughness: { baseColorFactor: [1,0.8,0,1], metallicFactor: 0.3, roughnessFactor: 0.7 } }],
        accessors: [
          { bufferView: 0, componentType: 5126, count: 8, type: 'VEC3', max: [0.25,0.25,0.25], min: [-0.25,-0.25,-0.25] },
          { bufferView: 1, componentType: 5123, count: 36, type: 'SCALAR' }
        ],
        bufferViews: [
          { buffer: 0, byteOffset: 0, byteLength: positions.byteLength, target: 34962 },
          { buffer: 1, byteOffset: 0, byteLength: indices.byteLength, target: 34963 }
        ],
        buffers: [
          { byteLength: positions.byteLength, uri: 'data:application/octet-stream;base64,' + posB64 },
          { byteLength: indices.byteLength, uri: 'data:application/octet-stream;base64,' + idxB64 }
        ]
      };

      const blob = new Blob([JSON.stringify(gltf, null, 2)], { type: 'model/gltf+json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quest-vr-scene-${Date.now()}.gltf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log(`📦 Scene exported as basic GLTF (${objs.length} objects, PBR materials).`);
      return true;
    }, 'Export Scene GLTF', false);
  };

  // NEW: Scene share via URL hash (base64 compact state)
  window.shareSceneViaHash = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      const compact = {
        v: 1,
        o: (state.spawnedObjects || []).map(o => ({
          t: o.type,
          p: o.pos,
          c: o.color,
          m: o.material
        })),
        tool: state.selectedTool,
        col: state.selectedColor,
        mat: state.materialPreset,
        sm: state.selectedMaterial
      };
      const json = JSON.stringify(compact);
      const b64 = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      if (b64.length > 8000) {
        console.warn('Share hash too long for some browsers; truncated objects may apply.');
      }
      const hash = '#vrc=' + b64;
      try {
        location.hash = hash;
      } catch (e) {}
      const fullUrl = (location.origin || '') + (location.pathname || '') + hash;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullUrl).then(() => {
          console.log('🔗 Scene shared via URL hash + copied to clipboard.');
        }).catch(() => {
          console.log('🔗 Scene shared via URL hash (clipboard fallback).');
          try { prompt('Copy this share URL:', fullUrl); } catch(e) {}
        });
      } else {
        try { prompt('Copy this share URL:', fullUrl); } catch(e) {}
        console.log('🔗 Scene shared via URL hash (prompt).');
      }
      return true;
    }, 'Share Scene Via Hash', false);
  };

  // NEW: Load from URL hash if present
  window.loadSceneFromHash = function() {
    return window.safeExecute(() => {
      const hash = location.hash || '';
      if (!hash.startsWith('#vrc=')) return false;
      const b64 = hash.slice(5).replace(/-/g, '+').replace(/_/g, '/');
      let json;
      try {
        json = decodeURIComponent(escape(atob(b64)));
      } catch (e) {
        console.warn('Invalid share hash.');
        return false;
      }
      const data = JSON.parse(json);
      if (!data || !Array.isArray(data.o)) {
        console.warn('Invalid share data.');
        return false;
      }
      window.clearAllSpawned();
      window.updateVRState({
        selectedTool: data.tool || 'cube',
        selectedColor: data.col || null,
        materialPreset: data.mat || 'standard',
        selectedMaterial: data.sm || { metalness: 0.3, roughness: 0.7, opacity: 1.0 }
      });
      data.o.forEach(obj => {
        if (typeof window.spawnIntelligentObject === 'function') {
          window.spawnIntelligentObject(obj.t, {
            color: obj.c,
            positionOverride: obj.p,
            material: obj.m
          });
        }
      });
      console.log(`🔗 Scene loaded from URL hash (${data.o.length} objects).`);
      return true;
    }, 'Load Scene From Hash', false);
  };

  // NEW: Toggle holographic wrist attachment
  window.toggleHolographic = function() {
    return window.safeExecute(() => {
      const tablet = document.querySelector('#tablet');
      const leftHand = document.querySelector('#leftHand');
      const state = window.VRCreatorState;
      if (!tablet) return false;
      const currentlyHolo = state && state.ui && state.ui.holographic;
      if (currentlyHolo && leftHand && tablet.parentNode === leftHand) {
        leftHand.removeChild(tablet);
        const scene = document.querySelector('a-scene');
        if (scene) scene.appendChild(tablet);
        tablet.setAttribute('position', '0 1.25 -0.9');
        tablet.setAttribute('rotation', '-15 0 0');
        tablet.setAttribute('scale', '1 1 1');
        if (state) window.updateVRState({ ui: { ...(state.ui || {}), holographic: false } });
        console.log('🖥️ Tablet detached to fixed holographic position.');
      } else {
        if (typeof window.makeWristHolographic === 'function') {
          window.makeWristHolographic();
        }
        if (state) window.updateVRState({ ui: { ...(state.ui || {}), holographic: true } });
        console.log('⌚ Tablet attached as holographic wrist.');
      }
      return true;
    }, 'Toggle Holographic', false);
  };

  window.deleteSpawnedObject = function(idOrEl) {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      let el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
      if (!el || !el.classList.contains('spawned-object')) {
        console.log('Delete: no valid spawned object.');
        return false;
      }
      const id = el.id;
      if (el.parentNode) el.parentNode.removeChild(el);
      if (state.spawnedObjects) {
        state.spawnedObjects = state.spawnedObjects.filter(o => o.id !== id);
        state.spawnedCount = state.spawnedObjects.length;
        window.updateVRState({ spawnedCount: state.spawnedCount, spawnedObjects: state.spawnedObjects });
      }
      console.log('🗑️ Deleted object:', id);
      return true;
    }, 'Delete Spawned Object', false);
  };

  console.log('✅ State Management Hook active - intelligence layer ready (undo + clear + materials + persist + export JSON/GLTF + delete + share + live adjust + holo toggle).');
})();
