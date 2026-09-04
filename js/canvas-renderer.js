/**
 * Font Master - High-DPI Canvas 2D Rendering Pipeline.
 * Handles typography layout, drop caps, multi-shadows, gradients, strokes, and writing modes.
 */

import { fontEngine } from "./font-engine.js";

export class CanvasRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.renderedBounds = { width: 0, height: 0, textWidth: 0, textHeight: 0 };
  }

  render(state, scaleMultiplier = 1, isExport = false) {
    const ctx = this.ctx;
    const canvas = this.canvas;

    let text = state.text || "";
    if (state.textTransform === "uppercase") {
      text = text.toUpperCase();
    } else if (state.textTransform === "lowercase") {
      text = text.toLowerCase();
    } else if (state.textTransform === "capitalize") {
      text = text.replace(/\b\w/g, c => c.toUpperCase());
    }

    let rawParagraphs = text.split("\n");
    if (rawParagraphs.length === 0) rawParagraphs = [""];

    const fontSize = state.fontSize || 64;
    const lineHeight = fontSize * (state.lineHeight || 1.15);
    const letterSpacing = state.letterSpacing || 0;
    const wordSpacing = state.wordSpacing || 0;
    const paraSpacing = state.paragraphSpacing || 24;
    const indent = state.textIndent || 0;

    const fontStyle = state.fontStyle || "normal";
    const fontWeight = state.fontWeight || 400;
    const fontStretch = state.fontStretch || "100%";
    const fontVariant = state.fontVariant || "normal";
    const family = state.fontFamily ? `"${state.fontFamily}", sans-serif` : "sans-serif";
    const fontString = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${family}`;

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
        let width = this.measureTextWidth(ctx, line, letterSpacing);
        if (lIdx === 0 && indent > 0) width += indent;
        if (width > maxLineWidth) maxLineWidth = width;
      });
    });

    const totalLinesCount = paragraphLines.reduce((acc, p) => acc + p.lines.length, 0);
    const totalTextHeight = (totalLinesCount * lineHeight) + ((paragraphLines.length - 1) * paraSpacing);

    let dropCapChar = "";
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

    let canvasWidth = 1200;
    let canvasHeight = 630;
    const padding = state.canvas.padding || 60;

    if (state.canvas.aspectRatio === "auto") {
      canvasWidth = Math.max(320, Math.ceil(maxLineWidth + padding * 2));
      canvasHeight = Math.max(220, Math.ceil(totalTextHeight + padding * 2));
    } else if (state.canvas.aspectRatio === "1:1") {
      const side = Math.max(maxLineWidth + padding * 2, totalTextHeight + padding * 2, 800);
      canvasWidth = side;
      canvasHeight = side;
    } else if (state.canvas.aspectRatio === "16:9") {
      canvasWidth = Math.max(1280, Math.ceil(maxLineWidth + padding * 2));
      canvasHeight = Math.round((canvasWidth * 9) / 16);
      if (canvasHeight < totalTextHeight + padding * 2) {
        canvasHeight = Math.ceil(totalTextHeight + padding * 2);
        canvasWidth = Math.round((canvasHeight * 16) / 9);
      }
    } else if (state.canvas.aspectRatio === "9:16") {
      canvasHeight = Math.max(1280, Math.ceil(totalTextHeight + padding * 2));
      canvasWidth = Math.round((canvasHeight * 9) / 16);
    } else if (state.canvas.aspectRatio === "4:5") {
      canvasWidth = Math.max(800, Math.ceil(maxLineWidth + padding * 2));
      canvasHeight = Math.round((canvasWidth * 5) / 4);
    } else if (state.canvas.aspectRatio === "custom") {
      canvasWidth = state.canvas.width || 1200;
      canvasHeight = state.canvas.height || 630;
    }

    this.renderedBounds = {
      width: canvasWidth,
      height: canvasHeight,
      textWidth: maxLineWidth,
      textHeight: totalTextHeight
    };

    const exportScale = Math.max(1, Math.min(4, scaleMultiplier));
    canvas.width = Math.round(canvasWidth * exportScale);
    canvas.height = Math.round(canvasHeight * exportScale);

    ctx.restore();
    ctx.save();
    ctx.scale(exportScale, exportScale);

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    this.drawBackground(ctx, canvasWidth, canvasHeight, state, isExport);

    const micro = state.microAdjust || { baselineShift: 0, scaleX: 100, scaleY: 100, slant: 0, rotate: 0 };
    ctx.save();

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    ctx.translate(centerX, centerY);

    if (micro.rotate !== 0) {
      ctx.rotate((micro.rotate * Math.PI) / 180);
    }
    const skewX = Math.tan(((micro.slant || 0) * Math.PI) / 180);
    const scaleX = (micro.scaleX || 100) / 100;
    const scaleY = (micro.scaleY || 100) / 100;
    ctx.transform(scaleX, 0, skewX, scaleY, 0, micro.baselineShift || 0);
    ctx.translate(-centerX, -centerY);

    ctx.globalAlpha = Math.max(0, Math.min(1, state.opacity !== undefined ? state.opacity : 1.0));

    let startY = padding + fontSize;
    if (state.verticalAlign === "center") {
      startY = (canvasHeight - totalTextHeight) / 2 + fontSize * 0.9;
    } else if (state.verticalAlign === "bottom") {
      startY = canvasHeight - padding - totalTextHeight + fontSize;
    }

    const textFill = this.createFillStyle(ctx, state, canvasWidth, canvasHeight);
    const shadows = (state.shadows && state.shadows.length > 0) ? state.shadows : [{ x: 0, y: 0, blur: 0, color: "transparent" }];

    // Shadow pass
    shadows.forEach(shadow => {
      if (shadow.blur > 0 || shadow.x !== 0 || shadow.y !== 0) {
        ctx.save();
        ctx.shadowOffsetX = shadow.x;
        ctx.shadowOffsetY = shadow.y;
        ctx.shadowBlur = shadow.blur;
        ctx.shadowColor = shadow.color;
        this.renderTextLayout(ctx, paragraphLines, state, startY, canvasWidth, textFill, dropCapChar, dropCapWidth, dropCapHeight, dropCapLines, false, true);
        ctx.restore();
      }
    });

    // Foreground pass
    this.renderTextLayout(ctx, paragraphLines, state, startY, canvasWidth, textFill, dropCapChar, dropCapWidth, dropCapHeight, dropCapLines, true, false);

    ctx.restore(); // micro
    ctx.restore(); // scale
  }

  drawBackground(ctx, width, height, state, isExport) {
    const bgMode = state.canvas.backgroundMode || "checkerboard";

    if (bgMode === "checkerboard") {
      if (isExport) return;
      const size = 16;
      ctx.fillStyle = "#0e121a";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#161c27";
      for (let y = 0; y < height; y += size) {
        for (let x = 0; x < width; x += size) {
          if ((x / size + y / size) % 2 === 0) {
            ctx.fillRect(x, y, size, size);
          }
        }
      }
    } else if (bgMode === "solid") {
      ctx.fillStyle = state.canvas.backgroundColor || "#090b10";
      ctx.fillRect(0, 0, width, height);
    } else if (bgMode === "gradient") {
      const grad = state.canvas.backgroundGradient;
      const angle = ((grad ? grad.angle : 135) * Math.PI) / 180;
      const x1 = width / 2 - (Math.cos(angle) * width) / 2;
      const y1 = height / 2 - (Math.sin(angle) * height) / 2;
      const x2 = width / 2 + (Math.cos(angle) * width) / 2;
      const y2 = height / 2 + (Math.sin(angle) * height) / 2;
      const canvasGrad = ctx.createLinearGradient(x1, y1, x2, y2);
      if (grad && grad.stops) {
        grad.stops.forEach(s => canvasGrad.addColorStop(s.offset / 100, s.color));
      } else {
        canvasGrad.addColorStop(0, "#0f172a");
        canvasGrad.addColorStop(1, "#020617");
      }
      ctx.fillStyle = canvasGrad;
      ctx.fillRect(0, 0, width, height);
    }
  }

  createFillStyle(ctx, state, width, height) {
    if (state.colorMode === "solid") {
      return state.color || "#ffffff";
    }
    if (state.colorMode === "linear-gradient" && state.gradient) {
      const angleRad = ((state.gradient.angle || 45) * Math.PI) / 180;
      const r = Math.sqrt(width * width + height * height) / 2;
      const cx = width / 2;
      const cy = height / 2;
      const x1 = cx - Math.cos(angleRad) * r * 0.6;
      const y1 = cy - Math.sin(angleRad) * r * 0.6;
      const x2 = cx + Math.cos(angleRad) * r * 0.6;
      const y2 = cy + Math.sin(angleRad) * r * 0.6;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      (state.gradient.stops || []).forEach(stop => {
        grad.addColorStop(Math.min(1, Math.max(0, stop.offset / 100)), stop.color);
      });
      return grad;
    }
    if (state.colorMode === "radial-gradient" && state.gradient) {
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) / 2;
      const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      (state.gradient.stops || []).forEach(stop => {
        radGrad.addColorStop(Math.min(1, Math.max(0, stop.offset / 100)), stop.color);
      });
      return radGrad;
    }
    return "#ffffff";
  }

  renderTextLayout(ctx, paragraphLines, state, startY, canvasWidth, textFill, dropCapChar, dropCapWidth, dropCapHeight, dropCapLines, renderForeground, isShadowPass) {
    const fontSize = state.fontSize || 64;
    const lineHeight = fontSize * (state.lineHeight || 1.15);
    const letterSpacing = state.letterSpacing || 0;
    const family = state.fontFamily ? `"${state.fontFamily}", sans-serif` : "sans-serif";
    const fontString = `${state.fontStyle || "normal"} ${state.fontVariant || "normal"} ${state.fontWeight || 400} ${fontSize}px ${family}`;

    ctx.font = fontString;
    ctx.textBaseline = "alphabetic";

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

        if (state.textAlign === "center") {
          startX = (canvasWidth - measuredWidth) / 2;
        } else if (state.textAlign === "right") {
          startX = canvasWidth - (state.canvas.padding || 60) - measuredWidth;
        }

        if (lIdx === 0 && state.textIndent && !dropCapChar) {
          startX += state.textIndent;
        }

        if (pIdx === 0 && lIdx === 0 && dropCapChar) {
          const dropCapFontSize = fontSize * (dropCapLines * 0.95);
          ctx.save();
          ctx.font = `${state.dropCap.weight || 900} ${dropCapFontSize}px ${family}`;
          ctx.fillStyle = state.dropCap.color || "#00f0ff";
          ctx.fillText(dropCapChar, startX, currentY + (dropCapFontSize * 0.35));
          ctx.restore();
          ctx.font = fontString;
        }

        const textDrawX = startX + xOffset;
        this.renderSingleLine(ctx, drawLine, textDrawX, currentY, letterSpacing, textFill, state, isShadowPass);

        if (renderForeground && state.decoration && state.decoration.line !== "none") {
          this.renderDecoration(ctx, state.decoration, textDrawX, currentY, measuredWidth - xOffset, fontSize);
        }

        currentY += lineHeight;
      });

      currentY += (state.paragraphSpacing || 24);
    });
  }

  renderSingleLine(ctx, text, x, y, letterSpacing, fillStyle, state, isShadowPass) {
    const stroke = state.stroke;
    const hasStroke = stroke && stroke.enabled && stroke.width > 0;

    if (letterSpacing === 0) {
      if (hasStroke && !isShadowPass) {
        ctx.save();
        ctx.lineWidth = stroke.width;
        ctx.strokeStyle = stroke.color || "#00f0ff";
        ctx.lineJoin = stroke.join || "round";
        if (stroke.order === "stroke-first") {
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
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        if (hasStroke && !isShadowPass) {
          ctx.save();
          ctx.lineWidth = stroke.width;
          ctx.strokeStyle = stroke.color || "#00f0ff";
          ctx.lineJoin = stroke.join || "round";
          if (stroke.order === "stroke-first") {
            ctx.strokeText(char, curX, y);
            ctx.fillStyle = fillStyle;
            ctx.fillText(char, curX, y);
          } else {
            ctx.fillStyle = fillStyle;
            ctx.fillText(char, curX, y);
            ctx.strokeText(char, curX, y);
          }
          ctx.restore();
        } else {
          ctx.fillStyle = fillStyle;
          ctx.fillText(char, curX, y);
        }

        curX += charWidth + letterSpacing;
      }
    }
  }

  renderDecoration(ctx, deco, x, y, width, fontSize) {
    ctx.save();
    ctx.strokeStyle = deco.color || "#ffffff";
    ctx.lineWidth = deco.thickness || 2;

    if (deco.style === "dashed") {
      ctx.setLineDash([6, 4]);
    } else if (deco.style === "dotted") {
      ctx.setLineDash([2, 3]);
    } else {
      ctx.setLineDash([]);
    }

    let lineY = y + (deco.offset || 4);
    if (deco.line === "overline") {
      lineY = y - fontSize * 0.85;
    } else if (deco.line === "line-through") {
      lineY = y - fontSize * 0.35;
    }

    ctx.beginPath();
    ctx.moveTo(x, lineY);
    ctx.lineTo(x + width, lineY);
    ctx.stroke();
    ctx.restore();
  }

  measureTextWidth(ctx, text, letterSpacing = 0) {
    if (!text) return 0;
    const baseWidth = ctx.measureText(text).width;
    return baseWidth + Math.max(0, text.length - 1) * letterSpacing;
  }
}
