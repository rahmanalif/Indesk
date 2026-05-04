export function hexToRgb(hex: string) {
  const safeHex = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#0066FF';
  const r = parseInt(safeHex.slice(1, 3), 16);
  const g = parseInt(safeHex.slice(3, 5), 16);
  const b = parseInt(safeHex.slice(5, 7), 16);
  return { r, g, b };
}

export function brandGradient(color: string) {
  const safeColor = /^#[0-9a-f]{6}$/i.test(color) ? color : '#0066FF';
  const { r, g, b } = hexToRgb(safeColor);
  const darker = `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`;
  return `linear-gradient(135deg, ${safeColor} 0%, ${darker} 100%)`;
}

export function brandBg(color: string, opacity = 0.08) {
  const { r, g, b } = hexToRgb(color.startsWith('#') ? color : '#0066FF');
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function hexToHslToken(hex: string) {
  const { r, g, b } = hexToRgb(hex.startsWith('#') ? hex : '#0066FF');
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

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
