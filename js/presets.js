/**
 * Font Master - Preset configurations, curated fonts, gradients, and text samples.
 */

export const CURATED_FONTS = [
  {
    name: 'Inter',
    family: 'Inter',
    category: 'sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    preview: 'Clean & Neutral Modern Sans',
    variable: true,
    axes: { wght: { min: 100, max: 900, default: 700 } }
  },
  {
    name: 'Playfair Display',
    family: 'Playfair Display',
    category: 'serif',
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap',
    preview: 'High-contrast Editorial Serif',
    variable: true,
    axes: { wght: { min: 400, max: 900, default: 700 } }
  },
  {
    name: 'Cinzel',
    family: 'Cinzel',
    category: 'serif',
    url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&display=swap',
    preview: 'Classical Roman Inscription',
    variable: true,
    axes: { wght: { min: 400, max: 900, default: 700 } }
  },
  {
    name: 'Space Grotesk',
    family: 'Space Grotesk',
    category: 'sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap',
    preview: 'Tech Brutalist Proportional',
    variable: true,
    axes: { wght: { min: 300, max: 700, default: 600 } }
  },
  {
    name: 'Syne',
    family: 'Syne',
    category: 'display',
    url: 'https://fonts.googleapis.com/css2?family=Syne:wght@400..800&display=swap',
    preview: 'Avant-garde Statement Display',
    variable: true,
    axes: { wght: { min: 400, max: 800, default: 800 } }
  },
  {
    name: 'Fira Code',
    family: 'Fira Code',
    category: 'monospace',
    url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&display=swap',
    preview: 'Monospace with Rich Ligatures',
    variable: true,
    axes: { wght: { min: 300, max: 700, default: 500 } }
  },
  {
    name: 'Great Vibes',
    family: 'Great Vibes',
    category: 'handwriting',
    url: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap',
    preview: 'Flowing Elegant Calligraphy',
    variable: false
  },
  {
    name: 'Bungee',
    family: 'Bungee',
    category: 'display',
    url: 'https://fonts.googleapis.com/css2?family=Bungee&display=swap',
    preview: 'Bold Urban Street Display',
    variable: false
  },
  {
    name: 'System Sans',
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    category: 'sans-serif',
    url: null,
    preview: 'Native System Sans',
    variable: false
  },
  {
    name: 'System Serif',
    family: 'Georgia, Cambria, "Times New Roman", Times, serif',
    category: 'serif',
    url: null,
    preview: 'Native System Serif',
    variable: false
  },
  {
    name: 'System Mono',
    family: 'ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace',
    category: 'monospace',
    url: null,
    preview: 'Native System Monospace',
    variable: false
  }
];

export const PANGRAM_PRESETS = [
  {
    title: 'Font Master Brand',
    text: 'FONT MASTER\nSTUDIO TYPOGRAPHY'
  },
  {
    title: 'Classic Pangram',
    text: 'The quick brown fox jumps over the lazy dog.'
  },
  {
    title: 'Quartz Pangram',
    text: 'Sphinx of black quartz, judge my vow.'
  },
  {
    title: 'Design Quote',
    text: 'Typography is what language looks like.'
  },
  {
    title: 'Character Set & Numerals',
    text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n0123456789 &@$#%*!?'
  },
  {
    title: 'Multi-line Paragraph (Drop Cap)',
    text: 'Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed.\n\nThe arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing to create visual harmony.'
  }
];

export const GRADIENT_PRESETS = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    type: 'linear',
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
    type: 'linear',
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
    type: 'linear',
    angle: 135,
    stops: [
      { offset: 0, color: '#f72585' },
      { offset: 50, color: '#7209b7' },
      { offset: 100, color: '#4361ee' }
    ]
  },
  {
    id: 'chrome-silver',
    name: 'Chrome Metal',
    type: 'linear',
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
    type: 'linear',
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
    type: 'linear',
    angle: 45,
    stops: [
      { offset: 0, color: '#a855f7' },
      { offset: 25, color: '#ec4899' },
      { offset: 50, color: '#eab308' },
      { offset: 75, color: '#22c55e' },
      { offset: 100, color: '#06b6d4' }
    ]
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    type: 'radial',
    angle: 0,
    stops: [
      { offset: 0, color: '#c084fc' },
      { offset: 60, color: '#6366f1' },
      { offset: 100, color: '#1e1b4b' }
    ]
  }
];

export const SHADOW_PRESETS = [
  {
    id: 'none',
    name: 'None',
    layers: []
  },
  {
    id: 'soft-drop',
    name: 'Soft Drop Shadow',
    layers: [
      { x: 0, y: 8, blur: 20, color: 'rgba(0, 0, 0, 0.65)' }
    ]
  },
  {
    id: 'neon-cyan',
    name: 'Neon Cyan Glow',
    layers: [
      { x: 0, y: 0, blur: 5, color: '#06b6d4' },
      { x: 0, y: 0, blur: 15, color: '#0891b2' },
      { x: 0, y: 0, blur: 35, color: '#0e7490' }
    ]
  },
  {
    id: 'neon-pink',
    name: 'Neon Violet & Magenta',
    layers: [
      { x: 0, y: 0, blur: 6, color: '#f43f5e' },
      { x: 0, y: 0, blur: 18, color: '#a855f7' },
      { x: 0, y: 0, blur: 40, color: '#7c3aed' }
    ]
  },
  {
    id: 'extruded-3d',
    name: '3D Extrusion Depth',
    layers: [
      { x: 1, y: 1, blur: 0, color: '#6d28d9' },
      { x: 2, y: 2, blur: 0, color: '#5b21b6' },
      { x: 3, y: 3, blur: 0, color: '#4c1d95' },
      { x: 4, y: 4, blur: 0, color: '#3b0764' },
      { x: 5, y: 5, blur: 0, color: '#2e0854' },
      { x: 6, y: 6, blur: 10, color: 'rgba(0, 0, 0, 0.7)' }
    ]
  },
  {
    id: 'retro-hard',
    name: 'Retro Hard Shadow',
    layers: [
      { x: 6, y: 6, blur: 0, color: '#000000' }
    ]
  }
];

export const OPENTYPE_FEATURES = [
  { tag: 'liga', name: 'Standard Ligatures', desc: 'Replaces character pairs like fi, fl with custom ligatures' },
  { tag: 'dlig', name: 'Discretionary Ligatures', desc: 'Decorative letter combinations like st, ct' },
  { tag: 'kern', name: 'Kerning', desc: 'Fine-tunes inter-glyph spacing pairs' },
  { tag: 'smcp', name: 'Small Capitals', desc: 'Turns lowercase characters into small capitals' },
  { tag: 'c2sc', name: 'Caps to Small Caps', desc: 'Converts uppercase to small capitals' },
  { tag: 'zero', name: 'Slashed Zero', desc: 'Substitutes zero with a slashed zero to distinguish from O' },
  { tag: 'frac', name: 'Fractions', desc: 'Formats slash-separated numbers into diagonal fractions' },
  { tag: 'calt', name: 'Contextual Alternates', desc: 'Context-sensitive alternate glyphs' },
  { tag: 'tnum', name: 'Tabular Numerals', desc: 'Equal-width numbers for aligned data tables' },
  { tag: 'onum', name: 'Oldstyle Numerals', desc: 'Numbers with ascenders and descenders' },
  { tag: 'ss01', name: 'Stylistic Set 1', desc: 'Alternate glyph set 1' },
  { tag: 'ss02', name: 'Stylistic Set 2', desc: 'Alternate glyph set 2' }
];
