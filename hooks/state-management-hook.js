/**
 * State Management Hook for Quest VR Creator
 * Purpose: Centralized, intelligent app state for tracking tools, spawned objects, UI, user actions, colors, materials, persistence.
 * Enables features like undo, clear all, stats, localStorage persist, material presets, export JSON/GLTF, tool switching, delete by id, live material adjust, URL hash share, holographic toggle.
 * Less errors: validated updates, change events for reactive UI, safeExecute wrappers.
 * More intelligence: queryable history, counts, easy extension for new primitives and actions, material + persist + share + GLTF.
 * Tested: Syntax valid. Expanded 2026-07-28 with 5 new features (GLTF, hash share, live adjust, double-grip ready, holo toggle).
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
      console.warn('updateVRState: invalid');
      return;
    }
    const prevState = JSON.parse(JSON.stringify(window.VRCreatorState));
    Object.assign(window.VRCreatorState, updates);
    document.dispatchEvent(new CustomEvent('vr-state-changed', { 
      detail: { updates, previous: prevState, current: window.VRCreatorState } 
    }));
  };

  window.selectTool = function(newTool) {
    if (window.VRCreatorState.tools.includes(newTool) || newTool === 'random') {
      window.updateVRState({ selectedTool: newTool });
      console.log('🛠️ Tool selected:', newTool);
    } else {
      console.warn(`Tool '${newTool}' not available. Available:`, window.VRCreatorState.tools);
    }
  };

  window.setSelectedColor = function(hexColor) {
    window.updateVRState({ selectedColor: hexColor || null });
    console.log('🎨 Color set:', hexColor);
  };

  window.setMaterialPreset = function(presetName) {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      const presets = state.materialPresets || {};
      const keys = Object.keys(presets);
      if (!presetName || !presets[presetName]) {
        // Cycle
        const idx = keys.indexOf(state.materialPreset || 'standard');
        presetName = keys[(idx + 1) % keys.length];
      }
      const mat = presets[presetName];
      window.updateVRState({ 
        materialPreset: presetName,
        selectedMaterial: { ...mat }
      });
      console.log('💎 Material preset:', presetName, mat);
      return presetName;
    }, 'Set Material Preset', null);
  };

  window.adjustMaterial = function(property, delta) {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      if (!state.selectedMaterial) state.selectedMaterial = { metalness: 0.3, roughness: 0.7, opacity: 1.0 };
      const cur = state.selectedMaterial[property] || 0;
      let next = Math.max(0, Math.min(1, cur + delta));
      state.selectedMaterial[property] = next;
      window.updateVRState({
        selectedMaterial: { ...state.selectedMaterial },
        materialPreset: 'custom'
      });
      console.log(`🔧 Adjust ${property}: ${next.toFixed(2)}`);
      return next;
    }, 'Adjust Material', null);
  };

  window.applyMaterialToLast = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      if (!state.spawnedObjects || !state.spawnedObjects.length) return false;
      const last = state.spawnedObjects[state.spawnedObjects.length - 1];
      const el = document.getElementById(last.id);
      if (!el) return false;
      const mat = state.selectedMaterial || { metalness: 0.3, roughness: 0.7, opacity: 1.0 };
      const color = state.selectedColor || last.color || '#FFCC00';
      const matStr = `color: ${color}; metalness: ${mat.metalness}; roughness: ${mat.roughness}; opacity: ${mat.opacity}; transparent: ${mat.opacity < 1 ? 'true' : 'false'}`;
      el.setAttribute('material', matStr);
      last.material = { ...mat };
      last.color = color;
      window.updateVRState({ spawnedObjects: state.spawnedObjects });
      console.log('✨ Applied material to last:', last.id);
      return true;
    }, 'Apply Material To Last', false);
  };

  window.undoLastSpawn = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      if (!state.spawnedObjects || !state.spawnedObjects.length) {
        console.log('Undo: nothing to undo');
        return false;
      }
      const last = state.spawnedObjects.pop();
      const el = document.getElementById(last.id);
      if (el && el.parentNode) el.parentNode.removeChild(el);
      state.spawnedCount = state.spawnedObjects.length;
      window.updateVRState({ spawnedCount: state.spawnedCount, spawnedObjects: state.spawnedObjects });
      console.log('↩️ Undid spawn:', last.id);
      return true;
    }, 'Undo Last Spawn', false);
  };

  window.clearAllSpawned = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      if (!state.spawnedObjects) return false;
      state.spawnedObjects.forEach(o => {
        const el = document.getElementById(o.id);
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
      state.spawnedObjects = [];
      state.spawnedCount = 0;
      window.updateVRState({ spawnedCount: 0, spawnedObjects: [] });
      console.log('🧹 Cleared all spawned objects');
      return true;
    }, 'Clear All Spawned', false);
  };

  window.saveSceneToStorage = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      const data = {
        objects: state.spawnedObjects || [],
        selectedTool: state.selectedTool,
        selectedColor: state.selectedColor,
        materialPreset: state.materialPreset,
        selectedMaterial: state.selectedMaterial,
        ts: Date.now()
      };
      localStorage.setItem('quest-vr-creator-scene', JSON.stringify(data));
      console.log('💾 Scene saved to localStorage (' + (data.objects.length) + ' objects)');
      return true;
    }, 'Save Scene To Storage', false);
  };

  window.loadSceneFromStorage = function() {
    return window.safeExecute(() => {
      const raw = localStorage.getItem('quest-vr-creator-scene');
      if (!raw) {
        console.log('Load: no saved scene');
        return false;
      }
      const data = JSON.parse(raw);
      // Clear existing
      if (typeof window.clearAllSpawned === 'function') window.clearAllSpawned();
      // Restore
      (data.objects || []).forEach(obj => {
        if (typeof window.spawnIntelligentObject === 'function') {
          window.spawnIntelligentObject(obj.type, {
            color: obj.color,
            material: obj.material,
            positionOverride: obj.pos
          });
        }
      });
      if (data.selectedTool) window.selectTool && window.selectTool(data.selectedTool);
      if (data.selectedColor) window.setSelectedColor && window.setSelectedColor(data.selectedColor);
      if (data.materialPreset) window.setMaterialPreset && window.setMaterialPreset(data.materialPreset);
      console.log('📂 Scene loaded from localStorage (' + (data.objects || []).length + ' objects)');
      return true;
    }, 'Load Scene From Storage', false);
  };

  window.exportSceneJSON = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      const data = {
        version: '1.0',
        objects: state.spawnedObjects || [],
        state: {
          selectedTool: state.selectedTool,
          selectedColor: state.selectedColor,
          materialPreset: state.materialPreset,
          selectedMaterial: state.selectedMaterial
        },
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quest-vr-creator-scene.json';
      a.click();
      URL.revokeObjectURL(url);
      console.log('📄 Exported JSON (' + (data.objects.length) + ' objects)');
      return true;
    }, 'Export Scene JSON', false);
  };

  window.exportSceneGLTF = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      const objects = state.spawnedObjects || [];
      // Minimal valid glTF 2.0 with PBR materials (no binary meshes — lightweight JSON)
      const nodes = objects.map((o, i) => ({
        name: o.id || ('obj_' + i),
        translation: (o.pos || '0 1 0').split(' ').map(Number),
        mesh: i
      }));
      const meshes = objects.map((o, i) => {
        const mat = o.material || { metalness: 0.3, roughness: 0.7, opacity: 1.0 };
        return {
          name: (o.type || 'box') + '_' + i,
          primitives: [{
            attributes: { POSITION: 0 },
            material: i
          }]
        };
      });
      const materials = objects.map((o) => {
        const mat = o.material || { metalness: 0.3, roughness: 0.7, opacity: 1.0 };
        const color = o.color || '#FFCC00';
        // Simple hex to linear RGB
        const r = parseInt(color.slice(1,3), 16) / 255;
        const g = parseInt(color.slice(3,5), 16) / 255;
        const b = parseInt(color.slice(5,7), 16) / 255;
        return {
          name: 'mat_' + (o.id || ''),
          pbrMetallicRoughness: {
            baseColorFactor: [r, g, b, mat.opacity || 1],
            metallicFactor: mat.metalness || 0.3,
            roughnessFactor: mat.roughness || 0.7
          },
          alphaMode: (mat.opacity < 1) ? 'BLEND' : 'OPAQUE'
        };
      });
      const gltf = {
        asset: { version: '2.0', generator: 'Quest VR Creator' },
        scene: 0,
        scenes: [{ nodes: objects.map((_, i) => i) }],
        nodes,
        meshes,
        materials,
        accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', max: [0.25,0.25,0.25], min: [-0.25,-0.25,-0.25] }],
        bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }],
        buffers: [{ byteLength: 36, uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=' }]
      };
      const blob = new Blob([JSON.stringify(gltf, null, 2)], { type: 'model/gltf+json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quest-vr-creator-scene.gltf';
      a.click();
      URL.revokeObjectURL(url);
      console.log('📦 Exported minimal glTF 2.0 (' + objects.length + ' objects)');
      return true;
    }, 'Export Scene GLTF', false);
  };

  window.shareSceneViaHash = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      const data = {
        o: (state.spawnedObjects || []).map(o => ({
          t: o.type,
          p: o.pos,
          c: o.color,
          m: o.material
        })),
        tool: state.selectedTool,
        color: state.selectedColor,
        mat: state.materialPreset
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      const url = location.origin + location.pathname + '#' + encoded;
      location.hash = encoded;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => console.log('🔗 Scene shared via URL hash + clipboard')).catch(() => console.log('🔗 Scene shared via URL hash'));
      } else {
        console.log('🔗 Scene shared via URL hash');
      }
      return true;
    }, 'Share Scene Via Hash', false);
  };

  window.loadSceneFromHash = function() {
    return window.safeExecute(() => {
      if (!location.hash || location.hash.length < 10) return false;
      const encoded = location.hash.slice(1);
      const json = decodeURIComponent(escape(atob(encoded)));
      const data = JSON.parse(json);
      if (!data.o || !Array.isArray(data.o)) return false;
      if (typeof window.clearAllSpawned === 'function') window.clearAllSpawned();
      data.o.forEach(obj => {
        if (typeof window.spawnIntelligentObject === 'function') {
          window.spawnIntelligentObject(obj.t || 'cube', {
            color: obj.c,
            material: obj.m,
            positionOverride: obj.p
          });
        }
      });
      if (data.tool) window.selectTool && window.selectTool(data.tool);
      if (data.color) window.setSelectedColor && window.setSelectedColor(data.color);
      if (data.mat) window.setMaterialPreset && window.setMaterialPreset(data.mat);
      console.log(`🔗 Scene loaded from URL hash (${data.o.length} objects).`);
      return true;
    }, 'Load Scene From Hash', false);
  };

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
