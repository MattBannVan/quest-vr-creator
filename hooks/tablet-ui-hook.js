/**
 * Tablet UI Hook for Quest VR Creator
 * Purpose: Dynamic, intelligent management of the 3D tablet UI for tool selection and object creation.
 * Allows adding multiple spawn buttons programmatically, updating title/stats, action buttons (undo/clear/save/load/export/mat + GLTF/SHARE/HOLO/M+/R+/APPLY/S±/ROT+).
 * Supports more primitives (cone, torus), reactive stats, consistent design, holographic wrist variant + toggle.
 * Reduces errors by validating entities before manipulation.
 * Intelligence: Reactive to state changes, easy to extend for new tools/colors/actions/materials/share/GLTF/scale/rot.
 * Usage: Call initTabletUI() on load, or use components. Call makeWristHolographic() for vision alignment. Toggle with HOLO.
 * FINAL 2026-08-22: Restored for complete project freeze. Grok's best.
 */

(function() {
  'use strict';

  function getTablet() {
    let tablet = document.querySelector('#tablet');
    if (!tablet) {
      console.warn('Tablet not found, creating fallback...');
      const scene = document.querySelector('a-scene');
      if (scene) {
        tablet = document.createElement('a-entity');
        tablet.id = 'tablet';
        tablet.setAttribute('position', '0 1.25 -0.9');
        tablet.setAttribute('geometry', 'primitive: plane; width: 0.95; height: 1.12');
        tablet.setAttribute('material', 'color: #1a1a44; shader: flat; opacity: 0.92; transparent: true');
        tablet.setAttribute('class', 'raycaster-target');
        scene.appendChild(tablet);
      }
    }
    return tablet;
  }

  window.updateTabletUI = function(titleText, statsText) {
    return window.safeExecute(function() {
      const tablet = getTablet();
      if (!tablet) return false;
      titleText = titleText || 'Object Creator';
      statsText = statsText || '';

      let title = document.querySelector('#tablet-title');
      if (!title) {
        title = document.createElement('a-text');
        title.id = 'tablet-title';
        title.setAttribute('position', '0 0.48 0.01');
        title.setAttribute('align', 'center');
        title.setAttribute('color', '#FFFFFF');
        title.setAttribute('width', '0.9');
        title.setAttribute('value', titleText);
        tablet.appendChild(title);
      } else {
        title.setAttribute('value', titleText);
      }

      let stats = document.querySelector('#tablet-stats');
      if (!stats) {
        stats = document.createElement('a-text');
        stats.id = 'tablet-stats';
        stats.setAttribute('position', '0 0.38 0.01');
        stats.setAttribute('align', 'center');
        stats.setAttribute('color', '#00E5FF');
        stats.setAttribute('width', '1.1');
        stats.setAttribute('value', statsText);
        tablet.appendChild(stats);
      } else {
        stats.setAttribute('value', statsText);
      }
      return true;
    }, 'Update Tablet UI', false);
  };

  window.addSpawnButtonToTablet = function(config) {
    return window.safeExecute(function() {
      const tablet = getTablet();
      if (!tablet || !config) return false;
      const id = config.id || ('spawn-' + config.type);
      if (document.getElementById(id)) return true;
      const btn = document.createElement('a-entity');
      btn.id = id;
      btn.setAttribute('geometry', 'primitive: plane; width: ' + (config.width || 0.15) + '; height: 0.12');
      btn.setAttribute('material', 'color: ' + (config.color || '#4CC3D9') + '; shader: flat; opacity: 0.9');
      btn.setAttribute('position', (config.position.x || 0) + ' ' + (config.position.y || 0) + ' 0.02');
      btn.setAttribute('class', 'raycaster-target spawn-button');
      btn.setAttribute('spawn-button', 'type: ' + config.type);
      const label = document.createElement('a-text');
      label.setAttribute('value', config.label || config.type.charAt(0).toUpperCase());
      label.setAttribute('align', 'center');
      label.setAttribute('color', '#fff');
      label.setAttribute('width', '0.6');
      label.setAttribute('position', '0 0 0.01');
      btn.appendChild(label);
      tablet.appendChild(btn);
      return true;
    }, 'Add Spawn Button', false);
  };

  window.addActionButtonToTablet = function(config) {
    return window.safeExecute(function() {
      const tablet = getTablet();
      if (!tablet || !config) return false;
      const id = config.id || ('action-' + config.action);
      if (document.getElementById(id)) return true;
      const btn = document.createElement('a-entity');
      btn.id = id;
      btn.setAttribute('geometry', 'primitive: plane; width: ' + (config.width || 0.14) + '; height: 0.1');
      btn.setAttribute('material', 'color: ' + (config.color || '#888') + '; shader: flat; opacity: 0.9');
      btn.setAttribute('position', (config.position.x || 0) + ' ' + (config.position.y || 0) + ' 0.02');
      btn.setAttribute('class', 'raycaster-target');
      const label = document.createElement('a-text');
      label.setAttribute('value', config.label || config.action);
      label.setAttribute('align', 'center');
      label.setAttribute('color', '#fff');
      label.setAttribute('width', '0.55');
      label.setAttribute('position', '0 0 0.01');
      btn.appendChild(label);
      btn.addEventListener('click', function() { handleAction(config.action); });
      btn.addEventListener('triggerdown', function() { handleAction(config.action); });
      tablet.appendChild(btn);
      return true;
    }, 'Add Action Button', false);
  };

  function handleAction(action) {
    window.safeExecute(function() {
      switch (action) {
        case 'undo': window.undoLastSpawn && window.undoLastSpawn(); break;
        case 'clear': window.clearAllSpawned && window.clearAllSpawned(); break;
        case 'color': 
          const colors = ['#EF2D5E', '#4CC3D9', '#7BC8A4', '#FF9F1C', '#00E5FF', '#9B5DE5'];
          const c = colors[Math.floor(Math.random() * colors.length)];
          window.setSelectedColor && window.setSelectedColor(c);
          break;
        case 'mat': window.setMaterialPreset && window.setMaterialPreset(); break;
        case 'save': window.saveSceneToStorage && window.saveSceneToStorage(); break;
        case 'load': window.loadSceneFromStorage && window.loadSceneFromStorage(); break;
        case 'json': window.exportSceneJSON && window.exportSceneJSON(); break;
        case 'gltf': window.exportSceneGLTF && window.exportSceneGLTF(); break;
        case 'del': 
          const st = window.VRCreatorState;
          if (st && st.spawnedObjects && st.spawnedObjects.length) {
            window.deleteSpawnedObject && window.deleteSpawnedObject(st.spawnedObjects[st.spawnedObjects.length-1].id);
          }
          break;
        case 'share': window.shareSceneViaHash && window.shareSceneViaHash(); break;
        case 'holo': window.toggleHolographic && window.toggleHolographic(); break;
        case 'mplus': window.adjustMaterial && window.adjustMaterial('metalness', 0.1); break;
        case 'mminus': window.adjustMaterial && window.adjustMaterial('metalness', -0.1); break;
        case 'rplus': window.adjustMaterial && window.adjustMaterial('roughness', 0.1); break;
        case 'rminus': window.adjustMaterial && window.adjustMaterial('roughness', -0.1); break;
        case 'oplus': window.adjustMaterial && window.adjustMaterial('opacity', 0.1); break;
        case 'ominus': window.adjustMaterial && window.adjustMaterial('opacity', -0.1); break;
        case 'apply': window.applyMaterialToLast && window.applyMaterialToLast(); break;
        case 'splus': window.adjustScale && window.adjustScale(0.1); window.applyScaleToLast && window.applyScaleToLast(); break;
        case 'sminus': window.adjustScale && window.adjustScale(-0.1); window.applyScaleToLast && window.applyScaleToLast(); break;
        case 'rotplus': window.adjustRotation && window.adjustRotation(15); window.applyRotationToLast && window.applyRotationToLast(); break;
        default: console.log('Unknown action', action);
      }
    }, 'Handle Action ' + action);
  }

  window.makeWristHolographic = function() {
    return window.safeExecute(function() {
      const tablet = getTablet();
      const leftHand = document.querySelector('#leftHand');
      if (!tablet || !leftHand) return false;
      if (tablet.parentNode !== leftHand) {
        if (tablet.parentNode) tablet.parentNode.removeChild(tablet);
        leftHand.appendChild(tablet);
      }
      tablet.setAttribute('position', '0 0.05 -0.15');
      tablet.setAttribute('rotation', '-60 0 0');
      tablet.setAttribute('scale', '0.45 0.45 0.45');
      tablet.setAttribute('material', 'color: #0a2a3a; shader: flat; opacity: 0.85; transparent: true; emissive: #00E5FF; emissiveIntensity: 0.3');
      if (window.VRCreatorState) {
        window.updateVRState({ ui: Object.assign({}, window.VRCreatorState.ui || {}, { holographic: true }) });
      }
      console.log('⌚ Wrist holographic tablet attached');
      return true;
    }, 'Make Wrist Holographic', false);
  };

  window.initTabletUI = function() {
    return window.safeExecute(function() {
      // 5 tool buttons row
      window.addSpawnButtonToTablet({ id: 'spawn-cube', type: 'cube', label: 'C', color: '#EF2D5E', position: { x: -0.36, y: 0.22 }, width: 0.14 });
      window.addSpawnButtonToTablet({ id: 'spawn-sphere', type: 'sphere', label: 'S', color: '#4CC3D9', position: { x: -0.18, y: 0.22 }, width: 0.14 });
      window.addSpawnButtonToTablet({ id: 'spawn-cylinder', type: 'cylinder', label: 'Y', color: '#7BC8A4', position: { x: 0, y: 0.22 }, width: 0.14 });
      window.addSpawnButtonToTablet({ id: 'spawn-cone', type: 'cone', label: 'N', color: '#FF9F1C', position: { x: 0.18, y: 0.22 }, width: 0.14 });
      window.addSpawnButtonToTablet({ id: 'spawn-torus', type: 'torus', label: 'T', color: '#9B5DE5', position: { x: 0.36, y: 0.22 }, width: 0.14 });

      // Action rows
      window.addActionButtonToTablet({ id: 'action-undo', action: 'undo', label: 'UNDO', color: '#E63946', position: { x: -0.34, y: 0.06 }, width: 0.16 });
      window.addActionButtonToTablet({ id: 'action-clear', action: 'clear', label: 'CLEAR', color: '#D62828', position: { x: -0.14, y: 0.06 }, width: 0.16 });
      window.addActionButtonToTablet({ id: 'action-color', action: 'color', label: 'COLOR', color: '#F77F00', position: { x: 0.06, y: 0.06 }, width: 0.16 });
      window.addActionButtonToTablet({ id: 'action-mat', action: 'mat', label: 'MAT', color: '#FCBF49', position: { x: 0.26, y: 0.06 }, width: 0.14 });

      window.addActionButtonToTablet({ id: 'action-save', action: 'save', label: 'SAVE', color: '#2A9D8F', position: { x: -0.34, y: -0.08 }, width: 0.14 });
      window.addActionButtonToTablet({ id: 'action-load', action: 'load', label: 'LOAD', color: '#264653', position: { x: -0.17, y: -0.08 }, width: 0.14 });
      window.addActionButtonToTablet({ id: 'action-json', action: 'json', label: 'JSON', color: '#E9C46A', position: { x: 0, y: -0.08 }, width: 0.14 });
      window.addActionButtonToTablet({ id: 'action-gltf', action: 'gltf', label: 'GLTF', color: '#F4A261', position: { x: 0.17, y: -0.08 }, width: 0.14 });
      window.addActionButtonToTablet({ id: 'action-del', action: 'del', label: 'DEL', color: '#E76F51', position: { x: 0.34, y: -0.08 }, width: 0.12 });

      window.addActionButtonToTablet({ id: 'action-share', action: 'share', label: 'SHARE', color: '#00B4D8', position: { x: -0.34, y: -0.22 }, width: 0.16 });
      window.addActionButtonToTablet({ id: 'action-holo', action: 'holo', label: 'HOLO', color: '#0077B6', position: { x: -0.14, y: -0.22 }, width: 0.14 });
      window.addActionButtonToTablet({ id: 'action-apply', action: 'apply', label: 'APPLY', color: '#90E0EF', position: { x: 0.06, y: -0.22 }, width: 0.16 });
      window.addActionButtonToTablet({ id: 'action-splus', action: 'splus', label: 'S+', color: '#48CAE4', position: { x: 0.26, y: -0.22 }, width: 0.12 });
      window.addActionButtonToTablet({ id: 'action-sminus', action: 'sminus', label: 'S-', color: '#00B4D8', position: { x: 0.38, y: -0.22 }, width: 0.12 });

      // Bottom material + rot row
      window.addActionButtonToTablet({ id: 'action-mplus', action: 'mplus', label: 'M+', color: '#FF006E', position: { x: -0.38, y: -0.36 }, width: 0.12 });
      window.addActionButtonToTablet({ id: 'action-mminus', action: 'mminus', label: 'M-', color: '#FB5607', position: { x: -0.24, y: -0.36 }, width: 0.12 });
      window.addActionButtonToTablet({ id: 'action-rplus', action: 'rplus', label: 'R+', color: '#FFBE0B', position: { x: -0.1, y: -0.36 }, width: 0.12 });
      window.addActionButtonToTablet({ id: 'action-rminus', action: 'rminus', label: 'R-', color: '#FF006E', position: { x: 0.04, y: -0.36 }, width: 0.12 });
      window.addActionButtonToTablet({ id: 'action-oplus', action: 'oplus', label: 'O+', color: '#00B4D8', position: { x: 0.18, y: -0.36 }, width: 0.12 });
      window.addActionButtonToTablet({ id: 'action-ominus', action: 'ominus', label: 'O-', color: '#0077B6', position: { x: 0.32, y: -0.36 }, width: 0.12 });
      window.addActionButtonToTablet({ id: 'action-rotplus', action: 'rotplus', label: 'ROT+', color: '#8338EC', position: { x: 0.46, y: -0.36 }, width: 0.14 });

      // Initial stats
      const state = window.VRCreatorState || {};
      const matInfo = state.materialPreset ? ' | ' + state.materialPreset : '';
      const mVal = state.selectedMaterial ? ' M:' + (state.selectedMaterial.metalness||0).toFixed(1) + ' R:' + (state.selectedMaterial.roughness||0).toFixed(1) + ' O:' + (state.selectedMaterial.opacity||1).toFixed(1) : '';
      const sc = state.selectedScale ? ' Sc:' + (state.selectedScale||1).toFixed(1) : '';
      const rt = state.selectedRotationY !== undefined ? ' Rot:' + Math.round(state.selectedRotationY||0) : '';
      window.updateTabletUI('VR Object Creator', 'Spawned: ' + (state.spawnedCount || 0) + ' | Tool: ' + (state.selectedTool || 'cube') + matInfo + mVal + sc + rt);

      if (!window._tabletStateListener) {
        document.addEventListener('vr-state-changed', function(e) {
          const s = (e.detail && e.detail.current) || window.VRCreatorState;
          if (s) {
            const colorInfo = s.selectedColor ? ' | C:' + s.selectedColor.slice(0,7) : '';
            const matP = s.materialPreset ? ' | ' + s.materialPreset : '';
            const mV = s.selectedMaterial ? ' M:' + (s.selectedMaterial.metalness||0).toFixed(1) + ' R:' + (s.selectedMaterial.roughness||0).toFixed(1) + ' O:' + (s.selectedMaterial.opacity||1).toFixed(1) : '';
            const scV = s.selectedScale ? ' Sc:' + (s.selectedScale||1).toFixed(1) : '';
            const rtV = s.selectedRotationY !== undefined ? ' Rot:' + Math.round(s.selectedRotationY||0) : '';
            window.updateTabletUI('VR Object Creator', 'Spawned: ' + (s.spawnedCount || 0) + ' | Tool: ' + (s.selectedTool || 'cube') + colorInfo + matP + mV + scV + rtV);
          }
        });
        window._tabletStateListener = true;
      }

      console.log('✅ Tablet UI initialized with 5 primitives + full action panel incl. O±/M±/R±/S±/ROT+ + reactive stats + holographic. FINAL COMPLETE.');
    }, 'Init Tablet UI');
  };

  console.log('✅ Tablet UI Hook loaded - dynamic, intelligent 3D interface ready. Project COMPLETE.');
})();
