# Font Master ✦ Studio-Grade Typography & Font Preview

Font Master is a studio-grade typography design, font inspection, and high-DPI export web application. Upload custom font files (`.ttf`, `.otf`, `.woff`, `.woff2`) or `.zip` font archives, compose live typography with granular micro-adjustments, manage your local font library without logins, and export your typographic art as **PNG**, **JPEG**, **WEBP**, and **Pure Vector SVG** paths.

---

## ✨ Features

### 📦 Font Archive & Local Storage (No Login Required)
- **ZIP File Support**: Upload an entire `.zip` font package. Font Master automatically extracts all `.ttf`, `.otf`, `.woff`, and `.woff2` font variants (Regular, Bold, Italic, Light, etc.) in seconds.
- **Local IndexedDB Font Library**: All uploaded fonts are safely stored directly in your browser's local IndexedDB. Your fonts persist across page refreshes and browser restarts without requiring any account or login.
- **One-Click Font Switching**: Switch between any of your stored fonts instantly from the sidebar gallery. Delete unwanted fonts with one click.
- **Direct & Drag-and-Drop Uploads**:
  - Dedicated **"Choose Font or Zip..."** browse button for quick selection.
  - Interactive **Drag & Drop** zone with glowing border response.
  - **Fullscreen Drag Overlay** for dragging files anywhere into the browser.

### 🔤 100% Reliable Font Rendering Pipeline
- Dual-layer font registration using dynamic `@font-face` blob URLs combined with the native browser `FontFace` API.
- Broad weight and style descriptors (`font-weight: 100 900; font-style: normal italic oblique`) ensure every uploaded font renders cleanly on the high-DPI Canvas 2D engine across all weights and styles.
- True vector curve extraction with `opentype.js` for universal SVG exports.

### 🎨 Deep Customization & Typography Controls
- **Typography Metrics**: Font Size (8px–400px), Font Weight (100–900 / variable), Font Style, Font Stretch (50%–150%), Font Variant (Small-Caps, Tabular Nums), Line Height (Leading), Letter Spacing (Tracking), Word Spacing, Paragraph Spacing, First-Line Indent, and Kerning.
- **Alignment & Flow**: Left, Center, Right, Justify; Top, Center, Bottom vertical alignment; Text Transform (uppercase, lowercase, capitalize); White Space & Text Overflow handling.
- **Writing Modes**: Horizontal (LTR/RTL), Vertical Right-to-Left (`vertical-rl`), Vertical Left-to-Right (`vertical-lr`), and Text Orientation (`mixed`, `upright`, `sideways`).
- **Initial Drop Cap**: Customizable first-letter drop cap spanning 2 to 5 lines with custom color and weight.
- **Micro-Adjustments**: Baseline shift, Glyph Scale X & Y, Slant / Skew angle, and Canvas rotation.
- **Colors, Gradients & Strokes**:
  - Solid color picker + designer swatches.
  - Linear and Radial gradients with custom angle control and presets (*Cyberpunk, Liquid Gold, Sunset Glow, Chrome Metal, Emerald Aurora, Holographic*).
  - Text stroke width (1px–40px), color, line join (`round`, `bevel`, `miter`), and layering order (`Fill over Stroke` vs. `Stroke over Fill`).
- **Lighting & Shadows**: Soft drop shadow, Neon cyan glow, Neon pink glow, 3D stacked extrusion depth, and retro offset shadow.
- **OpenType Feature Toggles**: Live toggles for `liga` (Ligatures), `dlig`, `kern`, `smcp` (Small Caps), `zero` (Slashed Zero), `frac` (Fractions), and `calt`.
- **Variable Font Axes**: Automatically detects variable font `fvar` tables and generates real-time sliders for `wght`, `wdth`, `slnt`, `ital`, `opsz`, and custom axes.

### 🖼️ High-DPI Multi-Format Exporters
- **PNG**: Crisp lossless raster with transparency, scalable from **1x to 4x Ultra-HD / 300 DPI**.
- **JPEG**: Photo format with quality compression slider.
- **WEBP**: Next-gen lightweight web graphics.
- **SVG (True Vector Outlines)**: Uses `opentype.js` to convert font glyphs directly into mathematical `<path d="...">` curves. Opens in Figma, Illustrator, Inkscape, Cricut, and laser cutters without needing font installation.
- **1-Click Clipboard**: Instant copy PNG image or SVG markup.
- **Undo / Redo**: 40-step history stack (`Ctrl+Z`, `Ctrl+Y`).

---

## 🚀 Running Locally

```bash
cd font-master
python3 -m http.server 3000
```
Open **`http://localhost:3000`** in your browser.

---

## 🌐 Deploying to GitHub & Vercel

```bash
cd font-master
git remote add origin https://github.com/YOUR_USERNAME/font-master.git
git push -u origin main
```
Import the repository on [vercel.com](https://vercel.com) (Framework: **Other**, Root: `./`). All dependencies (`opentype.min.js`, `jszip.min.js`, CSS) are self-contained locally, so deployment is instant with zero configuration.

---

## 📄 License
MIT License. Free to use for personal and commercial projects.
