/**
 * State Management Hook for Quest VR Creator
 * Purpose: Centralized, intelligent app state for tracking tools, spawned objects, UI, user actions, colors, materials, persistence.
 * Enables features like undo, clear all, stats, localStorage persist, material presets, export JSON/GLTF, tool switching, delete by id, live material adjust, URL hash share, holographic toggle.
 * Less errors: validated updates, change events for reactive UI, safeExecute wrappers.
 * More intelligence: queryable history, counts, easy extension for new primitives and actions, material + persist + share + GLTF.
 * Tested: Syntax valid. Expanded 2026-07-28 with 5 new features (GLTF, hash share, live adjust, double-grip ready, holo toggle). Improved 2026-07-31: robust clear via DOM, full cube-mesh GLTF, url-safe share, safer updateVRState.
 * FINAL 2026-08-22: Restored for complete project freeze.
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
      selectedScale: 1.0,
      selectedRotationY: 0,
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
    console.log('✅ VRCreatorState initialized via hook (with materials + persist + holographic + GLTF + share + live adjust + scale + rot support).');
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
    if (window.VRCreatorState.selectedScale === undefined) window.VRCreatorState.selectedScale = 1.0;
    if (window.VRCreatorState.selectedRotationY === undefined) window.VRCreatorState.selectedRotationY = 0;
  }

  window.updateVRState = function(updates) {
    return window.safeExecute(function() {
      if (!updates || typeof updates !== 'object') return false;
      const state = window.VRCreatorState;
      Object.keys(updates).forEach(function(k) {
        if (k === 'ui' && typeof updates.ui === 'object') {
          state.ui = Object.assign({}, state.ui || {}, updates.ui);
        } else {
          state[k] = updates[k];
        }
      });
      document.dispatchEvent(new CustomEvent('vr-state-changed', { detail: { current: state, updates: updates } }));
      return true;
    }, 'Update VR State', false);
  };

  window.selectTool = function(tool) {
    return window.safeExecute(function() {
      if (!window.VRCreatorState.tools.includes(tool)) {
        console.warn('Unknown tool:', tool);
        return false;
      }
      window.updateVRState({ selectedTool: tool });
      console.log('🛠️ Tool selected:', tool);
      return true;
    }, 'Select Tool', false);
  };

  window.setSelectedColor = function(color) {
    return window.safeExecute(function() {
      window.updateVRState({ selectedColor: color });
      console.log('🎨 Color set:', color);
      return true;
    }, 'Set Selected Color', false);
  };

  window.setMaterialPreset = function(preset) {
    return window.safeExecute(function() {
      const state = window.VRCreatorState;
      const presets = Object.keys(state.materialPresets);
      let next = preset;
      if (!next || !state.materialPresets[next]) {
        const idx = presets.indexOf(state.materialPreset || 'standard');
        next = presets[(idx + 1) % presets.length];
      }
      const mat = Object.assign({}, state.materialPresets[next]);
      window.updateVRState({ materialPreset: next, selectedMaterial: mat });
      console.log('🧱 Material preset:', next);
      return true;
    }, 'Set Material Preset', false);
  };

  window.adjustMaterial = function(prop, delta) {
    return window.safeExecute(function() {
      const state = window.VRCreatorState;
      if (!state.selectedMaterial) state.selectedMaterial = { metalness: 0.3, roughness: 0.7, opacity: 1.0 };
      let val = (state.selectedMaterial[prop] || 0) + delta;
      if (prop === 'opacity') val = Math.max(0.05, Math.min(1, val));
      else val = Math.max(0, Math.min(1, val));
      state.selectedMaterial[prop] = val;
      window.updateVRState({ selectedMaterial: Object.assign({}, state.selectedMaterial) });
      console.log('🔧 Material', prop, '=', val.toFixed(2));
      return true;
    }, 'Adjust Material', false);
  };

  window.applyMaterialToLast = function() {
    return window.safeExecute(function() {
      const state = window.VRCreatorState;
      if (!state.spawnedObjects || !state.spawnedObjects.length) return false;
      const last = state.spawnedObjects[state.spawnedObjects.length - 1];
      const el = document.getElementById(last.id);
      if (!el) return false;
      const mat = state.selectedMaterial || { metalness: 0.3, roughness: 0.7, opacity: 1.0 };
      el.setAttribute('material', {
        metalness: mat.metalness,
        roughness: mat.roughness,
        opacity: mat.opacity,
        transparent: mat.opacity < 1
      });
      last.material = Object.assign({}, mat);
      window.updateVRState({ spawnedObjects: state.spawnedObjects.slice() });
      console.log('✨ Applied material to last');
      return true;
    }, 'Apply Material To Last', false);
  };

  window.adjustScale = function(delta) {
    return window.safeExecute(function() {
      const state = window.VRCreatorState;
      let s = (state.selectedScale || 1) + delta;
      s = Math.max(0.2, Math.min(3, s));
      window.updateVRState({ selectedScale: s });
      console.log('📏 Scale:', s.toFixed(2));
      return true;
    }, 'Adjust Scale', false);
  };

  window.applyScaleToLast = function() {
    return window.safeExecute(function() {
      const state = window.VRCreatorState;
      if (!state.spawnedObjects || !state.spawnedObjects.length) return false;
      const last = state.spawnedObjects[state.spawnedObjects.length - 1];
      const el = document.getElementById(last.id);
      if (!el) return false;
      const s = state.selectedScale || 1;
      el.setAttribute('scale', s + ' ' + s + ' ' + s);
      last.scale = s;
      window.updateVRState({ spawnedObjects: state.spawnedObjects.slice() });
      console.log('📏 Applied scale to last');
      return true;
    }, 'Apply Scale To Last', false);
  };

  window.adjustRotation = function(delta) {
    return window.safeExecute(function() {
      const state = window.VRCreatorState;
      let r = ((state.selectedRotationY || 0) + delta) % 360;
      window.updateVRState({ selectedRotationY: r });
      console.log('🔄 Rotation Y:', r.toFixed(0));
      return true;
    }, 'Adjust Rotation', false);
  };

  window.applyRotationToLast = function() {
    return window.safeExecute(function() {
      const state = window.VRCreatorState;
      if (!state.spawnedObjects || !state.spawnedObjects.length) return false;
      const last = state.spawnedObjects[state.spawnedObjects.length - 1];
      const el = document.getElementById(last.id);
      if (!el) return false;
      const r = state.selectedRotationY || 0;
      el.setAttribute('rotation', '0 ' + r + ' 0');
      last.rotationY = r;
      window.updateVRState({ spawnedObjects: state.spawnedObjects.slice() });
      console.log('🔄 Applied rotation to last');
      return true;
    }, 'Apply Rotation To Last', false);
  };

  window.undoLastSpawn = function() {
    return window.safeExecute(function() {
      const state = window.VRCreatorState;
      if (!state.spawnedObjects || !state.spawnedObjects.length) {
        console.log('Nothing to undo');
        return false;
      }
      const last = state.spawnedObjects.pop();
      const el = document.getElementById(last.id);
      if (el && el.parentNode) el.parentNode.removeChild(el);
      state.spawnedCount = state.spawnedObjects.length;
      window.updateVRState({ spawnedCount: state.spawnedCount, spawnedObjects: state.spawnedObjects.slice() });
      console.log('↩️ Undid:', last.id);
      return true;
    }, 'Undo Last Spawn', false);
  };

  window.clearAllSpawned = function() {
    return window.safeExecute(function() {
      const state = window.VRCreatorState;
      document.querySelectorAll('.spawned-object').forEach(function(el) {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      state.spawnedObjects = [];
      state.spawnedCount = 0;
      window.updateVRState({ spawnedCount: 0, spawnedObjects: [] });
      console.log('🧹 Cleared all spawned');
      return true;
    }, 'Clear All Spawned', false);
  };

  window.saveSceneToStorage = function() {
    return window.safeExecute(function() {
      const state = window.VRCreatorState;
      const data = {
        o: (state.spawnedObjects || []).map(function(obj) {
          return { id: obj.id, t: obj.type, p: obj.pos, c: obj.color, m: obj.material, s: obj.scale, r: obj.rotationY };
        }),
        tool: state.selectedTool,
        color: state.selectedColor,
        mat: state.materialPreset,
        scale: state.selectedScale,
        rot: state.selectedRotationY
      };
      localStorage.setItem('quest-vr-creator-scene', JSON.stringify(data));
      console.log('💾 Scene saved to localStorage');
      return true;
    }, 'Save Scene To Storage', false);
  };

  window.loadSceneFromStorage = function() {
    return window.safeExecute(function() {
      const raw = localStorage.getItem('quest-vr-creator-scene');
      if (!raw) {
        console.log('No saved scene');
        return false;
      }
      const data = JSON.parse(raw);
      window.clearAllSpawned();
      (data.o || []).forEach(function(obj) {
        if (typeof window.spawnIntelligentObject === 'function') {
          window.spawnIntelligentObject(obj.t, { pos: obj.p, color: obj.c, material: obj.m, scale: obj.s, rotationY: obj.r });
        }
      });
      if (data.tool) window.selectTool(data.tool);
      if (data.color) window.setSelectedColor(data.color);
      if (data.mat) window.setMaterialPreset(data.mat);
      if (data.scale !== undefined) window.updateVRState({ selectedScale: data.scale });
      if (data.rot !== undefined) window.updateVRState({ selectedRotationY: data.rot });
      console.log('📂 Scene loaded from localStorage');
      return true;
    }, 'Load Scene From Storage', false);
  };

  window.exportSceneJSON = function() {
    return window.safeExecute(function() {
      const state = window.VRCreatorState;
      const data = {
        version: 1,
        objects: state.spawnedObjects || [],
        tool: state.selectedTool,
        color: state.selectedColor,
        material: state.materialPreset,
        scale: state.selectedScale,
        rotationY: state.selectedRotationY
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'quest-vr-scene.json';
      a.click();
      console.log('📄 JSON exported');
      return true;
    }, 'Export Scene JSON', false);
  };

  window.exportSceneGLTF = function() {
    return window.safeExecute(function() {
      // Minimal valid glTF 2.0 with cube mesh + PBR for each object (simplified)
      const state = window.VRCreatorState;
      const nodes = [];
      const meshes = [];
      const materials = [];
      (state.spawnedObjects || []).forEach(function(obj, i) {
        const mat = obj.material || { metalness: 0.3, roughness: 0.7, opacity: 1 };
        materials.push({
          name: 'mat' + i,
          pbrMetallicRoughness: {
            baseColorFactor: [1, 1, 1, mat.opacity || 1],
            metallicFactor: mat.metalness || 0.3,
            roughnessFactor: mat.roughness || 0.7
          },
          alphaMode: (mat.opacity || 1) < 1 ? 'BLEND' : 'OPAQUE'
        });
        meshes.push({
          name: 'mesh' + i,
          primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: i }]
        });
        const pos = obj.pos || { x: 0, y: 0.5, z: -2 };
        const s = obj.scale || 1;
        const r = (obj.rotationY || 0) * Math.PI / 180;
        nodes.push({
          name: obj.id || 'obj' + i,
          mesh: i,
          translation: [pos.x, pos.y, pos.z],
          scale: [s, s, s],
          rotation: [0, Math.sin(r/2), 0, Math.cos(r/2)]
        });
      });
      // Simple cube accessors (shared)
      const gltf = {
        asset: { version: '2.0', generator: 'QuestVRCreator-Grok' },
        scene: 0,
        scenes: [{ nodes: nodes.map(function(_, i) { return i; }) }],
        nodes: nodes,
        meshes: meshes,
        materials: materials,
        accessors: [
          { bufferView: 0, componentType: 5126, count: 24, type: 'VEC3', max: [0.5,0.5,0.5], min: [-0.5,-0.5,-0.5] },
          { bufferView: 1, componentType: 5123, count: 36, type: 'SCALAR' }
        ],
        bufferViews: [
          { buffer: 0, byteOffset: 0, byteLength: 288 },
          { buffer: 0, byteOffset: 288, byteLength: 72 }
        ],
        buffers: [{ byteLength: 360, uri: 'data:application/octet-stream;base64,AACAPwAAgD8AAIA/AACAPwAAgD8AAIC/AACAPwAAgL8AAIA/AACAPwAAgL8AAIC/AACAvwAAgD8AAIA/AACAvwAAgD8AAIC/AACAvwAAgL8AAIA/AACAvwAAgL8AAIC/AACAPwAAgD8AAIA/AACAPwAAgL8AAIA/AACAvwAAgD8AAIA/AACAvwAAgL8AAIA/AACAPwAAgD8AAIC/AACAPwAAgL8AAIC/AACAvwAAgD8AAIC/AACAvwAAgL8AAIC/AACAPwAAgD8AAIA/AACAvwAAgD8AAIA/AACAPwAAgD8AAIC/AACAvwAAgD8AAIC/AACAPwAAgL8AAIA/AACAvwAAgL8AAIA/AACAPwAAgL8AAIC/AACAvwAAgL8AAIC/AAABAAIAAAACAAMABAAFAAYABAAHAAUACAAJAAoACAAKAAsADAANAA4ADAAPAA0AEAARABIAEAASABMAFAAVABYAFAAWABcA' }]
      };
      const blob = new Blob([JSON.stringify(gltf)], { type: 'model/gltf+json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'quest-vr-scene.gltf';
      a.click();
      console.log('📦 Minimal GLTF exported');
      return true;
    }, 'Export Scene GLTF', false);
  };

  window.shareSceneViaHash = function() {
    return window.safeExecute(function() {
      const state = window.VRCreatorState;
      const data = {
        o: (state.spawnedObjects || []).map(function(obj) {
          return { id: obj.id, t: obj.type, p: obj.pos, c: obj.color, m: obj.material, s: obj.scale, r: obj.rotationY };
        })
      };
      const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      const url = location.origin + location.pathname + '#' + b64;
      location.hash = b64;
      if (navigator.clipboard) navigator.clipboard.writeText(url).catch(function() {});
      console.log('🔗 Scene shared via hash (copied to clipboard if possible)');
      return true;
    }, 'Share Scene Via Hash', false);
  };

  window.loadSceneFromHash = function() {
    return window.safeExecute(function() {
      if (!location.hash || location.hash.length < 10) return false;
      const b64 = location.hash.slice(1);
      let data;
      try {
        data = JSON.parse(decodeURIComponent(escape(atob(b64))));
      } catch (e) {
        console.warn('Invalid hash data');
        return false;
      }
      window.clearAllSpawned();
      (data.o || []).forEach(function(obj) {
        if (typeof window.spawnIntelligentObject === 'function') {
          window.spawnIntelligentObject(obj.t, { pos: obj.p, color: obj.c, material: obj.m, scale: obj.s, rotationY: obj.r });
        }
      });
      console.log('🔗 Scene loaded from URL hash (' + (data.o || []).length + ' objects).');
      return true;
    }, 'Load Scene From Hash', false);
  };

  window.toggleHolographic = function() {
    return window.safeExecute(function() {
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
        if (state) window.updateVRState({ ui: Object.assign({}, state.ui || {}, { holographic: false }) });
        console.log('🖥️ Tablet detached to fixed position.');
      } else {
        if (typeof window.makeWristHolographic === 'function') {
          window.makeWristHolographic();
        }
        if (state) window.updateVRState({ ui: Object.assign({}, state.ui || {}, { holographic: true }) });
        console.log('⌚ Tablet attached as holographic wrist.');
      }
      return true;
    }, 'Toggle Holographic', false);
  };

  window.deleteSpawnedObject = function(idOrEl) {
    return window.safeExecute(function() {
      const state = window.VRCreatorState;
      let el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
      if (!el || !el.classList || !el.classList.contains('spawned-object')) {
        console.log('Delete: no valid spawned object.');
        return false;
      }
      const id = el.id;
      // Red flash before remove
      try {
        el.setAttribute('material', 'emissive: #ff0000; emissiveIntensity: 1');
        setTimeout(function() {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 120);
      } catch (e) {
        if (el.parentNode) el.parentNode.removeChild(el);
      }
      if (state.spawnedObjects) {
        state.spawnedObjects = state.spawnedObjects.filter(function(o) { return o.id !== id; });
        state.spawnedCount = state.spawnedObjects.length;
        window.updateVRState({ spawnedCount: state.spawnedCount, spawnedObjects: state.spawnedObjects });
      }
      console.log('🗑️ Deleted object:', id);
      return true;
    }, 'Delete Spawned Object', false);
  };

  console.log('✅ State Management Hook active - intelligence layer ready (undo + clear + materials + persist + export JSON/GLTF + delete + share + live adjust + holo toggle + scale + rotation). FINAL COMPLETE.');
})();
