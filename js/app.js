/**
 * Font Master — Application Bootstrapper & Entry Point.
 */

import { CanvasRenderer } from "./canvas-renderer.js";
import { ExportEngine } from "./export-engine.js";
import { UIController } from "./ui-controller.js";
import { fontEngine } from "./font-engine.js";
import { CURATED_FONTS } from "./presets.js";
import { store } from "./state.js";

document.addEventListener("DOMContentLoaded", async () => {
  const canvasElement = document.getElementById("preview-canvas");
  if (!canvasElement) {
    console.error("Target preview canvas element not found");
    return;
  }

  // Initialize Rendering & Export Engines
  const renderer = new CanvasRenderer(canvasElement);
  const exportEngine = new ExportEngine(renderer);
  const uiController = new UIController(renderer, exportEngine);

  // Initialize UI Event Bindings
  uiController.init();

  // Load Initial Curated Font (Inter Variable)
  try {
    const defaultFont = CURATED_FONTS[0];
    await fontEngine.loadPresetFont(defaultFont);
    uiController.updateFontBadge(store.state);
    uiController.renderVariableAxes();
  } catch (err) {
    console.warn("Default font preloading note:", err);
  }

  // Window resize handler
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      renderer.render(store.state, 1, false);
      uiController.updateDimensionsBadge();
    }, 150);
  });

  console.log("⚡ Font Master Studio initialized successfully.");
});
