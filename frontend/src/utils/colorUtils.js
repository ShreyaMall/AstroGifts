export const getHexColor = (colorVal) => {
  if (!colorVal) return '#cccccc';
  const str = String(colorVal).trim();
  if (str.startsWith('#') || str.startsWith('rgb')) return str;
  const normalized = str.toLowerCase();
  const hexMap = {
    'bone white': '#f9f6f0',
    'white': '#ffffff',
    'black': '#1c1c1c',
    'grey': '#808080',
    'gray': '#808080',
    'dark grey': '#444444',
    'light grey': '#d3d3d3',
    'brown': '#654321',
    'dark brown': '#3e2723',
    'natural': '#c8a870',
    'wood': '#8b5a2b',
    'beige': '#f5f5dc',
    'navy': '#000080',
    'blue': '#2563eb',
    'red': '#dc2626',
    'green': '#16a34a',
    'teal': '#008080',
    'yellow': '#eab308',
    'orange': '#ffa500',
    'pink': '#ffc0cb',
    'purple': '#800080',
    'charcoal': '#36454f',
    'walnut': '#4a2c11',
    'oak': '#b89768',
    'teak': '#b38244'
  };
  if (hexMap[normalized]) return hexMap[normalized];
  for (const key in hexMap) {
    if (normalized.includes(key)) return hexMap[key];
  }
  return '#cccccc';
};

export const getColorName = (colorVal) => {
  if (!colorVal) return '';
  const str = String(colorVal).trim();
  
  if (!str.startsWith('#')) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const hexLower = str.toLowerCase();
  const hexColors = {
    '#e8e0d4': 'Bone',
    '#f9f6f0': 'Bone White',
    '#ffffff': 'White',
    '#000000': 'Black',
    '#111111': 'Black',
    '#1a1a1a': 'Black',
    '#1c1c1c': 'Black',
    '#222222': 'Black',
    '#2b2b2b': 'Dark Grey',
    '#333333': 'Dark Grey',
    '#444444': 'Dark Grey',
    '#555555': 'Grey',
    '#666666': 'Grey',
    '#808080': 'Grey',
    '#999999': 'Grey',
    '#aaaaaa': 'Light Grey',
    '#cccccc': 'Light Grey',
    '#d3d3d3': 'Light Grey',
    '#e5e7eb': 'Light Grey',
    '#f3f4f6': 'Off White',
    '#654321': 'Brown',
    '#3e2723': 'Dark Brown',
    '#8b4513': 'Saddle Brown',
    '#a0522d': 'Brown',
    '#d2b48c': 'Tan',
    '#f5f5dc': 'Beige',
    '#c8a870': 'Natural',
    '#8b5a2b': 'Wood Brown',
    '#4a2c11': 'Walnut',
    '#b89768': 'Oak',
    '#b38244': 'Teak',
    '#000080': 'Navy',
    '#0000ff': 'Blue',
    '#2563eb': 'Blue',
    '#3b82f6': 'Blue',
    '#ff0000': 'Red',
    '#dc2626': 'Red',
    '#ef4444': 'Red',
    '#008000': 'Green',
    '#16a34a': 'Green',
    '#22c55e': 'Green',
    '#008080': 'Teal',
    '#ffff00': 'Yellow',
    '#eab308': 'Yellow',
    '#ffa500': 'Orange',
    '#f97316': 'Orange',
    '#ffc0cb': 'Pink',
    '#ec4899': 'Pink',
    '#800080': 'Purple',
    '#a855f7': 'Purple',
    '#36454f': 'Charcoal'
  };

  if (hexColors[hexLower]) {
    return hexColors[hexLower];
  }

  // Fallback parser if hex code is not explicitly in map
  const cleanHex = hexLower.replace('#', '');
  if (cleanHex.length === 3 || cleanHex.length === 6) {
    const fullHex = cleanHex.length === 3
      ? cleanHex.split('').map(c => c + c).join('')
      : cleanHex;
    const num = parseInt(fullHex, 16);
    if (!isNaN(num)) {
      const r = (num >> 16) & 255;
      const g = (num >> 8) & 255;
      const b = num & 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;
      const avg = (r + g + b) / 3;

      if (diff < 20) {
        if (avg < 40) return 'Black';
        if (avg < 100) return 'Dark Grey';
        if (avg < 180) return 'Grey';
        if (avg < 235) return 'Light Grey';
        return 'White';
      }

      if (r > g && r > b) {
        if (g > 100 && b < 100) return 'Brown';
        return 'Red';
      }
      if (g > r && g > b) return 'Green';
      if (b > r && b > g) return 'Blue';
      if (r > 150 && g > 150 && b < 100) return 'Beige';
    }
  }

  return 'Natural';
};
