/**
 * Font Master - Comprehensive UI Controller & Reactive Event Binder.
 */

import { store } from "./state.js";
import { CURATED_FONTS, PANGRAM_PRESETS, GRADIENT_PRESETS, SHADOW_PRESETS, OPENTYPE_FEATURES } from "./presets.js";
import { fontEngine } from "./font-engine.js";

export class UIController {
  constructor(renderer, exportEngine) {
    this.renderer = renderer;
    this.exportEngine = exportEngine;
    this.currentZoom = 1.0;
  }

  init() {
    this.initSidebarTabs();
    this.initMobileDrawer();
    this.initFontControls();
    this.initTextControls();
    this.initTypographyControls();
    this.initColorAndStroke();
    this.initShadowsAndEffects();
    this.initAdvancedAndMicro();
    this.initCanvasControls();
    this.initZoomAndStage();
    this.initExportModal();
    this.initKeyboardShortcuts();
    this.initHistoryButtons();

    // Subscribe to state changes to update UI elements and re-render canvas
    store.subscribe((state, changedKeys) => {
      this.handleStateChange(state, changedKeys);
    });

    // Initial render
    this.renderer.render(store.state, 1, false);
    this.updateDimensionsBadge();
    this.updateFontBadge(store.state);
  }

  /**
   * Handle reactive state changes
   */
  handleStateChange(state, changedKeys) {
    // Always re-render canvas on state update
    this.renderer.render(state, 1, false);
    this.updateDimensionsBadge();
    this.updateHistoryButtonStates();

    if (changedKeys === "undo" || changedKeys === "redo" || Array.isArray(changedKeys)) {
      this.syncUIFromState(state);
    }
  }

  updateDimensionsBadge() {
    const badge = document.getElementById("badge-dimensions");
    if (badge && this.renderer.renderedBounds) {
      const b = this.renderer.renderedBounds;
      badge.textContent = `${b.width} × ${b.height} px`;
    }
  }

  updateFontBadge(state) {
    const nameEl = document.getElementById("badge-font-name");
    const typeEl = document.getElementById("badge-font-type");
    if (nameEl && state.fontMetadata) {
      nameEl.textContent = state.fontMetadata.family || state.fontFamily;
      if (typeEl) {
        typeEl.textContent = state.fontMetadata.isVariable ? "Variable" : "Static";
      }
    }
  }

  updateHistoryButtonStates() {
    const undoBtn = document.getElementById("btn-undo");
    const redoBtn = document.getElementById("btn-redo");
    if (undoBtn) undoBtn.disabled = !store.canUndo();
    if (redoBtn) redoBtn.disabled = !store.canRedo();
  }

  /**
   * Sync UI inputs when undo/redo occurs
   */
  syncUIFromState(state) {
    const textInput = document.getElementById("text-input");
    if (textInput && textInput.value !== state.text) textInput.value = state.text;

    const fontSizeInput = document.getElementById("input-font-size");
    const fontSizeRange = document.getElementById("range-font-size");
    if (fontSizeInput) fontSizeInput.value = state.fontSize;
    if (fontSizeRange) fontSizeRange.value = state.fontSize;

    const fontWeightRange = document.getElementById("range-font-weight");
    if (fontWeightRange) {
      fontWeightRange.value = state.fontWeight;
      this.updateWeightLabel(state.fontWeight);
    }

    const lineHeightRange = document.getElementById("range-line-height");
    if (lineHeightRange) {
      lineHeightRange.value = state.lineHeight;
      document.getElementById("label-line-height").textContent = `${state.lineHeight}x`;
    }

    const letterSpacingRange = document.getElementById("range-letter-spacing");
    if (letterSpacingRange) {
      letterSpacingRange.value = state.letterSpacing;
      document.getElementById("label-letter-spacing").textContent = `${state.letterSpacing} px`;
    }

    this.updateFontBadge(state);
  }

  initSidebarTabs() {
    const tabButtons = document.querySelectorAll(".sidebar-tab");
    const tabPanels = document.querySelectorAll(".tab-panel");

    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        tabPanels.forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        const target = document.getElementById(btn.dataset.tab);
        if (target) target.classList.add("active");
      });
    });
  }

  initMobileDrawer() {
    const toggleBtn = document.getElementById("btn-toggle-sidebar");
    const sidebar = document.getElementById("sidebar-controls");

    let backdrop = document.querySelector(".mobile-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "mobile-backdrop";
      document.body.appendChild(backdrop);
    }

    const toggle = () => {
      const isOpen = sidebar.classList.toggle("mobile-open");
      backdrop.classList.toggle("active", isOpen);
    };

    toggleBtn?.addEventListener("click", toggle);
    backdrop.addEventListener("click", () => {
      sidebar.classList.remove("mobile-open");
      backdrop.classList.remove("active");
    });
  }

  initFontControls() {
    const fileInput = document.getElementById("font-file-input");
    const dropZone = document.getElementById("drop-zone");
    const curatedSelect = document.getElementById("select-curated-font");

    // Populate curated fonts
    CURATED_FONTS.forEach((f, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = `${f.name} — ${f.preview}`;
      curatedSelect.appendChild(opt);
    });

    curatedSelect.addEventListener("change", async (e) => {
      const fontPreset = CURATED_FONTS[e.target.value];
      if (fontPreset) {
        await fontEngine.loadPresetFont(fontPreset);
        this.updateFontBadge(store.state);
        this.renderVariableAxes();
      }
    });

    // File input trigger
    dropZone.addEventListener("click", () => fileInput.click());

    // Drag and drop
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("border-violet-500", "bg-violet-950/20");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("border-violet-500", "bg-violet-950/20");
    });

    dropZone.addEventListener("drop", async (e) => {
      e.preventDefault();
      dropZone.classList.remove("border-violet-500", "bg-violet-950/20");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        await this.handleFontFileUpload(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", async (e) => {
      if (e.target.files && e.target.files[0]) {
        await this.handleFontFileUpload(e.target.files[0]);
      }
    });
  }

  async handleFontFileUpload(file) {
    try {
      const result = await fontEngine.loadFontFile(file);
      this.updateFontBadge(store.state);
      this.renderVariableAxes();
      // Show confirmation toast or notification
      console.log("Loaded custom font successfully:", result.metadata.family);
    } catch (err) {
      alert(`Error loading font: ${err.message}`);
    }
  }

  initTextControls() {
    const textInput = document.getElementById("text-input");
    const sampleSelect = document.getElementById("select-sample-text");
    const writingModeSelect = document.getElementById("select-writing-mode");
    const textOrientSelect = document.getElementById("select-text-orientation");

    textInput.value = store.state.text;
    textInput.addEventListener("input", (e) => {
      store.set("text", e.target.value, true);
    });

    // Populate Pangrams
    PANGRAM_PRESETS.forEach((p, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = p.title;
      sampleSelect.appendChild(opt);
    });

    sampleSelect.addEventListener("change", (e) => {
      if (e.target.value !== "") {
        const selected = PANGRAM_PRESETS[e.target.value];
        textInput.value = selected.text;
        store.set("text", selected.text, true);
      }
    });

    writingModeSelect.addEventListener("change", (e) => {
      store.set("writingMode", e.target.value);
    });

    textOrientSelect.addEventListener("change", (e) => {
      store.set("textOrientation", e.target.value);
    });
  }

  initTypographyControls() {
    const fontSizeInput = document.getElementById("input-font-size");
    const fontSizeRange = document.getElementById("range-font-size");
    const fontWeightRange = document.getElementById("range-font-weight");
    const fontStyleSelect = document.getElementById("select-font-style");
    const fontStretchSelect = document.getElementById("select-font-stretch");
    const fontVariantSelect = document.getElementById("select-font-variant");
    const lineHeightRange = document.getElementById("range-line-height");
    const letterSpacingRange = document.getElementById("range-letter-spacing");
    const wordSpacingRange = document.getElementById("range-word-spacing");
    const paraSpacingRange = document.getElementById("range-para-spacing");
    const textTransformSelect = document.getElementById("select-text-transform");
    const kerningSelect = document.getElementById("select-kerning");
    const verticalAlignSelect = document.getElementById("select-vertical-align");
    const textIndentRange = document.getElementById("range-text-indent");
    const whiteSpaceSelect = document.getElementById("select-white-space");

    // Font size sync
    const syncSize = (val) => {
      val = parseInt(val, 10) || 64;
      fontSizeInput.value = val;
      fontSizeRange.value = val;
      store.set("fontSize", val);
    };
    fontSizeInput.addEventListener("input", (e) => syncSize(e.target.value));
    fontSizeRange.addEventListener("input", (e) => syncSize(e.target.value));

    // Font weight
    fontWeightRange.addEventListener("input", (e) => {
      const weight = parseInt(e.target.value, 10);
      this.updateWeightLabel(weight);
      store.set("fontWeight", weight);
      // Update variable axes if wght axis exists
      if (store.state.fontVariationSettings) {
        const v = { ...store.state.fontVariationSettings, wght: weight };
        store.set("fontVariationSettings", v);
      }
    });

    // Font style
    fontStyleSelect.addEventListener("change", (e) => store.set("fontStyle", e.target.value));

    // Font stretch
    fontStretchSelect.addEventListener("change", (e) => store.set("fontStretch", e.target.value));

    // Alignment
    const alignBtns = document.querySelectorAll(".text-align-btn");
    alignBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        alignBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        store.set("textAlign", btn.dataset.align);
      });
    });

    // Line height
    lineHeightRange.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      document.getElementById("label-line-height").textContent = `${val.toFixed(2)}x`;
      store.set("lineHeight", val);
    });

    // Letter spacing (tracking)
    letterSpacingRange.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      document.getElementById("label-letter-spacing").textContent = `${val} px`;
      store.set("letterSpacing", val);
    });

    // Word spacing
    wordSpacingRange.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      document.getElementById("label-word-spacing").textContent = `${val}px`;
      store.set("wordSpacing", val);
    });

    // Paragraph spacing
    paraSpacingRange.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      document.getElementById("label-para-spacing").textContent = `${val}px`;
      store.set("paragraphSpacing", val);
    });

    // Text transform
    textTransformSelect.addEventListener("change", (e) => store.set("textTransform", e.target.value));

    // Kerning
    kerningSelect.addEventListener("change", (e) => store.set("kerning", e.target.value));

    // Font variant
    fontVariantSelect.addEventListener("change", (e) => store.set("fontVariant", e.target.value));

    // Vertical align
    verticalAlignSelect.addEventListener("change", (e) => store.set("verticalAlign", e.target.value));

    // Text indent
    textIndentRange.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      document.getElementById("label-text-indent").textContent = `${val}px`;
      store.set("textIndent", val);
    });

    // White space
    whiteSpaceSelect.addEventListener("change", (e) => store.set("whiteSpace", e.target.value));
  }

  updateWeightLabel(weight) {
    const names = {
      100: "Thin", 200: "Extra Light", 300: "Light", 400: "Regular",
      500: "Medium", 600: "Semi Bold", 700: "Bold", 800: "Extra Bold", 900: "Black"
    };
    const label = document.getElementById("label-font-weight");
    if (label) {
      label.textContent = `${weight} (${names[weight] || "Variable"})`;
    }
  }

  initColorAndStroke() {
    const modeBtns = document.querySelectorAll(".fill-mode-btn");
    const solidControls = document.getElementById("solid-color-controls");
    const gradControls = document.getElementById("gradient-controls");
    const solidPicker = document.getElementById("picker-solid-color");
    const solidHex = document.getElementById("input-solid-hex");
    const opacityRange = document.getElementById("range-opacity");
    const gradAngleRange = document.getElementById("range-gradient-angle");

    // Mode switch
    modeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        modeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const mode = btn.dataset.mode;
        store.set("colorMode", mode);

        if (mode === "solid") {
          solidControls.classList.remove("hidden");
          gradControls.classList.add("hidden");
        } else {
          solidControls.classList.add("hidden");
          gradControls.classList.remove("hidden");
          const grad = store.state.gradient || GRADIENT_PRESETS[0];
          grad.type = mode === "radial-gradient" ? "radial" : "linear";
          store.set("gradient", grad);
        }
      });
    });

    // Solid color picker & hex
    solidPicker.addEventListener("input", (e) => {
      solidHex.value = e.target.value.toUpperCase();
      store.set("color", e.target.value);
    });

    solidHex.addEventListener("change", (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith("#")) val = "#" + val;
      solidPicker.value = val;
      store.set("color", val);
    });

    // Quick swatches
    document.querySelectorAll(".swatch-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const color = btn.dataset.color;
        solidPicker.value = color;
        solidHex.value = color.toUpperCase();
        store.set("color", color);
      });
    });

    // Gradient Presets Grid
    const gradGrid = document.getElementById("gradient-presets-grid");
    GRADIENT_PRESETS.forEach((grad, idx) => {
      const card = document.createElement("div");
      card.className = `gradient-card ${idx === 0 ? "active" : ""}`;
      const cssStops = grad.stops.map(s => `${s.color} ${s.offset}%`).join(", ");
      card.style.background = `linear-gradient(${grad.angle}deg, ${cssStops})`;
      card.title = grad.name;

      card.addEventListener("click", () => {
        document.querySelectorAll(".gradient-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        store.set("gradient", JSON.parse(JSON.stringify(grad)));
        gradAngleRange.value = grad.angle;
        document.getElementById("label-gradient-angle").textContent = `${grad.angle}°`;
      });
      gradGrid.appendChild(card);
    });

    gradAngleRange.addEventListener("input", (e) => {
      const angle = parseInt(e.target.value, 10);
      document.getElementById("label-gradient-angle").textContent = `${angle}°`;
      const currentGrad = store.state.gradient || GRADIENT_PRESETS[0];
      currentGrad.angle = angle;
      store.set("gradient", currentGrad);
    });

    // Opacity
    opacityRange.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10) / 100;
      document.getElementById("label-opacity").textContent = `${e.target.value}%`;
      store.set("opacity", val);
    });

    // Stroke controls
    const strokeEnable = document.getElementById("check-stroke-enable");
    const strokeOptions = document.getElementById("stroke-options");
    const strokeWidth = document.getElementById("range-stroke-width");
    const strokePicker = document.getElementById("picker-stroke-color");
    const strokeHex = document.getElementById("input-stroke-hex");
    const strokeJoin = document.getElementById("select-stroke-join");
    const strokeOrder = document.getElementById("select-stroke-order");

    strokeEnable.addEventListener("change", (e) => {
      const enabled = e.target.checked;
      strokeOptions.style.opacity = enabled ? "1" : "0.5";
      strokeOptions.style.pointerEvents = enabled ? "auto" : "none";
      const s = { ...store.state.stroke, enabled };
      store.set("stroke", s);
    });

    strokeWidth.addEventListener("input", (e) => {
      const width = parseInt(e.target.value, 10);
      document.getElementById("label-stroke-width").textContent = `${width} px`;
      const s = { ...store.state.stroke, width };
      store.set("stroke", s);
    });

    strokePicker.addEventListener("input", (e) => {
      strokeHex.value = e.target.value.toUpperCase();
      const s = { ...store.state.stroke, color: e.target.value };
      store.set("stroke", s);
    });

    strokeJoin.addEventListener("change", (e) => {
      const s = { ...store.state.stroke, join: e.target.value };
      store.set("stroke", s);
    });

    strokeOrder.addEventListener("change", (e) => {
      const s = { ...store.state.stroke, order: e.target.value };
      store.set("stroke", s);
    });

    // Text Decoration
    const decoLine = document.getElementById("select-deco-line");
    const decoStyle = document.getElementById("select-deco-style");
    const decoThickness = document.getElementById("range-deco-thickness");
    const decoPicker = document.getElementById("picker-deco-color");

    decoLine.addEventListener("change", (e) => {
      const d = { ...store.state.decoration, line: e.target.value };
      store.set("decoration", d);
    });

    decoStyle.addEventListener("change", (e) => {
      const d = { ...store.state.decoration, style: e.target.value };
      store.set("decoration", d);
    });

    decoThickness.addEventListener("input", (e) => {
      const d = { ...store.state.decoration, thickness: parseInt(e.target.value, 10) };
      store.set("decoration", d);
    });

    decoPicker.addEventListener("input", (e) => {
      document.getElementById("input-deco-hex").value = e.target.value.toUpperCase();
      const d = { ...store.state.decoration, color: e.target.value };
      store.set("decoration", d);
    });
  }

  initShadowsAndEffects() {
    const shadowGrid = document.getElementById("shadow-presets-grid");
    const rangeX = document.getElementById("range-shadow-x");
    const rangeY = document.getElementById("range-shadow-y");
    const rangeBlur = document.getElementById("range-shadow-blur");
    const pickerColor = document.getElementById("picker-shadow-color");
    const inputHex = document.getElementById("input-shadow-hex");
    const btnReset = document.getElementById("btn-reset-shadow");

    SHADOW_PRESETS.forEach((preset, idx) => {
      const card = document.createElement("button");
      card.className = `shadow-card ${idx === 1 ? "active" : ""}`;
      card.textContent = preset.name;

      card.addEventListener("click", () => {
        document.querySelectorAll(".shadow-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        store.set("shadows", JSON.parse(JSON.stringify(preset.layers)));
      });
      shadowGrid.appendChild(card);
    });

    const updateCustomShadow = () => {
      const x = parseInt(rangeX.value, 10);
      const y = parseInt(rangeY.value, 10);
      const blur = parseInt(rangeBlur.value, 10);
      const color = pickerColor.value;

      document.getElementById("label-shadow-x").textContent = `${x}px`;
      document.getElementById("label-shadow-y").textContent = `${y}px`;
      document.getElementById("label-shadow-blur").textContent = `${blur}px`;

      store.set("shadows", [{ x, y, blur, color }]);
    };

    rangeX.addEventListener("input", updateCustomShadow);
    rangeY.addEventListener("input", updateCustomShadow);
    rangeBlur.addEventListener("input", updateCustomShadow);
    pickerColor.addEventListener("input", (e) => {
      inputHex.value = e.target.value.toUpperCase();
      updateCustomShadow();
    });

    btnReset.addEventListener("click", () => {
      rangeX.value = 0;
      rangeY.value = 0;
      rangeBlur.value = 0;
      updateCustomShadow();
      document.querySelectorAll(".shadow-card").forEach(c => c.classList.remove("active"));
    });

    // Drop Cap
    const checkDropCap = document.getElementById("check-dropcap-enable");
    const dropCapOptions = document.getElementById("dropcap-options");
    const selectDropCapLines = document.getElementById("select-dropcap-lines");
    const pickerDropCapColor = document.getElementById("picker-dropcap-color");

    checkDropCap.addEventListener("change", (e) => {
      const enabled = e.target.checked;
      dropCapOptions.style.opacity = enabled ? "1" : "0.5";
      dropCapOptions.style.pointerEvents = enabled ? "auto" : "none";
      const dc = { ...store.state.dropCap, enabled };
      store.set("dropCap", dc);
    });

    selectDropCapLines.addEventListener("change", (e) => {
      const lines = parseInt(e.target.value, 10);
      const dc = { ...store.state.dropCap, lines };
      store.set("dropCap", dc);
    });

    pickerDropCapColor.addEventListener("input", (e) => {
      const dc = { ...store.state.dropCap, color: e.target.value };
      store.set("dropCap", dc);
    });
  }

  initAdvancedAndMicro() {
    const rangeBaseline = document.getElementById("range-micro-baseline");
    const rangeScaleX = document.getElementById("range-micro-scalex");
    const rangeScaleY = document.getElementById("range-micro-scaley");
    const rangeSlant = document.getElementById("range-micro-slant");
    const rangeRotate = document.getElementById("range-micro-rotate");
    const btnResetMicro = document.getElementById("btn-reset-micro");

    const updateMicro = () => {
      const micro = {
        baselineShift: parseInt(rangeBaseline.value, 10),
        scaleX: parseInt(rangeScaleX.value, 10),
        scaleY: parseInt(rangeScaleY.value, 10),
        slant: parseInt(rangeSlant.value, 10),
        rotate: parseInt(rangeRotate.value, 10)
      };

      document.getElementById("label-micro-baseline").textContent = `${micro.baselineShift} px`;
      document.getElementById("label-micro-scalex").textContent = `${micro.scaleX}%`;
      document.getElementById("label-micro-scaley").textContent = `${micro.scaleY}%`;
      document.getElementById("label-micro-slant").textContent = `${micro.slant}°`;
      document.getElementById("label-micro-rotate").textContent = `${micro.rotate}°`;

      store.set("microAdjust", micro);
    };

    rangeBaseline.addEventListener("input", updateMicro);
    rangeScaleX.addEventListener("input", updateMicro);
    rangeScaleY.addEventListener("input", updateMicro);
    rangeSlant.addEventListener("input", updateMicro);
    rangeRotate.addEventListener("input", updateMicro);

    btnResetMicro.addEventListener("click", () => {
      rangeBaseline.value = 0;
      rangeScaleX.value = 100;
      rangeScaleY.value = 100;
      rangeSlant.value = 0;
      rangeRotate.value = 0;
      updateMicro();
    });

    // OpenType Feature Toggles
    const featContainer = document.getElementById("opentype-features-container");
    OPENTYPE_FEATURES.forEach(f => {
      const wrap = document.createElement("div");
      wrap.className = "flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800";
      wrap.innerHTML = `
        <span class="font-mono text-[11px] text-slate-300" title="${f.desc}">${f.tag}</span>
        <label class="toggle-switch">
          <input type="checkbox" data-tag="${f.tag}" ${store.state.fontFeatureSettings[f.tag] ? "checked" : ""}>
          <span class="toggle-slider"></span>
        </label>
      `;
      wrap.querySelector("input").addEventListener("change", (e) => {
        const feats = { ...store.state.fontFeatureSettings, [f.tag]: e.target.checked };
        store.set("fontFeatureSettings", feats);
      });
      featContainer.appendChild(wrap);
    });

    // Rasterization / Engine tweaks
    document.getElementById("select-font-smoothing")?.addEventListener("change", (e) => {
      store.set("fontSmoothing", e.target.value);
    });

    document.getElementById("select-text-rendering")?.addEventListener("change", (e) => {
      store.set("textRendering", e.target.value);
    });

    document.getElementById("select-optical-sizing")?.addEventListener("change", (e) => {
      store.set("fontOpticalSizing", e.target.value);
    });

    document.getElementById("select-font-display")?.addEventListener("change", (e) => {
      store.set("fontDisplay", e.target.value);
    });

    this.renderVariableAxes();
  }

  renderVariableAxes() {
    const card = document.getElementById("variable-axes-card");
    const container = document.getElementById("variable-axes-container");
    const meta = store.state.fontMetadata;

    if (!card || !container) return;

    if (!meta || !meta.isVariable || !meta.axes || Object.keys(meta.axes).length === 0) {
      card.classList.add("hidden");
      return;
    }

    card.classList.remove("hidden");
    container.innerHTML = "";

    Object.values(meta.axes).forEach(ax => {
      const row = document.createElement("div");
      row.className = "control-row";
      const currentVal = (store.state.fontVariationSettings && store.state.fontVariationSettings[ax.tag]) || ax.default || ax.min;

      row.innerHTML = `
        <div class="flex justify-between items-center">
          <label class="label-xs font-mono uppercase">${ax.tag} (${ax.name})</label>
          <span class="text-xs font-mono text-violet-400 axis-val-label">${currentVal}</span>
        </div>
        <input type="range" class="range-slider" min="${ax.min}" max="${ax.max}" value="${currentVal}" step="${ax.tag === "ital" ? 0.1 : 1}">
      `;

      const slider = row.querySelector("input");
      const label = row.querySelector(".axis-val-label");

      slider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        label.textContent = val;
        const currentVariations = { ...store.state.fontVariationSettings, [ax.tag]: val };
        store.set("fontVariationSettings", currentVariations);
        if (ax.tag === "wght") {
          store.set("fontWeight", Math.round(val));
          this.updateWeightLabel(Math.round(val));
        }
      });

      container.appendChild(row);
    });
  }

  initCanvasControls() {
    const aspectBtns = document.querySelectorAll(".aspect-btn");
    const customDimWrap = document.getElementById("custom-dimensions-controls");
    const widthInput = document.getElementById("input-canvas-width");
    const heightInput = document.getElementById("input-canvas-height");
    const paddingRange = document.getElementById("range-canvas-padding");

    aspectBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        aspectBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const ratio = btn.dataset.ratio;

        if (ratio === "custom") {
          customDimWrap.classList.remove("hidden");
          customDimWrap.classList.add("grid");
        } else {
          customDimWrap.classList.add("hidden");
          customDimWrap.classList.remove("grid");
        }

        const c = { ...store.state.canvas, aspectRatio: ratio };
        store.set("canvas", c);
      });
    });

    const updateCustomDimensions = () => {
      const width = parseInt(widthInput.value, 10) || 1200;
      const height = parseInt(heightInput.value, 10) || 630;
      const c = { ...store.state.canvas, width, height };
      store.set("canvas", c);
    };

    widthInput.addEventListener("input", updateCustomDimensions);
    heightInput.addEventListener("input", updateCustomDimensions);

    paddingRange.addEventListener("input", (e) => {
      const padding = parseInt(e.target.value, 10);
      document.getElementById("label-canvas-padding").textContent = `${padding} px`;
      const c = { ...store.state.canvas, padding };
      store.set("canvas", c);
    });

    // Background Mode
    const bgModeBtns = document.querySelectorAll(".bg-mode-btn");
    const solidBgWrap = document.getElementById("bg-solid-controls");
    const pickerBg = document.getElementById("picker-bg-color");
    const inputBgHex = document.getElementById("input-bg-hex");

    bgModeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        bgModeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const mode = btn.dataset.mode;

        if (mode === "solid") {
          solidBgWrap.classList.remove("hidden");
        } else {
          solidBgWrap.classList.add("hidden");
        }

        const c = { ...store.state.canvas, backgroundMode: mode };
        store.set("canvas", c);
      });
    });

    pickerBg.addEventListener("input", (e) => {
      inputBgHex.value = e.target.value.toUpperCase();
      const c = { ...store.state.canvas, backgroundColor: e.target.value };
      store.set("canvas", c);
    });

    inputBgHex.addEventListener("change", (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith("#")) val = "#" + val;
      pickerBg.value = val;
      const c = { ...store.state.canvas, backgroundColor: val };
      store.set("canvas", c);
    });
  }

  initZoomAndStage() {
    const zoomText = document.getElementById("zoom-level-text");
    const canvasContainer = document.getElementById("canvas-container");
    const btnIn = document.getElementById("btn-zoom-in");
    const btnOut = document.getElementById("btn-zoom-out");
    const btnFit = document.getElementById("btn-zoom-fit");
    const btnRecenter = document.getElementById("btn-recenter");

    const applyZoom = (newZoom) => {
      this.currentZoom = Math.min(3.0, Math.max(0.2, newZoom));
      zoomText.textContent = `${Math.round(this.currentZoom * 100)}%`;
      canvasContainer.style.transform = `scale(${this.currentZoom})`;
    };

    btnIn.addEventListener("click", () => applyZoom(this.currentZoom + 0.15));
    btnOut.addEventListener("click", () => applyZoom(this.currentZoom - 0.15));
    btnRecenter.addEventListener("click", () => applyZoom(1.0));

    btnFit.addEventListener("click", () => {
      const viewport = document.getElementById("viewport");
      const bounds = this.renderer.renderedBounds;
      if (viewport && bounds && bounds.width > 0) {
        const vw = viewport.clientWidth - 80;
        const vh = viewport.clientHeight - 80;
        const scale = Math.min(vw / bounds.width, vh / bounds.height, 1.0);
        applyZoom(scale);
      }
    });
  }

  initExportModal() {
    const openBtn = document.getElementById("btn-open-export");
    const closeBtn = document.getElementById("btn-close-export");
    const modal = document.getElementById("export-modal");
    const modalContent = document.getElementById("export-modal-card");
    const fmtCards = document.querySelectorAll(".export-fmt-card");
    const scaleGroup = document.getElementById("export-scale-group");
    const svgGroup = document.getElementById("export-svg-group");
    const scaleBtns = document.querySelectorAll(".export-scale-btn");
    const filenameInput = document.getElementById("input-export-filename");
    const downloadBtn = document.getElementById("btn-download-action");
    const downloadText = document.getElementById("download-btn-text");
    const copyBtn = document.getElementById("btn-copy-clipboard");
    const copyText = document.getElementById("copy-btn-text");

    let currentFormat = "png";
    let currentScale = 2;

    const openModal = () => {
      modal.classList.remove("hidden");
      setTimeout(() => {
        modal.classList.remove("opacity-0");
        modalContent.classList.remove("scale-95");
      }, 10);
    };

    const closeModal = () => {
      modal.classList.add("opacity-0");
      modalContent.classList.add("scale-95");
      setTimeout(() => modal.classList.add("hidden"), 200);
    };

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    fmtCards.forEach(card => {
      card.addEventListener("click", () => {
        fmtCards.forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        currentFormat = card.dataset.fmt;
        downloadText.textContent = `Download ${currentFormat.toUpperCase()}`;

        if (currentFormat === "svg") {
          scaleGroup.classList.add("hidden");
          svgGroup.classList.remove("hidden");
        } else {
          scaleGroup.classList.remove("hidden");
          svgGroup.classList.add("hidden");
        }
      });
    });

    scaleBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        scaleBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentScale = parseInt(btn.dataset.scale, 10);
        const bounds = this.renderer.renderedBounds;
        const resLabel = document.getElementById("label-export-res");
        if (resLabel && bounds) {
          resLabel.textContent = `${currentScale}x (${bounds.width * currentScale} × ${bounds.height * currentScale})`;
        }
      });
    });

    downloadBtn.addEventListener("click", async () => {
      downloadBtn.disabled = true;
      downloadText.textContent = "Generating...";
      try {
        store.updateNested("export.fileName", filenameInput.value.trim() || "font-master");
        await this.exportEngine.exportFile(store.state, currentFormat, currentScale, 0.95);
        downloadText.textContent = "Saved!";
        setTimeout(() => {
          downloadText.textContent = `Download ${currentFormat.toUpperCase()}`;
          downloadBtn.disabled = false;
          closeModal();
        }, 800);
      } catch (err) {
        alert(`Export failed: ${err.message}`);
        downloadBtn.disabled = false;
        downloadText.textContent = `Download ${currentFormat.toUpperCase()}`;
      }
    });

    copyBtn.addEventListener("click", async () => {
      copyBtn.disabled = true;
      copyText.textContent = "Copying...";
      try {
        await this.exportEngine.copyToClipboard(store.state, currentFormat);
        copyText.textContent = "Copied to Clipboard!";
        setTimeout(() => {
          copyText.textContent = "Copy to Clipboard";
          copyBtn.disabled = false;
        }, 1200);
      } catch (err) {
        alert(`Clipboard copy failed: ${err.message}`);
        copyBtn.disabled = false;
        copyText.textContent = "Copy to Clipboard";
      }
    });
  }

  initKeyboardShortcuts() {
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          store.redo();
        } else {
          e.preventDefault();
          store.undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        store.redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        document.getElementById("btn-open-export")?.click();
      } else if (e.key === "Escape") {
        document.getElementById("btn-close-export")?.click();
        document.getElementById("sidebar-controls")?.classList.remove("mobile-open");
        document.querySelector(".mobile-backdrop")?.classList.remove("active");
      }
    });
  }

  initHistoryButtons() {
    document.getElementById("btn-undo")?.addEventListener("click", () => store.undo());
    document.getElementById("btn-redo")?.addEventListener("click", () => store.redo());
  }
}
