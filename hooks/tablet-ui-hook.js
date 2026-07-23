/**
 * Tablet UI Hook for Quest VR Creator
 * Purpose: Dynamic, intelligent management of the 3D tablet UI for tool selection and object creation.
 * Allows adding multiple spawn buttons programmatically, updating title/stats.
 * Reduces errors by validating entities before manipulation.
 * Intelligence: Reactive to state changes, easy to extend for new tools/colors.
 * Usage: Call initTabletUI() on load, or use components.
 * Tested: Syntax OK.
 */

(function() {
  'use strict';

  // Safe helper to get or create tablet entity
  function getTablet() {
    let tablet = document.querySelector('#tablet');
    if (!tablet) {
      console.warn('Tablet not found, creating fallback...');
      const scene = document.querySelector('a-scene');
      if (scene) {
        tablet = document.createElement('a-entity');
        tablet.id = 'tablet';
        tablet.setAttribute('position', '0 1.2 -1');
        tablet.setAttribute('geometry', 'primitive: plane; width: 0.8; height: 0.6');
        tablet.setAttribute('material', 'color: #222288; shader: flat');
        tablet.setAttribute('class', 'raycaster-target');
        scene.appendChild(tablet);
      }
    }
    return tablet;
  }

  // Update tablet title or add status text
  window.updateTabletUI = function(titleText = 'Object Creator', statsText = '') {
    return window.safeExecute(() => {
      const tablet = getTablet();
      if (!tablet) return false;

      let title = document.querySelector('#tablet-title');
      if (!title) {
        title = document.createElement('a-text');
        title.id = 'tablet-title';
        title.setAttribute('position', '0 0.2 0.01');
        title.setAttribute('align', 'center');
        title.setAttribute('color', '#FFFFFF');
        title.setAttribute('width', '0.7');
        tablet.appendChild(title);
      }
      title.setAttribute('value', titleText);

      // Optional stats line
      let stats = document.querySelector('#tablet-stats');
      if (statsText) {
        if (!stats) {
          stats = document.createElement('a-text');
          stats.id = 'tablet-stats';
          stats.setAttribute('position', '0 -0.15 0.01');
          stats.setAttribute('align', 'center');
          stats.setAttribute('color', '#88FFAA');
          stats.setAttribute('width', '0.65');
          tablet.appendChild(stats);
        }
        stats.setAttribute('value', statsText);
      }
      return true;
    }, 'Update Tablet UI');
  };

  // Dynamically add a spawn button to tablet
  // @param {string} id, type, label, color, position e.g. {x: -0.2, y:0 }
  window.addSpawnButtonToTablet = function(config) {
    return window.safeExecute(() => {
      const tablet = getTablet();
      if (!tablet) return null;

      const btn = document.createElement('a-entity');
      btn.id = config.id || `btn-${config.type || 'cube'}`;
      const posX = config.position && config.position.x !== undefined ? config.position.x : -0.2;
      const posY = config.position && config.position.y !== undefined ? config.position.y : 0;
      btn.setAttribute('position', `${posX} ${posY} 0.01`);
      btn.setAttribute('geometry', 'primitive: box; width: 0.15; height: 0.15; depth: 0.05');
      btn.setAttribute('material', `color: ${config.color || '#4CC3D9'}`);
      btn.setAttribute('class', 'raycaster-target');
      
      // Attach spawn intelligence
      btn.setAttribute('spawn-button', `type: ${config.type || 'cube'}; color: ${config.color || ''}`);
      
      // Optional label text on button
      if (config.label) {
        const label = document.createElement('a-text');
        label.setAttribute('value', config.label);
        label.setAttribute('position', '0 0 0.06');
        label.setAttribute('align', 'center');
        label.setAttribute('color', '#FFFFFF');
        label.setAttribute('width', '0.14');
        label.setAttribute('scale', '0.5 0.5 0.5');
        btn.appendChild(label);
      }

      tablet.appendChild(btn);
      console.log(`✅ Added spawn button for ${config.type} to tablet`);
      return btn;
    }, 'Add Spawn Button to Tablet');
  };

  // Initialize default multi-tool tablet UI (call on load)
  window.initTabletUI = function() {
    return window.safeExecute(() => {
      const tablet = getTablet();
      if (!tablet) return;

      // Clear existing dynamic children except title (simple approach)
      const existingButtons = tablet.querySelectorAll('[spawn-button], [id^="btn-"]');
      existingButtons.forEach(el => el.parentNode && el.parentNode.removeChild(el));

      // Add multiple tool buttons intelligently positioned
      const tools = [
        { type: 'cube', color: '#FFCC00', label: 'C', x: -0.25 },
        { type: 'sphere', color: '#EF2D5E', label: 'S', x: 0 },
        { type: 'cylinder', color: '#4CC3D9', label: 'Y', x: 0.25 }
      ];

      tools.forEach((tool, i) => {
        window.addSpawnButtonToTablet({
          id: `btn-${tool.type}`,
          type: tool.type,
          color: tool.color,
          label: tool.label,
          position: { x: tool.x, y: 0 }
        });
      });

      // Update title and initial stats from state
      const state = window.VRCreatorState || {};
      window.updateTabletUI(
        'Object Creator', 
        `Spawned: ${state.spawnedCount || 0} | Tool: ${state.selectedTool || 'cube'}`
      );

      // Listen for state changes to auto-update stats
      document.addEventListener('vr-state-changed', (e) => {
        const s = e.detail.current || window.VRCreatorState;
        if (s) {
          window.updateTabletUI('Object Creator', `Spawned: ${s.spawnedCount || 0} | Tool: ${s.selectedTool || 'cube'}`);
        }
      });

      console.log('✅ Tablet UI initialized with multi-tool support and reactive stats.');
    }, 'Init Tablet UI');
  };

  console.log('✅ Tablet UI Hook loaded - dynamic, intelligent 3D interface ready.');
})();