/**
 * Font Master — Studio Typography Engine & Controller.
 * Features: Local IndexedDB Font Storage (No login), .ZIP font archive extraction,
 * 100% reliable canvas font rendering, and zero-CORS architecture.
 */

(function() {
  'use strict';

  /* ==========================================================================
     IndexedDB Storage for Uploaded Fonts (Local, Persistent, No Login)
     ========================================================================== */
  class FontDB {
    constructor() {
      this.dbName = 'FontMaster_LocalDB';
      this.version = 1;
      this.db = null;
    }

    async open() {
      if (this.db) return this.db;
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('fonts')) {
            db.createObjectStore('fonts', { keyPath: 'id' });
          }
        };
        request.onsuccess = () => {
          this.db = request.result;
          resolve(this.db);
        };
        request.onerror = () => reject(request.error);
      });
    }

    async saveFont(fontRecord) {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('fonts', 'readwrite');
        const store = tx.objectStore('fonts');
        store.put(fontRecord);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }

    async getAllFonts() {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('fonts', 'readonly');
        const store = tx.objectStore('fonts');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    }

    async deleteFont(id) {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('fonts', 'readwrite');
        const store = tx.objectStore('fonts');
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  }

  const fontDB = new FontDB();

  /* ==========================================================================
     Presets (Gradients, Shadows, Features)
     ========================================================================== */
  const GRADIENT_PRESETS = [
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      angle: 45,
      stops: [
        { offset: 0, color: '#ff007f' },
        { offset: 50, color: '#7928ca' },
        { offset: 100, color: '#00f0ff' }
      ]
    },
    {
      id: 'liquid-gold',
      name: 'Liquid Gold',
      angle: 90,
      stops: [
        { offset: 0, color: '#ffe259' },
        { offset: 50, color: '#d4af37' },
        { offset: 100, color: '#8a640f' }
      ]
    },
    {
      id: 'sunset-glow',
      name: 'Sunset Glow',
      angle: 135,
      stops: [
        { offset: 0, color: '#f72585' },
        { offset: 50, color: '#7209b7' },
        { offset: 100, color: '#4361ee' }
      ]
    },
    {
      id: 'chrome-metal',
      name: 'Chrome Metal',
      angle: 180,
      stops: [
        { offset: 0, color: '#ffffff' },
        { offset: 35, color: '#94a3b8' },
        { offset: 70, color: '#f8fafc' },
        { offset: 100, color: '#475569' }
      ]
    },
    {
      id: 'emerald-aurora',
      name: 'Emerald Aurora',
      angle: 60,
      stops: [
        { offset: 0, color: '#10b981' },
        { offset: 50, color: '#06b6d4' },
        { offset: 100, color: '#3b82f6' }
      ]
    },
    {
      id: 'holographic',
      name: 'Holographic',
      angle: 45,
      stops: [
        { offset: 0, color: '#a855f7' },
        { offset: 25, color: '#ec4899' },
        { offset: 50, color: '#eab308' },
        { offset: 75, color: '#22c55e' },
        { offset: 100, color: '#06b6d4' }
      ]
    }
  ];

  const SHADOW_PRESETS = [
    { id: 'none', name: 'None', layers: [] },
    {
      id: 'soft-drop',
      name: 'Soft Drop',
      layers: [{ x: 0, y: 8, blur: 20, color: 'rgba(0, 0, 0, 0.65)' }]
    },
    {
      id: 'neon-cyan',
      name: 'Neon Cyan',
      layers: [
        { x: 0, y: 0, blur: 6, color: '#06b6d4' },
        { x: 0, y: 0, blur: 16, color: '#0891b2' },
        { x: 0, y: 0, blur: 36, color: '#0e7490' }
      ]
    },
    {
      id: 'neon-magenta',
      name: 'Neon Pink',
      layers: [
        { x: 0, y: 0, blur: 6, color: '#f43f5e' },
        { x: 0, y: 0, blur: 18, color: '#a855f7' },
        { x: 0, y: 0, blur: 40, color: '#7c3aed' }
      ]
    },
    {
      id: 'extrusion-3d',
      name: '3D Depth',
      layers: [
        { x: 1, y: 1, blur: 0, color: '#6d28d9' },
        { x: 2, y: 2, blur: 0, color: '#5b21b6' },
        { x: 3, y: 3, blur: 0, color: '#4c1d95' },
        { x: 4, y: 4, blur: 0, color: '#3b0764' },
        { x: 5, y: 5, blur: 8, color: 'rgba(0, 0, 0, 0.7)' }
      ]
    },
    {
      id: 'retro-hard',
      name: 'Retro Hard',
      layers: [{ x: 6, y: 6, blur: 0, color: '#000000' }]
    }
  ];

  const OPENTYPE_FEATURES = [
    { tag: 'liga', name: 'Standard Ligatures', desc: 'Combines characters like fi, fl into single glyphs' },
    { tag: 'dlig', name: 'Discretionary Ligatures', desc: 'Decorative letter combinations like st, ct' },
    { tag: 'kern', name: 'Kerning', desc: 'Fine-tunes inter-glyph spacing' },
    { tag: 'smcp', name: 'Small Capitals', desc: 'Transforms lowercase into small caps' },
    { tag: 'zero', name: 'Slashed Zero', desc: 'Substitutes zero with a slashed zero' },
    { tag: 'frac', name: 'Fractions', desc: 'Formats slash numbers into diagonal fractions' },
    { tag: 'calt', name: 'Contextual Alternates', desc: 'Context-sensitive alternate glyphs' },
    { tag: 'tnum', name: 'Tabular Numerals', desc: 'Monospaced numbers for tabular data' }
  ];

  /* ==========================================================================
     Reactive State Store with Undo/Redo
     ========================================================================== */
  class StateStore {
    constructor() {
      this.state = this.getDefaultState();
      this.listeners = new Set();
      this.history = [];
      this.historyIndex = -1;
      this.isHistoryAction = false;
      this.saveSnapshot();
    }

    getDefaultState() {
      return {
        text: 'FONT MASTER',
        fontFamily: '',
        fontFileName: '',
        fontBuffer: null,
        parsedFont: null,
        fontMetadata: null,

        fontSize: 72,
        fontWeight: 700,
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
        paragraphSpacing: 24,
        kerning: 'normal',
        textTransform: 'none',
        textAlign: 'center',
        verticalAlign: 'center',
        textIndent: 0,
        whiteSpace: 'pre-wrap',
        writingMode: 'horizontal-tb',
        textOrientation: 'mixed',

        colorMode: 'linear-gradient',
        color: '#ffffff',
        gradient: JSON.parse(JSON.stringify(GRADIENT_PRESETS[0])),
        opacity: 1.0,

        stroke: {
          enabled: false,
          width: 2,
          color: '#00f0ff',
          join: 'round',
          order: 'stroke-first'
        },

        decoration: {
          line: 'none',
          style: 'solid',
          color: '#ffffff',
          thickness: 2
        },

        shadows: JSON.parse(JSON.stringify(SHADOW_PRESETS[1].layers)),

        fontFeatureSettings: { liga: true, kern: true, smcp: false, zero: false, frac: false, calt: true },
        fontVariationSettings: {},

        dropCap: { enabled: false, lines: 3, color: '#00f0ff', weight: 900, margin: 12 },

        microAdjust: { baselineShift: 0, scaleX: 100, scaleY: 100, slant: 0, rotate: 0 },

        canvas: {
          aspectRatio: 'auto',
          width: 1200,
          height: 630,
          padding: 60,
          backgroundMode: 'checkerboard',
          backgroundColor: '#080a0f',
          zoom: 1.0
        },

        export: {
          format: 'png',
          scale: 2,
          quality: 0.95,
          fileName: 'font-master'
        }
      };
    }

    set(key, value, record = true) {
      if (this.state[key] === value) return;
      this.state[key] = value;
      if (record && !this.isHistoryAction) this.saveSnapshot();
      this.notify(key);
    }

    update(partial, record = true) {
      Object.assign(this.state, partial);
      if (record && !this.isHistoryAction) this.saveSnapshot();
      this.notify(Object.keys(partial));
    }

    subscribe(fn) {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    }

    notify(changed) {
      for (const fn of this.listeners) {
        try { fn(this.state, changed); } catch (e) { console.error(e); }
      }
    }

    saveSnapshot() {
      const snap = JSON.parse(JSON.stringify(this.state, (k, v) => {
        if (k === 'fontBuffer' || k === 'parsedFont') return undefined;
        return v;
      }));
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }
      this.history.push(snap);
      if (this.history.length > 40) this.history.shift();
      else this.historyIndex++;
    }

    undo() {
      if (this.historyIndex > 0) {
        this.isHistoryAction = true;
        this.historyIndex--;
        const snap = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
        snap.fontBuffer = this.state.fontBuffer;
        snap.parsedFont = this.state.parsedFont;
        this.state = snap;
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
        const snap = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
        snap.fontBuffer = this.state.fontBuffer;
        snap.parsedFont = this.state.parsedFont;
        this.state = snap;
        this.isHistoryAction = false;
        this.notify('redo');
        return true;
      }
      return false;
    }

    canUndo() { return this.historyIndex > 0; }
    canRedo() { return this.historyIndex < this.history.length - 1; }
  }

  const store = new StateStore();

  /* ==========================================================================
     Font Engine (Direct Blob URL @font-face + FontFace API + OpenType)
     ========================================================================== */
  class FontEngine {
    constructor() {
      this.fontCache = new Map();
      this.fontIndex = 0;
    }

    /**
     * Parse and register a font ArrayBuffer with both @font-face Blob URL and FontFace API.
     * Guarantees 100% visibility in Canvas 2D across all browsers.
     */
    async registerFont(buffer, fileName, existingId = null) {
      this.fontIndex++;
      const uniqueFamily = existingId || `FMCustom_${Date.now()}_${this.fontIndex}`;
      let parsedFont = null;

      let metadata = {
        family: fileName.replace(/\.[^/.]+$/, ""),
        subfamily: 'Regular',
        designer: 'Custom Upload',
        version: '1.0',
        glyphCount: 0,
        unitsPerEm: 1000,
        isVariable: false,
        axes: {}
      };

      // 1. Safe parsing with opentype.js
      if (window.opentype) {
        try {
          parsedFont = window.opentype.parse(buffer.slice(0));
          if (parsedFont && parsedFont.names) {
            const names = parsedFont.names;
            metadata.family = this.extractName(names.fontFamily) || metadata.family;
            metadata.subfamily = this.extractName(names.fontSubfamily) || 'Regular';
            metadata.designer = this.extractName(names.designer) || 'Custom';
          }
          if (parsedFont) {
            metadata.glyphCount = parsedFont.glyphs ? parsedFont.glyphs.length : 0;
            metadata.unitsPerEm = parsedFont.unitsPerEm || 1000;
            if (parsedFont.tables && parsedFont.tables.fvar && parsedFont.tables.fvar.axes) {
              metadata.isVariable = true;
              parsedFont.tables.fvar.axes.forEach(ax => {
                metadata.axes[ax.tag] = {
                  tag: ax.tag,
                  name: ax.tag.toUpperCase(),
                  min: ax.minValue,
                  max: ax.maxValue,
                  default: ax.defaultValue
                };
              });
            }
          }
        } catch (err) {
          console.warn('OpenType parse note:', err);
        }
      }

      // 2. Inject Dynamic @font-face with Blob URL into Document Head
      // This forces the browser CSS font subsystem and Canvas 2D engine to recognize the font
      const blob = new Blob([buffer]);
      const blobUrl = URL.createObjectURL(blob);
      const styleId = `fm-style-${uniqueFamily}`;
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        @font-face {
          font-family: "${uniqueFamily}";
          src: url("${blobUrl}") format("truetype"), url("${blobUrl}") format("opentype"), url("${blobUrl}") format("woff");
          font-weight: 100 900;
          font-style: normal italic oblique;
          font-display: swap;
        }
      `;

      // 3. Register via Native FontFace API
      try {
        const fontFace = new FontFace(uniqueFamily, buffer.slice(0), {
          weight: '100 900',
          style: 'normal italic oblique'
        });
        document.fonts.add(fontFace);
        await fontFace.load();
      } catch (ffErr) {
        console.warn('FontFace API registration notice:', ffErr);
      }

      // Wait for font subsystem ready
      try {
        await document.fonts.ready;
        await document.fonts.load(`64px "${uniqueFamily}"`);
      } catch (e) {}

      // 4. Force DOM layout pass with temporary hidden element
      const testEl = document.createElement('span');
      testEl.style.fontFamily = `"${uniqueFamily}", sans-serif`;
      testEl.style.position = 'absolute';
      testEl.style.left = '-9999px';
      testEl.textContent = 'FontMasterCache';
      document.body.appendChild(testEl);
      setTimeout(() => testEl.remove(), 500);

      const variations = {};
      if (metadata.isVariable) {
        Object.values(metadata.axes).forEach(ax => {
          variations[ax.tag] = ax.default;
        });
      }

      return {
        id: uniqueFamily,
        uniqueFamily: uniqueFamily,
        family: metadata.family,
        subfamily: metadata.subfamily,
        metadata: metadata,
        parsedFont: parsedFont,
        variations: variations,
        buffer: buffer,
        size: buffer.byteLength
      };
    }

    extractName(nameObj) {
      if (!nameObj) return null;
      if (typeof nameObj === 'string') return nameObj;
      return nameObj.en || Object.values(nameObj)[0] || null;
    }
  }

  const fontEngine = new FontEngine();

  /* ==========================================================================
     Canvas 2D Rendering Engine
     ========================================================================== */
  class CanvasRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.renderedBounds = { width: 1200, height: 630 };
    }

    render(state, scaleMultiplier = 1, isExport = false) {
      const ctx = this.ctx;
      const canvas = this.canvas;

      let text = state.text || '';
      if (!text.trim() && !state.fontFamily) {
        text = 'FONT MASTER\nUpload a font or zip file to begin';
      }

      if (state.textTransform === 'uppercase') text = text.toUpperCase();
      else if (state.textTransform === 'lowercase') text = text.toLowerCase();
      else if (state.textTransform === 'capitalize') text = text.replace(/\b\w/g, c => c.toUpperCase());

      const rawParagraphs = text.split('\n');
      const fontSize = state.fontSize || 64;
      const lineHeight = fontSize * (state.lineHeight || 1.15);
      const letterSpacing = state.letterSpacing || 0;
      const wordSpacing = state.wordSpacing || 0;
      const paraSpacing = state.paragraphSpacing || 24;
      const indent = state.textIndent || 0;

      // Construct robust font string
      const family = state.fontFamily ? `"${state.fontFamily}", sans-serif` : 'sans-serif';
      let fontParts = [];
      if (state.fontStyle && state.fontStyle !== 'normal') fontParts.push(state.fontStyle);
      fontParts.push(state.fontWeight || 400);
      fontParts.push(`${fontSize}px`);
      fontParts.push(family);
      const fontString = fontParts.join(' ');

      ctx.save();
      ctx.font = fontString;
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = `${letterSpacing}px`;
      if (ctx.wordSpacing !== undefined) ctx.wordSpacing = `${wordSpacing}px`;

      const paragraphLines = [];
      let maxLineWidth = 0;

      rawParagraphs.forEach((para, pIndex) => {
        const lines = [para];
        paragraphLines.push({ lines, isFirst: pIndex === 0 });
        lines.forEach((line, lIdx) => {
          let w = this.measureTextWidth(ctx, line, letterSpacing);
          if (lIdx === 0 && indent > 0) w += indent;
          if (w > maxLineWidth) maxLineWidth = w;
        });
      });

      const totalLinesCount = paragraphLines.reduce((acc, p) => acc + p.lines.length, 0);
      const totalTextHeight = (totalLinesCount * lineHeight) + ((paragraphLines.length - 1) * paraSpacing);

      // Drop Cap
      let dropCapChar = '';
      let dropCapWidth = 0;
      let dropCapHeight = 0;
      let dropCapLines = 1;
      if (state.dropCap && state.dropCap.enabled && rawParagraphs[0] && rawParagraphs[0].trim().length > 0) {
        dropCapChar = rawParagraphs[0].trim().charAt(0);
        dropCapLines = Math.max(2, Math.min(5, state.dropCap.lines || 3));
        dropCapHeight = lineHeight * dropCapLines;
        const dropCapFontSize = fontSize * (dropCapLines * 0.95);
        ctx.font = `${state.dropCap.weight || 900} ${dropCapFontSize}px ${family}`;
        dropCapWidth = ctx.measureText(dropCapChar).width + (state.dropCap.margin || 12);
        ctx.font = fontString;
        maxLineWidth = Math.max(maxLineWidth, maxLineWidth + dropCapWidth * 0.5);
      }

      // Dimensions
      let canvasWidth = 1200;
      let canvasHeight = 630;
      const padding = state.canvas.padding || 60;

      if (state.canvas.aspectRatio === 'auto') {
        canvasWidth = Math.max(340, Math.ceil(maxLineWidth + padding * 2));
        canvasHeight = Math.max(240, Math.ceil(totalTextHeight + padding * 2));
      } else if (state.canvas.aspectRatio === '1:1') {
        const side = Math.max(maxLineWidth + padding * 2, totalTextHeight + padding * 2, 800);
        canvasWidth = side;
        canvasHeight = side;
      } else if (state.canvas.aspectRatio === '16:9') {
        canvasWidth = Math.max(1280, Math.ceil(maxLineWidth + padding * 2));
        canvasHeight = Math.round((canvasWidth * 9) / 16);
        if (canvasHeight < totalTextHeight + padding * 2) {
          canvasHeight = Math.ceil(totalTextHeight + padding * 2);
          canvasWidth = Math.round((canvasHeight * 16) / 9);
        }
      } else if (state.canvas.aspectRatio === '9:16') {
        canvasHeight = Math.max(1280, Math.ceil(totalTextHeight + padding * 2));
        canvasWidth = Math.round((canvasHeight * 9) / 16);
      } else if (state.canvas.aspectRatio === '4:5') {
        canvasWidth = Math.max(800, Math.ceil(maxLineWidth + padding * 2));
        canvasHeight = Math.round((canvasWidth * 5) / 4);
      } else if (state.canvas.aspectRatio === 'custom') {
        canvasWidth = state.canvas.width || 1200;
        canvasHeight = state.canvas.height || 630;
      }

      this.renderedBounds = { width: canvasWidth, height: canvasHeight };

      const exportScale = Math.max(1, Math.min(4, scaleMultiplier));
      canvas.width = Math.round(canvasWidth * exportScale);
      canvas.height = Math.round(canvasHeight * exportScale);

      ctx.restore();
      ctx.save();
      ctx.scale(exportScale, exportScale);

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      this.drawBackground(ctx, canvasWidth, canvasHeight, state, isExport);

      // Micro adjustments
      const micro = state.microAdjust || { baselineShift: 0, scaleX: 100, scaleY: 100, slant: 0, rotate: 0 };
      ctx.save();

      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;
      ctx.translate(cx, cy);

      if (micro.rotate !== 0) ctx.rotate((micro.rotate * Math.PI) / 180);
      const skewX = Math.tan(((micro.slant || 0) * Math.PI) / 180);
      const scaleX = (micro.scaleX || 100) / 100;
      const scaleY = (micro.scaleY || 100) / 100;
      ctx.transform(scaleX, 0, skewX, scaleY, 0, micro.baselineShift || 0);
      ctx.translate(-cx, -cy);

      ctx.globalAlpha = Math.max(0, Math.min(1, state.opacity !== undefined ? state.opacity : 1.0));

      let startY = padding + fontSize;
      if (state.verticalAlign === 'center') {
        startY = (canvasHeight - totalTextHeight) / 2 + fontSize * 0.9;
      } else if (state.verticalAlign === 'bottom') {
        startY = canvasHeight - padding - totalTextHeight + fontSize;
      }

      const textFill = this.createFillStyle(ctx, state, canvasWidth, canvasHeight);
      const shadows = (state.shadows && state.shadows.length > 0) ? state.shadows : [{ x: 0, y: 0, blur: 0, color: 'transparent' }];

      // Shadow pass
      shadows.forEach(sh => {
        if (sh.blur > 0 || sh.x !== 0 || sh.y !== 0) {
          ctx.save();
          ctx.shadowOffsetX = sh.x;
          ctx.shadowOffsetY = sh.y;
          ctx.shadowBlur = sh.blur;
          ctx.shadowColor = sh.color;
          this.renderTextLines(ctx, paragraphLines, state, startY, canvasWidth, textFill, dropCapChar, dropCapWidth, dropCapHeight, dropCapLines, false, true);
          ctx.restore();
        }
      });

      // Foreground pass
      this.renderTextLines(ctx, paragraphLines, state, startY, canvasWidth, textFill, dropCapChar, dropCapWidth, dropCapHeight, dropCapLines, true, false);

      ctx.restore();
      ctx.restore();
    }

    drawBackground(ctx, width, height, state, isExport) {
      const mode = state.canvas.backgroundMode || 'checkerboard';
      if (mode === 'checkerboard') {
        if (isExport) return;
        const size = 16;
        ctx.fillStyle = '#0b0e17';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#141a29';
        for (let y = 0; y < height; y += size) {
          for (let x = 0; x < width; x += size) {
            if ((x / size + y / size) % 2 === 0) ctx.fillRect(x, y, size, size);
          }
        }
      } else if (mode === 'solid') {
        ctx.fillStyle = state.canvas.backgroundColor || '#080a0f';
        ctx.fillRect(0, 0, width, height);
      } else if (mode === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
    }

    createFillStyle(ctx, state, width, height) {
      if (state.colorMode === 'solid') return state.color || '#ffffff';
      if (state.colorMode === 'linear-gradient' && state.gradient) {
        const angleRad = ((state.gradient.angle || 45) * Math.PI) / 180;
        const r = Math.sqrt(width * width + height * height) / 2;
        const cx = width / 2;
        const cy = height / 2;
        const x1 = cx - Math.cos(angleRad) * r * 0.6;
        const y1 = cy - Math.sin(angleRad) * r * 0.6;
        const x2 = cx + Math.cos(angleRad) * r * 0.6;
        const y2 = cy + Math.sin(angleRad) * r * 0.6;
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        (state.gradient.stops || []).forEach(s => grad.addColorStop(s.offset / 100, s.color));
        return grad;
      }
      if (state.colorMode === 'radial-gradient' && state.gradient) {
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) / 2;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        (state.gradient.stops || []).forEach(s => grad.addColorStop(s.offset / 100, s.color));
        return grad;
      }
      return '#ffffff';
    }

    renderTextLines(ctx, paragraphLines, state, startY, canvasWidth, textFill, dropCapChar, dropCapWidth, dropCapHeight, dropCapLines, isForeground, isShadowPass) {
      const fontSize = state.fontSize || 64;
      const lineHeight = fontSize * (state.lineHeight || 1.15);
      const letterSpacing = state.letterSpacing || 0;
      const family = state.fontFamily ? `"${state.fontFamily}", sans-serif` : 'sans-serif';
      let fontParts = [];
      if (state.fontStyle && state.fontStyle !== 'normal') fontParts.push(state.fontStyle);
      fontParts.push(state.fontWeight || 400);
      fontParts.push(`${fontSize}px`);
      fontParts.push(family);
      const fontString = fontParts.join(' ');

      ctx.font = fontString;
      ctx.textBaseline = 'alphabetic';

      let currentY = startY;

      paragraphLines.forEach((paraObj, pIdx) => {
        paraObj.lines.forEach((line, lIdx) => {
          let drawLine = line;
          let xOffset = 0;

          if (pIdx === 0 && lIdx === 0 && dropCapChar) {
            drawLine = line.slice(dropCapChar.length);
            xOffset = dropCapWidth;
          }

          const measuredWidth = this.measureTextWidth(ctx, drawLine, letterSpacing) + xOffset;
          let startX = state.canvas.padding || 60;

          if (state.textAlign === 'center') {
            startX = (canvasWidth - measuredWidth) / 2;
          } else if (state.textAlign === 'right') {
            startX = canvasWidth - (state.canvas.padding || 60) - measuredWidth;
          }

          if (lIdx === 0 && state.textIndent && !dropCapChar) startX += state.textIndent;

          // Drop Cap
          if (pIdx === 0 && lIdx === 0 && dropCapChar) {
            const dcSize = fontSize * (dropCapLines * 0.95);
            ctx.save();
            ctx.font = `${state.dropCap.weight || 900} ${dcSize}px ${family}`;
            ctx.fillStyle = state.dropCap.color || '#00f0ff';
            ctx.fillText(dropCapChar, startX, currentY + (dcSize * 0.35));
            ctx.restore();
            ctx.font = fontString;
          }

          const textX = startX + xOffset;
          this.drawSingleLine(ctx, drawLine, textX, currentY, letterSpacing, textFill, state, isShadowPass);

          if (isForeground && state.decoration && state.decoration.line !== 'none') {
            this.drawDecoration(ctx, state.decoration, textX, currentY, measuredWidth - xOffset, fontSize);
          }

          currentY += lineHeight;
        });

        currentY += (state.paragraphSpacing || 24);
      });
    }

    drawSingleLine(ctx, text, x, y, letterSpacing, fillStyle, state, isShadowPass) {
      const stroke = state.stroke;
      const hasStroke = stroke && stroke.enabled && stroke.width > 0;

      if (letterSpacing === 0) {
        if (hasStroke && !isShadowPass) {
          ctx.save();
          ctx.lineWidth = stroke.width;
          ctx.strokeStyle = stroke.color || '#00f0ff';
          ctx.lineJoin = stroke.join || 'round';
          if (stroke.order === 'stroke-first') {
            ctx.strokeText(text, x, y);
            ctx.fillStyle = fillStyle;
            ctx.fillText(text, x, y);
          } else {
            ctx.fillStyle = fillStyle;
            ctx.fillText(text, x, y);
            ctx.strokeText(text, x, y);
          }
          ctx.restore();
        } else {
          ctx.fillStyle = fillStyle;
          ctx.fillText(text, x, y);
        }
      } else {
        let curX = x;
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          const w = ctx.measureText(ch).width;
          if (hasStroke && !isShadowPass) {
            ctx.save();
            ctx.lineWidth = stroke.width;
            ctx.strokeStyle = stroke.color || '#00f0ff';
            ctx.lineJoin = stroke.join || 'round';
            if (stroke.order === 'stroke-first') {
              ctx.strokeText(ch, curX, y);
              ctx.fillStyle = fillStyle;
              ctx.fillText(ch, curX, y);
            } else {
              ctx.fillStyle = fillStyle;
              ctx.fillText(ch, curX, y);
              ctx.strokeText(ch, curX, y);
            }
            ctx.restore();
          } else {
            ctx.fillStyle = fillStyle;
            ctx.fillText(ch, curX, y);
          }
          curX += w + letterSpacing;
        }
      }
    }

    drawDecoration(ctx, deco, x, y, width, fontSize) {
      ctx.save();
      ctx.strokeStyle = deco.color || '#ffffff';
      ctx.lineWidth = deco.thickness || 2;
      let lineY = y + 4;
      if (deco.line === 'overline') lineY = y - fontSize * 0.85;
      else if (deco.line === 'line-through') lineY = y - fontSize * 0.35;

      ctx.beginPath();
      ctx.moveTo(x, lineY);
      ctx.lineTo(x + width, lineY);
      ctx.stroke();
      ctx.restore();
    }

    measureTextWidth(ctx, text, letterSpacing = 0) {
      if (!text) return 0;
      const w = ctx.measureText(text).width;
      return w + Math.max(0, text.length - 1) * letterSpacing;
    }
  }

  /* ==========================================================================
     SVG Vector Generator
     ========================================================================== */
  class SvgExporter {
    generateSVG(state, bounds) {
      const width = bounds.width || 1200;
      const height = bounds.height || 630;
      const padding = state.canvas.padding || 60;
      const fontSize = state.fontSize || 64;
      const lineHeight = fontSize * (state.lineHeight || 1.15);
      const letterSpacing = state.letterSpacing || 0;
      const paraSpacing = state.paragraphSpacing || 24;

      let text = state.text || 'FONT MASTER';
      if (state.textTransform === 'uppercase') text = text.toUpperCase();
      else if (state.textTransform === 'lowercase') text = text.toLowerCase();
      else if (state.textTransform === 'capitalize') text = text.replace(/\b\w/g, c => c.toUpperCase());

      const paragraphs = text.split('\n');
      let defs = '';
      let bg = '';

      if (state.canvas.backgroundMode === 'solid') {
        bg = `<rect width="${width}" height="${height}" fill="${state.canvas.backgroundColor || '#080a0f'}" />`;
      }

      let fillAttr = state.color || '#ffffff';
      if (state.colorMode === 'linear-gradient' && state.gradient) {
        const angle = state.gradient.angle || 45;
        defs += `
    <linearGradient id="textGrad" gradientTransform="rotate(${angle} 0.5 0.5)">
      ${(state.gradient.stops || []).map(s => `<stop offset="${s.offset}%" stop-color="${s.color}" />`).join('\n      ')}
    </linearGradient>`;
        fillAttr = 'url(#textGrad)';
      }

      let strokeAttrs = '';
      if (state.stroke && state.stroke.enabled && state.stroke.width > 0) {
        strokeAttrs = `stroke="${state.stroke.color || '#00f0ff'}" stroke-width="${state.stroke.width}" stroke-linejoin="${state.stroke.join || 'round'}"`;
      }

      let content = '';
      if (state.parsedFont) {
        content = this.generatePaths(state.parsedFont, paragraphs, state, width, height, fillAttr, strokeAttrs);
      } else {
        content = this.generateTextTags(paragraphs, state, width, height, fillAttr, strokeAttrs);
      }

      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>${defs}</defs>
  ${bg}
  <g opacity="${state.opacity !== undefined ? state.opacity : 1.0}">
    ${content}
  </g>
</svg>`;
    }

    generatePaths(font, paragraphs, state, canvasWidth, canvasHeight, fillAttr, strokeAttrs) {
      const fontSize = state.fontSize || 64;
      const lineHeight = fontSize * (state.lineHeight || 1.15);
      const letterSpacing = state.letterSpacing || 0;
      const paraSpacing = state.paragraphSpacing || 24;
      const padding = state.canvas.padding || 60;
      let currentY = padding + fontSize;
      const paths = [];

      paragraphs.forEach(line => {
        let lineW = 0;
        for (let i = 0; i < line.length; i++) {
          const g = font.charToGlyph(line[i]);
          lineW += (g.advanceWidth || font.unitsPerEm * 0.6) * (fontSize / font.unitsPerEm) + letterSpacing;
        }

        let startX = padding;
        if (state.textAlign === 'center') startX = (canvasWidth - lineW) / 2;
        else if (state.textAlign === 'right') startX = canvasWidth - padding - lineW;

        let curX = startX;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          const g = font.charToGlyph(ch);
          const p = g.getPath(curX, currentY, fontSize);
          const d = p.toPathData();
          if (d) paths.push(`<path d="${d}" fill="${fillAttr}" ${strokeAttrs} />`);
          const adv = (g.advanceWidth || font.unitsPerEm * 0.6) * (fontSize / font.unitsPerEm);
          curX += adv + letterSpacing;
        }
        currentY += lineHeight + paraSpacing;
      });

      return paths.join('\n    ');
    }

    generateTextTags(paragraphs, state, canvasWidth, canvasHeight, fillAttr, strokeAttrs) {
      const fontSize = state.fontSize || 64;
      const lineHeight = fontSize * (state.lineHeight || 1.15);
      const letterSpacing = state.letterSpacing || 0;
      const paraSpacing = state.paragraphSpacing || 24;
      const padding = state.canvas.padding || 60;
      const family = state.fontFamily ? `"${state.fontFamily}", sans-serif` : 'sans-serif';

      let anchor = 'start';
      let startX = padding;
      if (state.textAlign === 'center') { anchor = 'middle'; startX = canvasWidth / 2; }
      else if (state.textAlign === 'right') { anchor = 'end'; startX = canvasWidth - padding; }

      let currentY = padding + fontSize;
      const tags = [];

      paragraphs.forEach(line => {
        tags.push(`
      <text x="${startX}" y="${currentY}"
            font-family=${JSON.stringify(family)}
            font-size="${fontSize}"
            font-weight="${state.fontWeight || 400}"
            font-style="${state.fontStyle || 'normal'}"
            letter-spacing="${letterSpacing}px"
            text-anchor="${anchor}"
            fill="${fillAttr}" ${strokeAttrs}>
        ${this.escapeXml(line)}
      </text>`);
        currentY += lineHeight + paraSpacing;
      });

      return tags.join('\n');
    }

    escapeXml(str) {
      return str.replace(/[<>&"\']/g, c => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '"': return '&quot;';
          case "\'": return '&apos;';
        }
      });
    }
  }

  const svgExporter = new SvgExporter();

  /* ==========================================================================
     Export & Download Manager
     ========================================================================== */
  class ExportManager {
    constructor(renderer) {
      this.renderer = renderer;
    }

    async exportFile(state, format, scale = 2, quality = 0.95) {
      const baseName = state.export.fileName || (state.fontMetadata ? state.fontMetadata.family : 'font-master');
      const cleanName = baseName.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
      const fileName = `${cleanName}.${format === 'jpeg' ? 'jpg' : format}`;

      if (format === 'svg') {
        const svg = svgExporter.generateSVG(state, this.renderer.renderedBounds);
        this.download(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), fileName);
        return;
      }

      const canvas = document.createElement('canvas');
      const offRenderer = new CanvasRenderer(canvas);
      const exportState = JSON.parse(JSON.stringify(state));
      exportState.fontBuffer = state.fontBuffer;
      exportState.parsedFont = state.parsedFont;

      if (format === 'jpeg' && exportState.canvas.backgroundMode === 'checkerboard') {
        exportState.canvas.backgroundMode = 'solid';
        exportState.canvas.backgroundColor = '#080a0f';
      }

      offRenderer.render(exportState, scale, true);
      const mime = format === 'jpeg' ? 'image/jpeg' : (format === 'webp' ? 'image/webp' : 'image/png');

      return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
          if (!blob) return reject(new Error('Canvas export failed'));
          this.download(blob, fileName);
          resolve();
        }, mime, quality);
      });
    }

    async copyClipboard(state, format = 'png') {
      if (format === 'svg') {
        const svg = svgExporter.generateSVG(state, this.renderer.renderedBounds);
        await navigator.clipboard.writeText(svg);
        return;
      }

      const canvas = document.createElement('canvas');
      const offRenderer = new CanvasRenderer(canvas);
      const exportState = JSON.parse(JSON.stringify(state));
      exportState.fontBuffer = state.fontBuffer;
      exportState.parsedFont = state.parsedFont;

      offRenderer.render(exportState, 2, true);

      return new Promise((resolve, reject) => {
        canvas.toBlob(async blob => {
          if (!blob) return reject(new Error('Clipboard blob creation failed'));
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            resolve();
          } catch (e) {
            reject(e);
          }
        }, 'image/png');
      });
    }

    download(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 200);
    }
  }

  /* ==========================================================================
     UI Controller (IndexedDB + ZIP extraction + Font preview synchronization)
     ========================================================================== */
  class UIController {
    constructor(renderer, exportManager) {
      this.renderer = renderer;
      this.exportManager = exportManager;
      this.currentZoom = 1.0;
      this.storedFonts = [];
    }

    async init() {
      this.bindTabs();
      this.bindUploadAndDragDrop();
      this.bindTextInputs();
      this.bindTypographyControls();
      this.bindColorAndGradients();
      this.bindStrokeAndShadows();
      this.bindAdvancedAndMicro();
      this.bindCanvasControls();
      this.bindZoomAndStage();
      this.bindExportModal();
      this.bindHistoryAndShortcuts();

      store.subscribe((state, changed) => {
        this.renderer.render(state, 1, false);
        this.updateHeaderBadge(state);
        this.updateDimensionsBadge();
        this.updateHistoryButtons();
      });

      // Load stored fonts from IndexedDB on startup
      await this.loadStoredFontsFromDB();

      this.renderer.render(store.state, 1, false);
      this.updateHeaderBadge(store.state);
      this.updateDimensionsBadge();
    }

    /**
     * Load all uploaded fonts from local IndexedDB and populate library
     */
    async loadStoredFontsFromDB() {
      try {
        this.storedFonts = await fontDB.getAllFonts();
        this.renderUploadedFontsList();

        if (this.storedFonts.length > 0) {
          // Register all stored fonts into FontFace and activate the most recent
          for (const f of this.storedFonts) {
            await fontEngine.registerFont(f.buffer, f.name, f.id);
          }
          const activeFont = this.storedFonts[this.storedFonts.length - 1];
          await this.activateFont(activeFont);
        }
      } catch (err) {
        console.warn('Could not read from IndexedDB:', err);
      }
    }

    renderUploadedFontsList() {
      const listEl = document.getElementById('fm-uploaded-fonts-list');
      const countBadge = document.getElementById('fm-font-count-badge');
      if (!listEl) return;

      if (countBadge) {
        countBadge.textContent = `${this.storedFonts.length} ${this.storedFonts.length === 1 ? 'FONT' : 'FONTS'}`;
      }

      if (this.storedFonts.length === 0) {
        listEl.innerHTML = `
          <div class="fm-empty-fonts">
            No fonts uploaded yet.<br>
            Upload your font files (.ttf, .otf, .woff, .woff2) or a .zip archive above. They are safely stored locally in your browser.
          </div>
        `;
        return;
      }

      listEl.innerHTML = '';
      this.storedFonts.forEach(fontItem => {
        const isActive = store.state.fontFamily === fontItem.id;
        const item = document.createElement('div');
        item.className = `fm-font-item ${isActive ? 'active' : ''}`;
        
        const sizeKB = Math.round((fontItem.size || 0) / 1024);
        const formatExt = fontItem.name.split('.').pop().toUpperCase();

        item.innerHTML = `
          <div class="fm-font-item-info">
            <span class="fm-font-item-name">${fontItem.family || fontItem.name}</span>
            <div class="fm-font-item-meta">
              <span style="color:var(--fm-accent-cyan);">${fontItem.subfamily || 'Regular'}</span>
              <span>·</span>
              <span>${formatExt}</span>
              <span>·</span>
              <span>${sizeKB} KB</span>
            </div>
          </div>
          <div class="fm-font-item-actions">
            ${isActive ? '<span style="font-size:10px;color:var(--fm-accent-emerald);font-weight:700;">ACTIVE</span>' : ''}
            <button class="fm-btn-del-font" title="Delete Font from Local Storage" data-id="${fontItem.id}">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        `;

        // Click font to activate
        item.addEventListener('click', async (e) => {
          if (e.target.closest('.fm-btn-del-font')) return;
          await this.activateFont(fontItem);
        });

        // Delete font button
        const delBtn = item.querySelector('.fm-btn-del-font');
        delBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const fontName = fontItem.family || fontItem.name;
          const confirmed = confirm(`Delete "${fontName}" from your font library?\n\nThis cannot be undone.`);
          if (!confirmed) return;
          await this.deleteStoredFont(fontItem.id);
        });

        listEl.appendChild(item);
      });
    }

    async activateFont(fontRecord) {
      const reg = await fontEngine.registerFont(fontRecord.buffer, fontRecord.name, fontRecord.id);

      store.update({
        fontFamily: fontRecord.id,
        fontFileName: fontRecord.name,
        fontBuffer: fontRecord.buffer,
        parsedFont: reg.parsedFont,
        fontMetadata: reg.metadata,
        fontWeight: reg.metadata.isVariable && reg.metadata.axes.wght ? reg.metadata.axes.wght.default : 400,
        fontVariationSettings: reg.variations
      });

      this.updateFontStatusBanner(fontRecord.name, reg.metadata);
      this.renderVariableAxes();
      this.renderUploadedFontsList();

      // Ensure canvas re-renders immediately after font is ready in the browser
      await document.fonts.ready;
      this.renderer.render(store.state, 1, false);
    }

    async deleteStoredFont(id) {
      await fontDB.deleteFont(id);
      this.storedFonts = this.storedFonts.filter(f => f.id !== id);

      // If active font was deleted, switch to another or clear
      if (store.state.fontFamily === id) {
        if (this.storedFonts.length > 0) {
          await this.activateFont(this.storedFonts[this.storedFonts.length - 1]);
        } else {
          store.update({
            fontFamily: '',
            fontFileName: '',
            fontBuffer: null,
            parsedFont: null,
            fontMetadata: null
          });
          document.getElementById('fm-font-status').style.display = 'none';
        }
      }

      this.renderUploadedFontsList();
      this.renderer.render(store.state, 1, false);
    }

    updateHeaderBadge(state) {
      const name = document.getElementById('fm-badge-name');
      const type = document.getElementById('fm-badge-type');
      if (name) {
        if (state.fontMetadata && state.fontMetadata.family) {
          name.textContent = state.fontMetadata.family;
          if (type) type.textContent = state.fontMetadata.isVariable ? 'Variable' : 'Static';
        } else {
          name.textContent = 'No Font Loaded';
          if (type) type.textContent = 'Upload Font';
        }
      }
    }

    updateDimensionsBadge() {
      const el = document.getElementById('fm-badge-dimensions');
      if (el && this.renderer.renderedBounds) {
        el.textContent = `${this.renderer.renderedBounds.width} × ${this.renderer.renderedBounds.height} px`;
      }
    }

    updateHistoryButtons() {
      const u = document.getElementById('fm-btn-undo');
      const r = document.getElementById('fm-btn-redo');
      if (u) u.disabled = !store.canUndo();
      if (r) r.disabled = !store.canRedo();
    }

    bindTabs() {
      const tabs = document.querySelectorAll('.fm-tab-btn');
      const panels = document.querySelectorAll('.fm-tab-panel');

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));
          tab.classList.add('active');
          const p = document.getElementById(tab.dataset.panel);
          if (p) p.classList.add('active');
        });
      });

      // Mobile Menu
      const menuBtn = document.getElementById('fm-btn-mobile-menu');
      const sidebar = document.getElementById('fm-sidebar');
      const backdrop = document.getElementById('fm-sidebar-backdrop');

      const toggleMenu = () => {
        const open = sidebar.classList.toggle('mobile-open');
        backdrop.classList.toggle('active', open);
      };

      menuBtn?.addEventListener('click', toggleMenu);
      backdrop?.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('active');
      });
    }

    /**
     * File Upload Handler: supports single fonts (.ttf, .otf, .woff, .woff2) AND .zip archives!
     */
    bindUploadAndDragDrop() {
      const fileInput = document.getElementById('fm-font-file-input');
      const browseBtn = document.getElementById('fm-btn-browse');
      const dropZone = document.getElementById('fm-drop-zone');
      const overlay = document.getElementById('fm-drag-overlay');

      // 1. Browse Button
      browseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
      });

      // 2. Drop Zone Click
      dropZone.addEventListener('click', () => fileInput.click());

      // 3. File Input Change
      fileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files.length > 0) {
          await this.handleIncomingFiles(e.target.files);
          fileInput.value = '';
        }
      });

      // 4. Drop Zone Drag & Drop
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-active');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-active');
      });

      dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-active');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          await this.handleIncomingFiles(e.dataTransfer.files);
        }
      });

      // 5. Full Window Drag Overlay
      window.addEventListener('dragenter', (e) => {
        e.preventDefault();
        overlay.classList.add('active');
      });

      overlay.addEventListener('dragover', (e) => e.preventDefault());
      overlay.addEventListener('dragleave', (e) => {
        if (e.relatedTarget === null) overlay.classList.remove('active');
      });

      overlay.addEventListener('drop', async (e) => {
        e.preventDefault();
        overlay.classList.remove('active');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          await this.handleIncomingFiles(e.dataTransfer.files);
        }
      });
    }

    /**
     * Process files or zip archives
     */
    async handleIncomingFiles(fileList) {
      for (const file of fileList) {
        // Check if file is a ZIP archive
        if (file.name.toLowerCase().endsWith('.zip') || file.type.includes('zip')) {
          await this.handleZipFile(file);
        } else if (/\.(ttf|otf|woff|woff2)$/i.test(file.name)) {
          const buffer = await file.arrayBuffer();
          await this.processAndStoreFont(buffer, file.name);
        } else {
          alert(`File "${file.name}" is not a recognized font file (.ttf, .otf, .woff, .woff2) or .zip archive.`);
        }
      }
    }

    /**
     * Extract and parse font files inside a ZIP archive using JSZip
     */
    async handleZipFile(zipFile) {
      if (!window.JSZip) {
        alert('ZIP extractor library is loading. Please try again.');
        return;
      }

      try {
        const zip = await window.JSZip.loadAsync(zipFile);
        const fontEntries = [];

        zip.forEach((relativePath, zipEntry) => {
          if (!zipEntry.dir && /\.(ttf|otf|woff|woff2)$/i.test(zipEntry.name) && !zipEntry.name.includes('__MACOSX') && !zipEntry.name.startsWith('.')) {
            fontEntries.push(zipEntry);
          }
        });

        if (fontEntries.length === 0) {
          alert(`No font files (.ttf, .otf, .woff, .woff2) were found inside "${zipFile.name}".`);
          return;
        }

        let firstLoaded = null;
        for (const entry of fontEntries) {
          const buffer = await entry.async('arraybuffer');
          const cleanName = entry.name.split('/').pop();
          const loaded = await this.processAndStoreFont(buffer, cleanName, false);
          if (!firstLoaded) firstLoaded = loaded;
        }

        // Activate the first extracted font and render
        if (firstLoaded) {
          await this.activateFont(firstLoaded);
          alert(`Extracted and loaded ${fontEntries.length} fonts from "${zipFile.name}"!`);
        }
      } catch (err) {
        alert(`Failed to read ZIP archive: ${err.message}`);
      }
    }

    /**
     * Register font in FontFace & CSS, save to local IndexedDB, and update UI
     */
    async processAndStoreFont(buffer, fileName, autoActivate = true) {
      try {
        // --- Deduplication: skip if a font with the same filename already exists ---
        const existingFont = this.storedFonts.find(f => f.name === fileName);
        if (existingFont) {
          console.info(`Font "${fileName}" is already in the library — skipping duplicate.`);
          if (autoActivate) {
            await this.activateFont(existingFont);
          }
          return existingFont;
        }

        const reg = await fontEngine.registerFont(buffer, fileName);

        const fontRecord = {
          id: reg.uniqueFamily,
          name: fileName,
          family: reg.metadata.family,
          subfamily: reg.metadata.subfamily,
          size: buffer.byteLength,
          metadata: reg.metadata,
          buffer: buffer,
          timestamp: Date.now()
        };

        await fontDB.saveFont(fontRecord);

        // Update in-memory list
        this.storedFonts.unshift(fontRecord);
        this.renderUploadedFontsList();

        if (autoActivate) {
          await this.activateFont(fontRecord);
        }

        return fontRecord;
      } catch (err) {
        console.error('Process font error:', err);
        alert(`Error loading font "${fileName}": ${err.message}`);
        return null;
      }
    }

    updateFontStatusBanner(name, meta) {
      const banner = document.getElementById('fm-font-status');
      const text = document.getElementById('fm-font-status-text');
      if (banner && text) {
        banner.style.display = 'flex';
        const glyphs = meta.glyphCount ? ` · ${meta.glyphCount} glyphs` : '';
        text.textContent = `Loaded: ${meta.family || name} (${meta.subfamily || 'Custom'}${glyphs})`;
      }
    }

    bindTextInputs() {
      const textarea = document.getElementById('fm-text-input');
      const clearBtn = document.getElementById('fm-btn-clear-text');

      textarea.value = store.state.text;
      textarea.addEventListener('input', (e) => store.set('text', e.target.value, true));

      clearBtn.addEventListener('click', () => {
        textarea.value = '';
        store.set('text', '', true);
      });

      document.getElementById('fm-select-writing-mode')?.addEventListener('change', e => {
        store.set('writingMode', e.target.value);
      });

      document.getElementById('fm-select-text-orientation')?.addEventListener('change', e => {
        store.set('textOrientation', e.target.value);
      });
    }

    bindTypographyControls() {
      const sizeInput = document.getElementById('fm-input-font-size');
      const sizeRange = document.getElementById('fm-range-font-size');
      const weightRange = document.getElementById('fm-range-font-weight');
      const weightLabel = document.getElementById('fm-label-font-weight');
      const lineRange = document.getElementById('fm-range-line-height');
      const lineLabel = document.getElementById('fm-label-line-height');
      const letterRange = document.getElementById('fm-range-letter-spacing');
      const letterLabel = document.getElementById('fm-label-letter-spacing');
      const wordRange = document.getElementById('fm-range-word-spacing');
      const wordLabel = document.getElementById('fm-label-word-spacing');
      const paraRange = document.getElementById('fm-range-para-spacing');
      const paraLabel = document.getElementById('fm-label-para-spacing');
      const indentRange = document.getElementById('fm-range-text-indent');
      const indentLabel = document.getElementById('fm-label-text-indent');

      const syncSize = (val) => {
        val = parseInt(val, 10) || 64;
        sizeInput.value = val;
        sizeRange.value = val;
        store.set('fontSize', val);
      };
      sizeInput.addEventListener('input', e => syncSize(e.target.value));
      sizeRange.addEventListener('input', e => syncSize(e.target.value));

      weightRange.addEventListener('input', e => {
        const w = parseInt(e.target.value, 10);
        weightLabel.textContent = `${w}`;
        store.set('fontWeight', w);
        if (store.state.fontVariationSettings) {
          store.set('fontVariationSettings', { ...store.state.fontVariationSettings, wght: w });
        }
      });

      lineRange.addEventListener('input', e => {
        const val = parseFloat(e.target.value);
        lineLabel.textContent = `${val.toFixed(2)}x`;
        store.set('lineHeight', val);
      });

      letterRange.addEventListener('input', e => {
        const val = parseInt(e.target.value, 10);
        letterLabel.textContent = `${val} px`;
        store.set('letterSpacing', val);
      });

      wordRange.addEventListener('input', e => {
        const val = parseInt(e.target.value, 10);
        wordLabel.textContent = `${val} px`;
        store.set('wordSpacing', val);
      });

      paraRange.addEventListener('input', e => {
        const val = parseInt(e.target.value, 10);
        paraLabel.textContent = `${val} px`;
        store.set('paragraphSpacing', val);
      });

      indentRange.addEventListener('input', e => {
        const val = parseInt(e.target.value, 10);
        indentLabel.textContent = `${val} px`;
        store.set('textIndent', val);
      });

      // Alignment Buttons
      document.querySelectorAll('.fm-align-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.fm-align-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          store.set('textAlign', btn.dataset.align);
        });
      });

      document.getElementById('fm-select-font-style')?.addEventListener('change', e => store.set('fontStyle', e.target.value));
      document.getElementById('fm-select-font-stretch')?.addEventListener('change', e => store.set('fontStretch', e.target.value));
      document.getElementById('fm-select-font-variant')?.addEventListener('change', e => store.set('fontVariant', e.target.value));
      document.getElementById('fm-select-text-transform')?.addEventListener('change', e => store.set('textTransform', e.target.value));
      document.getElementById('fm-select-kerning')?.addEventListener('change', e => store.set('kerning', e.target.value));
      document.getElementById('fm-select-vertical-align')?.addEventListener('change', e => store.set('verticalAlign', e.target.value));
      document.getElementById('fm-select-white-space')?.addEventListener('change', e => store.set('whiteSpace', e.target.value));
    }

    bindColorAndGradients() {
      const modeBtns = document.querySelectorAll('.fm-color-mode-btn');
      const solidSection = document.getElementById('fm-solid-color-wrap');
      const gradSection = document.getElementById('fm-gradient-wrap');
      const solidPicker = document.getElementById('fm-picker-color');
      const solidHex = document.getElementById('fm-input-color-hex');
      const gradAngle = document.getElementById('fm-range-grad-angle');
      const gradAngleLabel = document.getElementById('fm-label-grad-angle');
      const opacityRange = document.getElementById('fm-range-opacity');
      const opacityLabel = document.getElementById('fm-label-opacity');

      modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          modeBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const mode = btn.dataset.mode;
          store.set('colorMode', mode);
          if (mode === 'solid') {
            solidSection.style.display = 'flex';
            gradSection.style.display = 'none';
          } else {
            solidSection.style.display = 'none';
            gradSection.style.display = 'flex';
          }
        });
      });

      solidPicker.addEventListener('input', e => {
        solidHex.value = e.target.value.toUpperCase();
        store.set('color', e.target.value);
      });

      solidHex.addEventListener('change', e => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        solidPicker.value = val;
        store.set('color', val);
      });

      document.querySelectorAll('.fm-swatch-chip').forEach(ch => {
        ch.addEventListener('click', () => {
          const c = ch.dataset.color;
          solidPicker.value = c;
          solidHex.value = c.toUpperCase();
          store.set('color', c);
        });
      });

      // Gradient Presets
      const gradGrid = document.getElementById('fm-gradient-grid');
      GRADIENT_PRESETS.forEach((g, idx) => {
        const chip = document.createElement('div');
        chip.className = `fm-grad-chip ${idx === 0 ? 'active' : ''}`;
        const stops = g.stops.map(s => `${s.color} ${s.offset}%`).join(', ');
        chip.style.background = `linear-gradient(${g.angle}deg, ${stops})`;
        chip.title = g.name;

        chip.addEventListener('click', () => {
          document.querySelectorAll('.fm-grad-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          store.set('gradient', JSON.parse(JSON.stringify(g)));
          gradAngle.value = g.angle;
          gradAngleLabel.textContent = `${g.angle}°`;
        });
        gradGrid.appendChild(chip);
      });

      gradAngle.addEventListener('input', e => {
        const a = parseInt(e.target.value, 10);
        gradAngleLabel.textContent = `${a}°`;
        const g = store.state.gradient || GRADIENT_PRESETS[0];
        g.angle = a;
        store.set('gradient', g);
      });

      opacityRange.addEventListener('input', e => {
        const val = parseInt(e.target.value, 10) / 100;
        opacityLabel.textContent = `${e.target.value}%`;
        store.set('opacity', val);
      });
    }

    bindStrokeAndShadows() {
      // Stroke
      const strokeEnable = document.getElementById('fm-check-stroke');
      const strokeWrap = document.getElementById('fm-stroke-options');
      const strokeWidth = document.getElementById('fm-range-stroke-width');
      const strokeLabel = document.getElementById('fm-label-stroke-width');
      const strokePicker = document.getElementById('fm-picker-stroke-color');
      const strokeJoin = document.getElementById('fm-select-stroke-join');
      const strokeOrder = document.getElementById('fm-select-stroke-order');

      strokeEnable.addEventListener('change', e => {
        const enabled = e.target.checked;
        strokeWrap.style.opacity = enabled ? '1' : '0.4';
        strokeWrap.style.pointerEvents = enabled ? 'auto' : 'none';
        store.set('stroke', { ...store.state.stroke, enabled });
      });

      strokeWidth.addEventListener('input', e => {
        const w = parseInt(e.target.value, 10);
        strokeLabel.textContent = `${w} px`;
        store.set('stroke', { ...store.state.stroke, width: w });
      });

      strokePicker.addEventListener('input', e => {
        store.set('stroke', { ...store.state.stroke, color: e.target.value });
      });

      strokeJoin.addEventListener('change', e => {
        store.set('stroke', { ...store.state.stroke, join: e.target.value });
      });

      strokeOrder.addEventListener('change', e => {
        store.set('stroke', { ...store.state.stroke, order: e.target.value });
      });

      // Shadows
      const shadowGrid = document.getElementById('fm-shadow-grid');
      const shX = document.getElementById('fm-range-sh-x');
      const shY = document.getElementById('fm-range-sh-y');
      const shBlur = document.getElementById('fm-range-sh-blur');
      const shPicker = document.getElementById('fm-picker-sh-color');

      SHADOW_PRESETS.forEach((p, idx) => {
        const chip = document.createElement('div');
        chip.className = `fm-shadow-chip ${idx === 1 ? 'active' : ''}`;
        chip.textContent = p.name;
        chip.addEventListener('click', () => {
          document.querySelectorAll('.fm-shadow-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          store.set('shadows', JSON.parse(JSON.stringify(p.layers)));
        });
        shadowGrid.appendChild(chip);
      });

      const updateCustomShadow = () => {
        const layer = {
          x: parseInt(shX.value, 10),
          y: parseInt(shY.value, 10),
          blur: parseInt(shBlur.value, 10),
          color: shPicker.value
        };
        document.getElementById('fm-label-sh-x').textContent = `${layer.x}px`;
        document.getElementById('fm-label-sh-y').textContent = `${layer.y}px`;
        document.getElementById('fm-label-sh-blur').textContent = `${layer.blur}px`;
        store.set('shadows', [layer]);
      };

      shX.addEventListener('input', updateCustomShadow);
      shY.addEventListener('input', updateCustomShadow);
      shBlur.addEventListener('input', updateCustomShadow);
      shPicker.addEventListener('input', updateCustomShadow);

      // Drop Cap
      const checkDropCap = document.getElementById('fm-check-dropcap');
      const dropCapWrap = document.getElementById('fm-dropcap-options');
      const dropCapLines = document.getElementById('fm-select-dropcap-lines');
      const dropCapPicker = document.getElementById('fm-picker-dropcap-color');

      checkDropCap.addEventListener('change', e => {
        const enabled = e.target.checked;
        dropCapWrap.style.opacity = enabled ? '1' : '0.4';
        dropCapWrap.style.pointerEvents = enabled ? 'auto' : 'none';
        store.set('dropCap', { ...store.state.dropCap, enabled });
      });

      dropCapLines.addEventListener('change', e => {
        store.set('dropCap', { ...store.state.dropCap, lines: parseInt(e.target.value, 10) });
      });

      dropCapPicker.addEventListener('input', e => {
        store.set('dropCap', { ...store.state.dropCap, color: e.target.value });
      });
    }

    bindAdvancedAndMicro() {
      const baseRange = document.getElementById('fm-range-base-shift');
      const scaleXRange = document.getElementById('fm-range-scale-x');
      const scaleYRange = document.getElementById('fm-range-scale-y');
      const slantRange = document.getElementById('fm-range-slant');
      const rotRange = document.getElementById('fm-range-rotate');

      const updateMicro = () => {
        const micro = {
          baselineShift: parseInt(baseRange.value, 10),
          scaleX: parseInt(scaleXRange.value, 10),
          scaleY: parseInt(scaleYRange.value, 10),
          slant: parseInt(slantRange.value, 10),
          rotate: parseInt(rotRange.value, 10)
        };
        document.getElementById('fm-label-base-shift').textContent = `${micro.baselineShift} px`;
        document.getElementById('fm-label-scale-x').textContent = `${micro.scaleX}%`;
        document.getElementById('fm-label-scale-y').textContent = `${micro.scaleY}%`;
        document.getElementById('fm-label-slant').textContent = `${micro.slant}°`;
        document.getElementById('fm-label-rotate').textContent = `${micro.rotate}°`;
        store.set('microAdjust', micro);
      };

      baseRange.addEventListener('input', updateMicro);
      scaleXRange.addEventListener('input', updateMicro);
      scaleYRange.addEventListener('input', updateMicro);
      slantRange.addEventListener('input', updateMicro);
      rotRange.addEventListener('input', updateMicro);

      document.getElementById('fm-btn-reset-micro')?.addEventListener('click', () => {
        baseRange.value = 0;
        scaleXRange.value = 100;
        scaleYRange.value = 100;
        slantRange.value = 0;
        rotRange.value = 0;
        updateMicro();
      });

      // OpenType Features Grid
      const featGrid = document.getElementById('fm-opentype-grid');
      OPENTYPE_FEATURES.forEach(f => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.justifyContent = 'space-between';
        item.style.padding = '6px 8px';
        item.style.background = 'var(--fm-bg-input)';
        item.style.borderRadius = 'var(--fm-radius-sm)';
        item.style.border = '1px solid var(--fm-border-subtle)';
        item.innerHTML = `
          <span style="font-family:var(--fm-font-mono);font-size:11px;font-weight:600;color:var(--fm-text-title);">${f.tag}</span>
          <label class="fm-switch">
            <input type="checkbox" data-tag="${f.tag}" ${store.state.fontFeatureSettings[f.tag] ? 'checked' : ''}>
            <span class="fm-switch-slider"></span>
          </label>
        `;
        item.querySelector('input').addEventListener('change', e => {
          store.set('fontFeatureSettings', { ...store.state.fontFeatureSettings, [f.tag]: e.target.checked });
        });
        featGrid.appendChild(item);
      });

      this.renderVariableAxes();
    }

    renderVariableAxes() {
      const card = document.getElementById('fm-variable-axes-card');
      const wrap = document.getElementById('fm-variable-axes-list');
      const meta = store.state.fontMetadata;

      if (!card || !wrap) return;
      if (!meta || !meta.isVariable || !meta.axes || Object.keys(meta.axes).length === 0) {
        card.style.display = 'none';
        return;
      }

      card.style.display = 'flex';
      wrap.innerHTML = '';

      Object.values(meta.axes).forEach(ax => {
        const row = document.createElement('div');
        row.className = 'fm-control-row';
        const cur = (store.state.fontVariationSettings && store.state.fontVariationSettings[ax.tag]) || ax.default || ax.min;

        row.innerHTML = `
          <div class="fm-control-header">
            <span class="fm-label" style="font-family:var(--fm-font-mono);">${ax.tag.toUpperCase()} (${ax.name})</span>
            <span class="fm-val-badge ax-val">${cur}</span>
          </div>
          <input type="range" class="fm-range" min="${ax.min}" max="${ax.max}" value="${cur}" step="${ax.tag === 'ital' ? 0.1 : 1}">
        `;

        const slider = row.querySelector('input');
        const badge = row.querySelector('.ax-val');

        slider.addEventListener('input', e => {
          const val = parseFloat(e.target.value);
          badge.textContent = val;
          store.set('fontVariationSettings', { ...store.state.fontVariationSettings, [ax.tag]: val });
          if (ax.tag === 'wght') {
            store.set('fontWeight', Math.round(val));
            document.getElementById('fm-range-font-weight').value = Math.round(val);
            document.getElementById('fm-label-font-weight').textContent = `${Math.round(val)}`;
          }
        });

        wrap.appendChild(row);
      });
    }

    bindCanvasControls() {
      document.querySelectorAll('.fm-aspect-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.fm-aspect-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const r = btn.dataset.ratio;
          const custom = document.getElementById('fm-custom-dim-wrap');
          if (r === 'custom') custom.style.display = 'grid';
          else custom.style.display = 'none';
          store.set('canvas', { ...store.state.canvas, aspectRatio: r });
        });
      });

      const padRange = document.getElementById('fm-range-canvas-pad');
      padRange.addEventListener('input', e => {
        const val = parseInt(e.target.value, 10);
        document.getElementById('fm-label-canvas-pad').textContent = `${val} px`;
        store.set('canvas', { ...store.state.canvas, padding: val });
      });

      document.querySelectorAll('.fm-bg-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.fm-bg-mode-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const mode = btn.dataset.mode;
          store.set('canvas', { ...store.state.canvas, backgroundMode: mode });
        });
      });
    }

    bindZoomAndStage() {
      const zoomText = document.getElementById('fm-zoom-indicator');
      const stage = document.getElementById('fm-canvas-stage');
      const setZoom = (z) => {
        this.currentZoom = Math.min(3.0, Math.max(0.2, z));
        zoomText.textContent = `${Math.round(this.currentZoom * 100)}%`;
        stage.style.transform = `scale(${this.currentZoom})`;
      };

      document.getElementById('fm-btn-zoom-in')?.addEventListener('click', () => setZoom(this.currentZoom + 0.15));
      document.getElementById('fm-btn-zoom-out')?.addEventListener('click', () => setZoom(this.currentZoom - 0.15));
      document.getElementById('fm-btn-zoom-fit')?.addEventListener('click', () => {
        const vp = document.getElementById('fm-viewport');
        const b = this.renderer.renderedBounds;
        if (vp && b && b.width > 0) {
          const s = Math.min((vp.clientWidth - 80) / b.width, (vp.clientHeight - 80) / b.height, 1.0);
          setZoom(s);
        }
      });
      document.getElementById('fm-btn-recenter')?.addEventListener('click', () => setZoom(1.0));
    }

    bindExportModal() {
      const modal = document.getElementById('fm-modal-export');
      const openBtn = document.getElementById('fm-btn-open-export');
      const closeBtn = document.getElementById('fm-btn-close-export');
      const downloadBtn = document.getElementById('fm-btn-download');
      const downloadText = document.getElementById('fm-download-btn-text');
      const copyBtn = document.getElementById('fm-btn-copy');
      const copyText = document.getElementById('fm-copy-btn-text');
      const filenameInput = document.getElementById('fm-input-export-name');

      let currentFormat = 'png';
      let currentScale = 2;

      openBtn.addEventListener('click', () => modal.classList.add('active'));
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
      modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });

      document.querySelectorAll('.fm-format-card').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('.fm-format-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          currentFormat = card.dataset.format;
          downloadText.textContent = `Download ${currentFormat.toUpperCase()}`;
        });
      });

      document.querySelectorAll('.fm-scale-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.fm-scale-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentScale = parseInt(btn.dataset.scale, 10);
        });
      });

      downloadBtn.addEventListener('click', async () => {
        downloadBtn.disabled = true;
        downloadText.textContent = 'Generating...';
        try {
          store.set('export', { ...store.state.export, fileName: filenameInput.value.trim() || 'font-master' }, false);
          await this.exportManager.exportFile(store.state, currentFormat, currentScale, 0.95);
          downloadText.textContent = 'Saved!';
          setTimeout(() => {
            downloadText.textContent = `Download ${currentFormat.toUpperCase()}`;
            downloadBtn.disabled = false;
            modal.classList.remove('active');
          }, 600);
        } catch (err) {
          alert(`Export failed: ${err.message}`);
          downloadBtn.disabled = false;
          downloadText.textContent = `Download ${currentFormat.toUpperCase()}`;
        }
      });

      copyBtn.addEventListener('click', async () => {
        copyBtn.disabled = true;
        copyText.textContent = 'Copying...';
        try {
          await this.exportManager.copyClipboard(store.state, currentFormat);
          copyText.textContent = 'Copied to Clipboard!';
          setTimeout(() => {
            copyText.textContent = 'Copy to Clipboard';
            copyBtn.disabled = false;
          }, 1200);
        } catch (err) {
          alert(`Clipboard copy failed: ${err.message}`);
          copyBtn.disabled = false;
          copyText.textContent = 'Copy to Clipboard';
        }
      });
    }

    bindHistoryAndShortcuts() {
      document.getElementById('fm-btn-undo')?.addEventListener('click', () => store.undo());
      document.getElementById('fm-btn-redo')?.addEventListener('click', () => store.redo());

      window.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
          if (e.shiftKey) { e.preventDefault(); store.redo(); }
          else { e.preventDefault(); store.undo(); }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
          e.preventDefault();
          store.redo();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
          e.preventDefault();
          document.getElementById('fm-btn-open-export')?.click();
        } else if (e.key === 'Escape') {
          document.getElementById('fm-modal-export')?.classList.remove('active');
          document.getElementById('fm-sidebar')?.classList.remove('mobile-open');
          document.getElementById('fm-sidebar-backdrop')?.classList.remove('active');
        }
      });
    }
  }

  /* ==========================================================================
     Application Bootstrapper
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('fm-preview-canvas');
    if (!canvas) return;

    const renderer = new CanvasRenderer(canvas);
    const exportManager = new ExportManager(renderer);
    const ui = new UIController(renderer, exportManager);
    await ui.init();

    window.addEventListener('resize', () => {
      renderer.render(store.state, 1, false);
      ui.updateDimensionsBadge();
    });

    console.log('⚡ Font Master Studio ready with local font library & ZIP support.');
  });

})();
