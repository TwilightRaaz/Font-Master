# Font Master ✦ Studio-Grade Typography & Font Preview

Font Master is a studio-grade typography design, font inspection, and high-DPI export web application. Upload custom font files (`.ttf`, `.otf`, `.woff`, `.woff2`), compose live text with deep micro-adjustments, test variable font axes, and export your typographic art as **PNG**, **JPEG**, **WEBP**, and **Pure Vector SVG** paths.

---

## ✨ Features

### 🔤 Font Management & Variable Font Engine
- **Drag & Drop Upload**: Instant support for `.ttf`, `.otf`, `.woff`, and `.woff2` font files.
- **Variable Font Axes Discovery**: Automatically reads `fvar` tables and generates dynamic sliders for `wght` (Weight), `wdth` (Width), `slnt` (Slant), `ital` (Italic), `opsz` (Optical Size), and custom axes.
- **OpenType Feature Controls**: Interactive toggles for `liga` (Ligatures), `dlig`, `kern`, `smcp` (Small Caps), `zero` (Slashed Zero), `frac` (Fractions), `calt`, `tnum`, and stylistic sets.
- **Curated Font Presets**: Built-in modern fonts ready immediately: Inter, Playfair Display, Cinzel, Space Grotesk, Syne, Fira Code, Great Vibes, and Bungee.

### 🎨 Deep Customization & Typography Controls
- **Typography Metrics**: Font Size (8px–400px), Line Height (Leading), Letter Spacing (Tracking), Word Spacing, Paragraph Spacing, First-line Indent, Font Stretch (50%–200%), Font Style, and Font Variant.
- **Alignment & Flow**: Left, Center, Right, Justify alignment; Top, Center, Bottom vertical alignment; Text Transform (uppercase, lowercase, capitalize); White Space & Text Overflow handling.
- **Writing Modes**: Horizontal (LTR/RTL), Vertical Right-to-Left (`vertical-rl`), and Vertical Left-to-Right (`vertical-lr`) with text orientation options.
- **Initial Drop Cap**: Customizable first-letter drop cap spanning 2 to 5 lines with independent color and weight.
- **Micro-Adjustments**: Baseline shift, Glyph Scale X & Y, Slant/Skew angle, and Canvas rotation.
- **Colors, Gradients & Strokes**:
  - Solid color picker + designer palette swatches.
  - Linear and Radial gradients with custom angle control and luxury presets (Cyberpunk, Liquid Gold, Sunset Glow, Chrome Metal, Emerald Aurora, Holographic Prism).
  - Multi-join text stroke (Round, Bevel, Miter) with selectable layering order (Fill over Stroke vs. Stroke over Fill).
  - Text decoration: Underline, Overline, Line-Through with solid, double, dotted, dashed, and wavy styles.
- **Lighting & Shadows**: Soft drop shadow, Neon glow, 3D stacked extrusion depth, and retro offset shadow.
- **Engine Tweaks**: Font smoothing (antialiased, subpixel), Text rendering optimization, and Font optical sizing.

### 🖼️ Artboard & Export Studio
- **Canvas Presets**: Auto-fit text, 1:1 Square, 16:9 Banner, 9:16 Story/Reel, 4:5 Social, and Custom WxH.
- **Backgrounds**: Transparent (dark designer checkerboard), Solid color, and Gradients.
- **High-DPI Multi-Format Exporters**:
  - **PNG**: Crisp lossless raster with transparency, scalable from **1x to 4x Ultra-HD / 300 DPI**.
  - **JPEG**: Photo format with quality compression slider.
  - **WEBP**: Next-gen lightweight web graphics.
  - **SVG (True Vector Outlines)**: Uses `opentype.js` to convert font glyphs directly into mathematical `<path d="...">` curves. Opens flawlessly in Figma, Adobe Illustrator, Inkscape, Cricut, and laser cutters without needing the font installed!
- **1-Click Clipboard**: Instant copy PNG blob or SVG markup to system clipboard.
- **Undo / Redo**: 40-step history stack (`Ctrl+Z`, `Ctrl+Y`).
- **Responsive & Touch Friendly**: Mobile drawer navigation, pinch-zoomable stage, dark mode default.

---

## 🚀 Running Locally

### Option 1: Python (Instant, No Dependencies)
```bash
cd font-master
python3 -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Node.js / NPM
```bash
cd font-master
npm start
```

---

## 🌐 Deploying to GitHub & Vercel

Font Master is structured for **zero-config static deployment** on Vercel. All vendor dependencies (`opentype.min.js`) are bundled locally, ensuring your deployment never fails from external CDN timeouts or build bottlenecks.

### Step 1: Initialize Git and Push to GitHub

```bash
cd font-master
git init
git add .
git commit -m "Initial commit: Font Master typography studio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/font-master.git
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Method A: Via Vercel Web Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Import your `font-master` repository from GitHub.
4. Leave all build settings as default (Framework: **Other**, Root Directory: `./`).
5. Click **"Deploy"**. Your app will be live with an SSL domain in ~15 seconds!

#### Method B: Via Vercel CLI
```bash
npm i -g vercel
cd font-master
vercel
```

---

## 📁 Project Architecture

```
font-master/
├── index.html              # Core single-page studio application
├── vercel.json             # Vercel security headers and caching configuration
├── package.json            # Scripts & project metadata
├── .gitignore              # Git ignore configuration
├── README.md               # Documentation & deployment guide
├── css/
│   ├── style.css           # Dark-mode design system & control components
│   └── responsive.css      # Mobile drawer, media queries, and layout helpers
├── js/
│   ├── app.js              # Application bootstrapper
│   ├── state.js            # Reactive state store with 40-step history stack
│   ├── presets.js          # Curated fonts, pangrams, gradients, shadow presets
│   ├── font-engine.js      # FontFace & OpenType parser (axes & features)
│   ├── canvas-renderer.js  # High-DPI Canvas 2D engine
│   ├── svg-exporter.js     # True vector Bézier curve path extractor
│   ├── export-engine.js    # PNG, JPEG, WEBP, SVG downloads & clipboard
│   └── ui-controller.js    # Complete UI event bindings and micro-interactions
└── vendor/
    └── opentype.min.js     # Local offline OpenType parser
```

---

## 📄 License
MIT License. Free to use for personal and commercial projects.
