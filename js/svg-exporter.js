/**
 * Font Master - True Vector SVG Exporter.
 * Generates pure vector path outlines via opentype.js OR rich styled SVG.
 */

export class SvgExporter {
  /**
   * Generate SVG markup from current state and layout bounds
   */
  generateSVG(state, bounds) {
    const width = bounds.width || 1200;
    const height = bounds.height || 630;
    const padding = state.canvas.padding || 60;
    const fontSize = state.fontSize || 64;
    const lineHeight = fontSize * (state.lineHeight || 1.15);
    const letterSpacing = state.letterSpacing || 0;
    const paraSpacing = state.paragraphSpacing || 24;

    let text = state.text || "";
    if (state.textTransform === "uppercase") text = text.toUpperCase();
    else if (state.textTransform === "lowercase") text = text.toLowerCase();
    else if (state.textTransform === "capitalize") text = text.replace(/\b\w/g, c => c.toUpperCase());

    const paragraphs = text.split("\n");

    let defs = "";
    let backgroundMarkup = "";

    // Background
    if (state.canvas.backgroundMode === "solid") {
      backgroundMarkup = `<rect width="${width}" height="${height}" fill="${state.canvas.backgroundColor || "#090b10"}" />`;
    } else if (state.canvas.backgroundMode === "gradient") {
      const grad = state.canvas.backgroundGradient;
      const angle = (grad ? grad.angle : 135) || 135;
      defs += `
    <linearGradient id="bgGradient" gradientTransform="rotate(${angle} 0.5 0.5)">
      ${(grad.stops || [{ offset: 0, color: "#0f172a" }, { offset: 100, color: "#020617" }]).map(s => `<stop offset="${s.offset}%" stop-color="${s.color}" />`).join("\n      ")}
    </linearGradient>`;
      backgroundMarkup = `<rect width="${width}" height="${height}" fill="url(#bgGradient)" />`;
    }

    // Text Fill (Solid or Gradient)
    let fillAttr = state.color || "#ffffff";
    if (state.colorMode === "linear-gradient" && state.gradient) {
      const angle = state.gradient.angle || 45;
      defs += `
    <linearGradient id="textGradient" gradientTransform="rotate(${angle} 0.5 0.5)">
      ${(state.gradient.stops || []).map(s => `<stop offset="${s.offset}%" stop-color="${s.color}" />`).join("\n      ")}
    </linearGradient>`;
      fillAttr = "url(#textGradient)";
    }

    // Text Stroke
    let strokeAttrs = "";
    if (state.stroke && state.stroke.enabled && state.stroke.width > 0) {
      strokeAttrs = `stroke="${state.stroke.color || "#00f0ff"}" stroke-width="${state.stroke.width}" stroke-linejoin="${state.stroke.join || "round"}"`;
    }

    // Shadows / Glow Filter
    let filterAttr = "";
    if (state.shadows && state.shadows.length > 0) {
      defs += `
    <filter id="svgShadow" x="-30%" y="-30%" width="160%" height="160%">
      ${state.shadows.map((sh, idx) => `
        <feDropShadow dx="${sh.x}" dy="${sh.y}" stdDeviation="${sh.blur / 2}" flood-color="${sh.color}" result="shadow_${idx}" />
      `).join("\n      ")}
      <feMerge>
        ${state.shadows.map((_, idx) => `<feMergeNode in="shadow_${idx}" />`).join("\n        ")}
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>`;
      filterAttr = `filter="url(#svgShadow)"`;
    }

    // Micro adjustments transform
    const micro = state.microAdjust || { baselineShift: 0, scaleX: 100, scaleY: 100, slant: 0, rotate: 0 };
    const cx = width / 2;
    const cy = height / 2;
    let groupTransform = `translate(${cx}, ${cy})`;
    if (micro.rotate) groupTransform += ` rotate(${micro.rotate})`;
    if (micro.slant) groupTransform += ` skewX(${micro.slant})`;
    if (micro.scaleX !== 100 || micro.scaleY !== 100) groupTransform += ` scale(${micro.scaleX / 100}, ${micro.scaleY / 100})`;
    if (micro.baselineShift) groupTransform += ` translate(0, ${micro.baselineShift})`;
    groupTransform += ` translate(${-cx}, ${-cy})`;

    let contentMarkup = "";

    // If opentype parsed font is available and vector mode requested, generate pure vector paths
    if (state.parsedFont && state.export.vectorFormat !== "embedded") {
      contentMarkup = this.generateOpentypePaths(state.parsedFont, paragraphs, state, width, height, fillAttr, strokeAttrs, filterAttr);
    } else {
      contentMarkup = this.generateTextElements(paragraphs, state, width, height, fillAttr, strokeAttrs, filterAttr);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    ${defs}
  </defs>
  ${backgroundMarkup}
  <g transform="${groupTransform}" opacity="${state.opacity !== undefined ? state.opacity : 1.0}">
    ${contentMarkup}
  </g>
</svg>`;
  }

  generateOpentypePaths(font, paragraphs, state, canvasWidth, canvasHeight, fillAttr, strokeAttrs, filterAttr) {
    const fontSize = state.fontSize || 64;
    const lineHeight = fontSize * (state.lineHeight || 1.15);
    const letterSpacing = state.letterSpacing || 0;
    const paraSpacing = state.paragraphSpacing || 24;
    const padding = state.canvas.padding || 60;

    let currentY = padding + fontSize;
    let paths = [];

    paragraphs.forEach((para, pIdx) => {
      const line = para;
      // Calculate width using font.getPaths or glyph widths
      let glyphsWidth = 0;
      for (let i = 0; i < line.length; i++) {
        const glyph = font.charToGlyph(line[i]);
        glyphsWidth += (glyph.advanceWidth || font.unitsPerEm * 0.6) * (fontSize / font.unitsPerEm) + letterSpacing;
      }

      let startX = padding;
      if (state.textAlign === "center") {
        startX = (canvasWidth - glyphsWidth) / 2;
      } else if (state.textAlign === "right") {
        startX = canvasWidth - padding - glyphsWidth;
      }

      let curX = startX;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const glyph = font.charToGlyph(char);
        const path = glyph.getPath(curX, currentY, fontSize);
        const svgPathData = path.toPathData();

        if (svgPathData && svgPathData.trim().length > 0) {
          paths.push(`<path d="${svgPathData}" fill="${fillAttr}" ${strokeAttrs} ${filterAttr} />`);
        }

        const adv = (glyph.advanceWidth || font.unitsPerEm * 0.6) * (fontSize / font.unitsPerEm);
        curX += adv + letterSpacing;
      }

      currentY += lineHeight + paraSpacing;
    });

    return paths.join("\n    ");
  }

  generateTextElements(paragraphs, state, canvasWidth, canvasHeight, fillAttr, strokeAttrs, filterAttr) {
    const fontSize = state.fontSize || 64;
    const lineHeight = fontSize * (state.lineHeight || 1.15);
    const letterSpacing = state.letterSpacing || 0;
    const paraSpacing = state.paragraphSpacing || 24;
    const padding = state.canvas.padding || 60;
    const family = state.fontFamily ? `"${state.fontFamily}", sans-serif` : "sans-serif";

    let textAnchor = "start";
    let startX = padding;
    if (state.textAlign === "center") {
      textAnchor = "middle";
      startX = canvasWidth / 2;
    } else if (state.textAlign === "right") {
      textAnchor = "end";
      startX = canvasWidth - padding;
    }

    let currentY = padding + fontSize;
    let linesMarkup = [];

    paragraphs.forEach((line) => {
      linesMarkup.push(`
      <text x="${startX}" y="${currentY}"
            font-family=${JSON.stringify(family)}
            font-size="${fontSize}"
            font-weight="${state.fontWeight || 400}"
            font-style="${state.fontStyle || "normal"}"
            letter-spacing="${letterSpacing}px"
            word-spacing="${state.wordSpacing || 0}px"
            text-anchor="${textAnchor}"
            fill="${fillAttr}"
            ${strokeAttrs}
            ${filterAttr}>
        ${this.escapeXml(line)}
      </text>`);
      currentY += lineHeight + paraSpacing;
    });

    return linesMarkup.join("\n");
  }

  escapeXml(str) {
    return str.replace(/[<>&"']/g, (c) => {
      switch (c) {
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "&": return "&amp;";
        case """: return "&quot;";
        case "'": return "&apos;";
      }
    });
  }
}

export const svgExporter = new SvgExporter();
