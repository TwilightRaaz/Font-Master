/**
 * Font Master - Centralized Reactive State Store with History & Subscriptions.
 */

import { GRADIENT_PRESETS, SHADOW_PRESETS } from './presets.js';

class StateStore {
  constructor() {
    this.state = this.getDefaultState();
    this.listeners = new Set();
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 40;
    this.isHistoryAction = false;
    
    // Save initial state snapshot
    this.saveSnapshot();
  }

  getDefaultState() {
    return {
      text: 'FONT MASTER\nSTUDIO TYPOGRAPHY',
      fontSource: 'preset',
      fontFamily: 'Inter',
      fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
      fontFileName: '',
      fontBuffer: null,
      parsedFont: null,
      fontMetadata: {
        family: 'Inter',
        subfamily: 'Bold',
        designer: 'Rasmus Andersson',
        version: '4.1',
        glyphCount: 2500,
        unitsPerEm: 2048,
        isVariable: true,
        axes: {
          wght: { tag: 'wght', name: 'Weight', min: 100, max: 900, default: 700 }
        }
      },
      // Typography
      fontSize: 64,
      fontWeight: 800,
      fontStyle: 'normal',
      fontStretch: '100%',
      fontVariant: 'normal',
      fontDisplay: 'swap',
      fontOpticalSizing: 'auto',
      fontSmoothing: 'antialiased',
      textRendering: 'optimizeLegibility',
      lineHeight: 1.15,
      letterSpacing: 2,
      wordSpacing: 0,
      paragraphSpacing: 28,
      kerning: 'normal',
      textTransform: 'none',
      textAlign: 'center',
      verticalAlign: 'center',
      textIndent: 0,
      whiteSpace: 'pre-wrap',
      textOverflow: 'clip',
      writingMode: 'horizontal-tb',
      textOrientation: 'mixed',
      
      // Color & Fill
      colorMode: 'linear-gradient',
      color: '#ffffff',
      gradient: JSON.parse(JSON.stringify(GRADIENT_PRESETS[0])),
      opacity: 1.0,
      
      // Stroke & Outline
      stroke: {
        enabled: false,
        width: 2,
        color: '#00f0ff',
        join: 'round',
        order: 'stroke-first'
      },
      
      // Text Decoration
      decoration: {
        line: 'none',
        style: 'solid',
        color: '#ffffff',
        thickness: 2,
        offset: 4
      },
      
      // Text Shadows
      shadows: JSON.parse(JSON.stringify(SHADOW_PRESETS[1].layers)),
      
      // OpenType Features
      fontFeatureSettings: {
        liga: true,
        dlig: false,
        kern: true,
        smcp: false,
        c2sc: false,
        zero: false,
        frac: false,
        calt: true,
        tnum: false,
        onum: false,
        ss01: false,
        ss02: false
      },
      
      // Variable Font Axes
      fontVariationSettings: {
        wght: 800
      },
      
      // Drop Cap
      dropCap: {
        enabled: false,
        lines: 3,
        color: '#00f0ff',
        weight: 900,
        margin: 12
      },
      
      // Micro Adjustments
      microAdjust: {
        baselineShift: 0,
        scaleX: 100,
        scaleY: 100,
        slant: 0,
        rotate: 0
      },
      
      // Canvas & Artboard
      canvas: {
        aspectRatio: 'auto',
        width: 1200,
        height: 630,
        padding: 60,
        backgroundMode: 'checkerboard',
        backgroundColor: '#090b10',
        backgroundGradient: {
          angle: 135,
          stops: [
            { offset: 0, color: '#0f172a' },
            { offset: 100, color: '#020617' }
          ]
        },
        zoom: 1.0,
        showRulers: true
      },
      
      // Export Settings
      export: {
        format: 'png',
        scale: 2,
        quality: 0.95,
        vectorFormat: 'paths', // 'paths' (converted outlines) | 'embedded' (font base64)
        fileName: 'font-master-export'
      }
    };
  }

  get(key) {
    return this.state[key];
  }

  set(key, value, recordHistory = true) {
    if (this.state[key] === value) return;
    this.state[key] = value;
    if (recordHistory && !this.isHistoryAction) {
      this.saveSnapshot();
    }
    this.notify(key);
  }

  update(partialState, recordHistory = true) {
    Object.assign(this.state, partialState);
    if (recordHistory && !this.isHistoryAction) {
      this.saveSnapshot();
    }
    this.notify(Object.keys(partialState));
  }

  updateNested(path, value, recordHistory = true) {
    const keys = path.split('.');
    let obj = this.state;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    
    if (recordHistory && !this.isHistoryAction) {
      this.saveSnapshot();
    }
    this.notify(keys[0]);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(changedKeys) {
    for (const listener of this.listeners) {
      try {
        listener(this.state, changedKeys);
      } catch (err) {
        console.error('Listener notification error:', err);
      }
    }
  }

  saveSnapshot() {
    // Exclude heavy binary buffers from history to conserve memory
    const snapshot = JSON.parse(JSON.stringify(this.state, (key, value) => {
      if (key === 'fontBuffer' || key === 'parsedFont') return undefined;
      return value;
    }));

    // If in the middle of history, prune forward entries
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(snapshot);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.isHistoryAction = true;
      this.historyIndex--;
      const snapshot = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      // Preserve current font buffers
      snapshot.fontBuffer = this.state.fontBuffer;
      snapshot.parsedFont = this.state.parsedFont;
      this.state = snapshot;
      this.isHistoryAction = false;
      this.notify('undo');
      return true;
    }
    return false;
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.isHistoryAction = true;
      this.historyIndex++;
      const snapshot = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      snapshot.fontBuffer = this.state.fontBuffer;
      snapshot.parsedFont = this.state.parsedFont;
      this.state = snapshot;
      this.isHistoryAction = false;
      this.notify('redo');
      return true;
    }
    return false;
  }

  canUndo() {
    return this.historyIndex > 0;
  }

  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }
}

export const store = new StateStore();
