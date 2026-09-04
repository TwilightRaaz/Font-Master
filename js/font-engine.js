/**
 * Font Master - Font Loading, OpenType Parsing, Variable Axes & Feature Extraction.
 */

import { store } from './state.js';

class FontEngine {
  constructor() {
    this.uploadedFontCounter = 0;
    this.fontFaceCache = new Map();
  }

  /**
   * Load and parse a custom font file (TTF, OTF, WOFF, WOFF2)
   */
  async loadFontFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    const cleanFileName = file.name.replace(/\.[^/.]+$/, "");
    this.uploadedFontCounter++;
    const uniqueFamily = `UserFont_${this.uploadedFontCounter}_${cleanFileName.replace(/[^a-zA-Z0-9_]/g, '')}`;

    let parsedFont = null;
    let metadata = {
      family: cleanFileName,
      subfamily: 'Regular',
      designer: 'Unknown',
      version: '1.0',
      glyphCount: 0,
      unitsPerEm: 1000,
      isVariable: false,
      axes: {},
      supportedFeatures: []
    };

    // Parse with opentype.js if available
    if (window.opentype) {
      try {
        parsedFont = window.opentype.parse(arrayBuffer);
        
        if (parsedFont && parsedFont.names) {
          const names = parsedFont.names;
          metadata.family = this.extractName(names.fontFamily) || cleanFileName;
          metadata.subfamily = this.extractName(names.fontSubfamily) || 'Regular';
          metadata.designer = this.extractName(names.designer) || this.extractName(names.manufacturer) || 'Custom';
          metadata.version = this.extractName(names.version) || '1.0';
        }

        if (parsedFont) {
          metadata.glyphCount = parsedFont.glyphs ? parsedFont.glyphs.length : 0;
          metadata.unitsPerEm = parsedFont.unitsPerEm || 1000;
          metadata.ascender = parsedFont.ascender;
          metadata.descender = parsedFont.descender;

          // Check for variable font table (fvar)
          if (parsedFont.tables && parsedFont.tables.fvar && parsedFont.tables.fvar.axes) {
            metadata.isVariable = true;
            parsedFont.tables.fvar.axes.forEach(axis => {
              metadata.axes[axis.tag] = {
                tag: axis.tag,
                name: axis.tag.toUpperCase(),
                min: axis.minValue,
                max: axis.maxValue,
                default: axis.defaultValue
              };
            });
          }

          // Check for OpenType layout tables (GSUB / GPOS)
          metadata.supportedFeatures = this.extractSupportedFeatures(parsedFont);
        }
      } catch (err) {
        console.warn('OpenType parsing failed (file may be WOFF2 or restricted). Native browser FontFace will still be used.', err);
      }
    }

    // Register font with browser native FontFace API
    try {
      const fontFace = new FontFace(uniqueFamily, arrayBuffer);
      const loadedFace = await fontFace.load();
      document.fonts.add(loadedFace);
      this.fontFaceCache.set(uniqueFamily, loadedFace);
    } catch (fontFaceErr) {
      console.error('Failed to register FontFace:', fontFaceErr);
      throw new Error(`Unable to load font "${file.name}": ${fontFaceErr.message}`);
    }

    // Prepare variation settings if variable font
    const initialVariations = {};
    if (metadata.isVariable) {
      Object.values(metadata.axes).forEach(ax => {
        initialVariations[ax.tag] = ax.default;
      });
    }

    // Update Store
    store.update({
      fontSource: 'uploaded',
      fontFamily: uniqueFamily,
      fontFileName: file.name,
      fontBuffer: arrayBuffer,
      parsedFont: parsedFont,
      fontMetadata: metadata,
      fontWeight: metadata.isVariable && metadata.axes.wght ? metadata.axes.wght.default : 400,
      fontVariationSettings: initialVariations
    });

    return { family: uniqueFamily, metadata, parsedFont };
  }

  /**
   * Load curated web font (e.g. from Google Fonts)
   */
  async loadPresetFont(preset) {
    if (preset.url) {
      // Inject stylesheet if not already present
      const linkId = `gfont-${preset.name.replace(/\s+/g, '-').toLowerCase()}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = preset.url;
        document.head.appendChild(link);
      }
      
      // Wait for font to be ready
      try {
        await document.fonts.load(`1em "${preset.family}"`);
      } catch (e) {
        console.warn('Font load check:', e);
      }
    }

    const metadata = {
      family: preset.name,
      subfamily: 'Variable / Regular',
      designer: 'Google Fonts / Foundries',
      version: '1.0',
      glyphCount: 1500,
      unitsPerEm: 1000,
      isVariable: preset.variable,
      axes: preset.axes || {},
      supportedFeatures: ['liga', 'kern', 'calt', 'zero', 'frac', 'smcp']
    };

    const initialVariations = {};
    if (preset.axes) {
      Object.keys(preset.axes).forEach(tag => {
        initialVariations[tag] = preset.axes[tag].default || 700;
      });
    }

    store.update({
      fontSource: 'preset',
      fontFamily: preset.family,
      fontUrl: preset.url,
      fontFileName: preset.name,
      fontBuffer: null,
      parsedFont: null,
      fontMetadata: metadata,
      fontWeight: preset.axes && preset.axes.wght ? preset.axes.wght.default : 700,
      fontVariationSettings: initialVariations
    });
  }

  extractName(nameObj) {
    if (!nameObj) return null;
    if (typeof nameObj === 'string') return nameObj;
    return nameObj.en || Object.values(nameObj)[0] || null;
  }

  extractSupportedFeatures(font) {
    const features = new Set();
    const scanTable = (table) => {
      if (!table || !table.featureList || !table.featureList.featureRecords) return;
      table.featureList.featureRecords.forEach(rec => {
        if (rec.featureTag) features.add(rec.featureTag);
      });
    };

    if (font.tables) {
      scanTable(font.tables.gsub);
      scanTable(font.tables.gpos);
    }
    return Array.from(features);
  }

  /**
   * Build CSS font-feature-settings value
   */
  getFeatureSettingsCSS(settings) {
    if (!settings) return 'normal';
    const active = [];
    for (const [tag, val] of Object.entries(settings)) {
      if (val) {
        active.push(`"${tag}" 1`);
      }
    }
    return active.length > 0 ? active.join(', ') : 'normal';
  }

  /**
   * Build CSS font-variation-settings value
   */
  getVariationSettingsCSS(variations) {
    if (!variations) return 'normal';
    const parts = [];
    for (const [axis, val] of Object.entries(variations)) {
      parts.push(`"${axis}" ${val}`);
    }
    return parts.length > 0 ? parts.join(', ') : 'normal';
  }
}

export const fontEngine = new FontEngine();
