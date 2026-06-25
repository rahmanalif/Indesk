export function hexToRgb(hex: string) {
  const safeHex = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#0066FF';
  const r = parseInt(safeHex.slice(1, 3), 16);
  const g = parseInt(safeHex.slice(3, 5), 16);
  const b = parseInt(safeHex.slice(5, 7), 16);
  return { r, g, b };
}

function safeColor(color: string) {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : '#0066FF';
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function hexToHsl(hex: string) {
  const { r, g, b } = hexToRgb(safeColor(hex));
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rNorm) h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
    else if (max === gNorm) h = (bNorm - rNorm) / d + 2;
    else h = (rNorm - gNorm) / d + 4;
    h /= 6;
  }

  return { h: h * 360, s, l };
}

export function hslToHex(h: number, s: number, l: number) {
  const hNorm = ((h % 360) + 360) % 360 / 360;
  const sNorm = clamp(s, 0, 1);
  const lNorm = clamp(l, 0, 1);

  const hueToRgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  let r: number;
  let g: number;
  let b: number;
  if (sNorm === 0) {
    r = g = b = lNorm;
  } else {
    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;
    r = hueToRgb(p, q, hNorm + 1 / 3);
    g = hueToRgb(p, q, hNorm);
    b = hueToRgb(p, q, hNorm - 1 / 3);
  }

  const toHex = (value: number) =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Relative luminance (WCAG) — used to decide readable foregrounds.
function luminance(hex: string) {
  const { r, g, b } = hexToRgb(safeColor(hex));
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

// A version of the brand color dark/saturated enough to carry white text
// (hero, primary buttons). Saturation and lightness are capped so large fills
// read as rich rather than glaring — light picks like amber get nudged darker,
// neon-bright picks get toned down so they don't burn the eyes.
export function brandStrong(color: string) {
  const { h, s, l } = hexToHsl(safeColor(color));
  // Keep large fills muted: cap saturation hard so vivid picks read as a soft,
  // calm tone rather than a glaring one, and keep a gentle mid lightness.
  return hslToHex(h, clamp(s, 0.32, 0.55), clamp(l, 0.36, 0.46));
}

// A version of the brand color readable as text/icons on white surfaces.
export function brandText(color: string) {
  const { h, s, l } = hexToHsl(safeColor(color));
  return hslToHex(h, Math.max(s, 0.4), Math.min(l, 0.42));
}

// Foreground color (white or near-black) that reads on a solid brand fill.
export function readableTextOn(color: string) {
  return luminance(brandStrong(color)) > 0.45 ? '#0f172a' : '#ffffff';
}

export function brandGradient(color: string) {
  const base = brandStrong(color);
  const { h, s, l } = hexToHsl(base);
  const darker = hslToHex(h, s, Math.max(l - 0.14, 0.1));
  return `linear-gradient(135deg, ${base} 0%, ${darker} 100%)`;
}

export function brandBg(color: string, opacity = 0.08) {
  // Tint built from the readable brand hue so faint backgrounds stay visible
  // even when the raw pick is very light.
  const { r, g, b } = hexToRgb(brandText(color));
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function hexToHslToken(hex: string) {
  const { h, s, l } = hexToHsl(hex);
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
