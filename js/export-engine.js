/**
 * Font Master - Multi-format Export & Clipboard Engine.
 * Supports PNG, JPEG, WEBP, SVG downloads and clipboard integration.
 */

import { svgExporter } from "./svg-exporter.js";

export class ExportEngine {
  constructor(renderer) {
    this.renderer = renderer;
  }

  /**
   * Export the graphic in chosen format
   */
  async exportFile(state, format, scale = 2, quality = 0.95) {
    const fileName = this.generateFileName(state, format);

    if (format === "svg") {
      const svgString = svgExporter.generateSVG(state, this.renderer.renderedBounds);
      this.downloadBlob(new Blob([svgString], { type: "image/svg+xml;charset=utf-8" }), fileName);
      return { success: true, fileName, format };
    }

    // Raster exports: create an offscreen canvas at high resolution
    const exportCanvas = document.createElement("canvas");
    const offscreenRenderer = new this.renderer.constructor(exportCanvas);

    // If JPEG, ensure non-transparent background
    const exportState = JSON.parse(JSON.stringify(state));
    if (format === "jpeg" && exportState.canvas.backgroundMode === "checkerboard") {
      exportState.canvas.backgroundMode = "solid";
      exportState.canvas.backgroundColor = "#090b10";
    }

    // Preserve font buffers
    exportState.fontBuffer = state.fontBuffer;
    exportState.parsedFont = state.parsedFont;

    offscreenRenderer.render(exportState, scale, true);

    const mimeType = format === "jpeg" ? "image/jpeg" : (format === "webp" ? "image/webp" : "image/png");

    return new Promise((resolve, reject) => {
      exportCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas blob generation failed"));
          return;
        }
        this.downloadBlob(blob, fileName);
        resolve({ success: true, fileName, format, size: blob.size });
      }, mimeType, quality);
    });
  }

  /**
   * Copy image or SVG to clipboard
   */
  async copyToClipboard(state, format = "png") {
    if (format === "svg") {
      const svgString = svgExporter.generateSVG(state, this.renderer.renderedBounds);
      await navigator.clipboard.writeText(svgString);
      return { success: true, type: "svg-text" };
    }

    // PNG copy
    const exportCanvas = document.createElement("canvas");
    const offscreenRenderer = new this.renderer.constructor(exportCanvas);
    const exportState = JSON.parse(JSON.stringify(state));
    exportState.fontBuffer = state.fontBuffer;
    exportState.parsedFont = state.parsedFont;

    offscreenRenderer.render(exportState, 2, true);

    return new Promise((resolve, reject) => {
      exportCanvas.toBlob(async (blob) => {
        if (!blob) return reject(new Error("Blob creation failed"));
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob })
            ]);
            resolve({ success: true, type: "png-blob" });
          } else {
            reject(new Error("Clipboard API not supported in this browser context"));
          }
        } catch (err) {
          reject(err);
        }
      }, "image/png");
    });
  }

  generateFileName(state, format) {
    const rawName = state.export.fileName || "font-master";
    const font = (state.fontMetadata && state.fontMetadata.family ? state.fontMetadata.family : "custom")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    const timestamp = new Date().toISOString().slice(0, 10);
    const ext = format === "jpeg" ? "jpg" : format;
    return `${rawName}-${font}-${timestamp}.${ext}`;
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
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
