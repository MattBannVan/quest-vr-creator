/**
 * State Management Hook for Quest VR Creator
 * Purpose: Centralized, intelligent app state for tracking tools, spawned objects, UI, user actions.
 * Enables features like undo, stats, persistence (future localStorage), tool switching.
 * Less errors: validated updates, change events for reactive UI.
 * More intelligence: queryable history, counts, easy extension.
 * Tested: Syntax valid.
 */

(function() {
  'use strict';

  // Initialize or enhance global state
  if (!window.VRCreatorState) {
    window.VRCreatorState = {
      selectedTool: 'cube',
      spawnedCount: 0,
      lastSpawnPos: null,
      spawnedObjects: [], // array of {id, type, pos, timestamp?}
      tools: ['cube', 'sphere', 'cylinder'], // extensible
      ui: {
        tabletVisible: true,
        lastInteraction: null
      },
      sessionStart: Date.now()
    };
    console.log('✅ VRCreatorState initialized via hook.');
  }

  // Intelligent state updater with validation and event dispatch (for reactive components)
  window.updateVRState = function(updates) {
    if (!window.VRCreatorState || typeof updates !== 'object') {
      console.warn('State update skipped: invalid input');
      return false;
    }
    try {
      const prevState = JSON.parse(JSON.stringify(window.VRCreatorState)); // shallow snapshot
      Object.assign(window.VRCreatorState, updates);
      
      // Emit custom event for any listeners (e.g. UI updates on tablet)
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

  // Example: tool change
  window.selectTool = function(newTool) {
    if (window.VRCreatorState.tools.includes(newTool)) {
      window.updateVRState({ selectedTool: newTool });
      console.log(`🛠️ Tool selected: ${newTool}`);
    } else {
      console.warn(`Tool '${newTool}' not available. Available:`, window.VRCreatorState.tools);
    }
  };

  // Future: undo last spawn using history
  window.undoLastSpawn = function() {
    const state = window.VRCreatorState;
    if (state.spawnedObjects && state.spawnedObjects.length > 0) {
      const last = state.spawnedObjects.pop();
      const el = document.getElementById(last.id) || document.querySelector(`[position="${last.pos}"]`); // rough match
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
        state.spawnedCount = Math.max(0, state.spawnedCount - 1);
        console.log('↩️ Undid last spawn:', last);
        window.updateVRState({}); // trigger event
      }
    } else {
      console.log('Nothing to undo.');
    }
  };

  console.log('✅ State Management Hook active - intelligence layer for VR Creator ready.');
})();