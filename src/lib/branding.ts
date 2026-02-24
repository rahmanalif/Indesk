export function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export function brandGradient(color: string) {
  const { r, g, b } = hexToRgb(color.startsWith('#') ? color : '#0066FF');
  const darker = `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`;
  return `linear-gradient(135deg, ${color} 0%, ${darker} 100%)`;
}

export function brandBg(color: string, opacity = 0.08) {
  const { r, g, b } = hexToRgb(color.startsWith('#') ? color : '#0066FF');
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
