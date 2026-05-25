import type { PinCategory } from '@freshmarket/shared';

const CATEGORY_STYLES: Record<
  PinCategory,
  { bg: string; accent: string; label: string }
> = {
  eggs: { bg: '#fff8e1', accent: '#f9a825', label: 'Jaja' },
  vegetables: { bg: '#e8f5e9', accent: '#2e7d32', label: 'Warzywa' },
  fruits: { bg: '#fce4ec', accent: '#c62828', label: 'Owoce' },
  dairy: { bg: '#e3f2fd', accent: '#1565c0', label: 'Nabiał' },
  meat: { bg: '#fbe9e7', accent: '#bf360c', label: 'Mięso' },
  honey: { bg: '#fff3e0', accent: '#ef6c00', label: 'Miód' },
  other: { bg: '#f5f5f5', accent: '#546e7a', label: 'Inne' },
};

/** SVG paths inside viewBox 0 0 32 32 */
export function categoryIconSvg(category: PinCategory, accent: string): string {
  const icons: Record<PinCategory, string> = {
    eggs: `<ellipse cx="16" cy="17" rx="7" ry="9" fill="${accent}" opacity="0.9"/><ellipse cx="16" cy="15" rx="5" ry="7" fill="#fffde7" opacity="0.5"/>`,
    vegetables: `<path d="M16 8c-2 4-6 6-6 11a6 6 0 0012 0c0-5-4-7-6-11z" fill="${accent}"/><path d="M16 8v3" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>`,
    fruits: `<circle cx="16" cy="17" r="7" fill="${accent}"/><path d="M16 10c0-2 2-3 3-1" stroke="#33691e" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
    dairy: `<rect x="13" y="5.5" width="6" height="2.5" rx="1" fill="${accent}"/><path d="M14 8h4l.8 2.2H13.2L14 8z" fill="${accent}" opacity="0.85"/><path d="M12 10.5h8l-1.2 14.5c0 .8-.6 1.5-2.8 1.5s-2.8-.7-2.8-1.5L12 10.5z" fill="${accent}"/><path d="M13.5 18h5v5.5c0 1-1 1.5-2.5 1.5s-2.5-.5-2.5-1.5V18z" fill="#fff" opacity="0.45"/>`,
    meat: `<path d="M11 14h10l-1.5 6H12.5L11 14z" fill="${accent}"/><ellipse cx="16" cy="13" rx="5" ry="2.5" fill="${accent}" opacity="0.85"/>`,
    honey: `<path d="M16 9l6 3.5v7L16 23l-6-3.5v-7L16 9z" fill="${accent}"/><path d="M16 9v14M10 12.5v7M22 12.5v7" stroke="#fff" stroke-width="1" opacity="0.4"/>`,
    other: `<path d="M10 12h12l-1 10H11l-1-10z" fill="${accent}"/><path d="M13 12c0-3 2-5 3-5s3 2 3 5" stroke="${accent}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  };
  return icons[category] ?? icons.other;
}

export function categoryIconMarkup(
  category: PinCategory | string,
  size = 32,
): string {
  const cat = (category in CATEGORY_STYLES ? category : 'other') as PinCategory;
  const accent = CATEGORY_STYLES[cat].accent;
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${categoryIconSvg(cat, accent)}</svg>`;
}

export function createCategoryMarkerElement(
  category: PinCategory | string,
  options: { selected: boolean; title: string },
): HTMLButtonElement {
  const cat = (category in CATEGORY_STYLES ? category : 'other') as PinCategory;
  const style = CATEGORY_STYLES[cat];
  const size = options.selected ? 44 : 38;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pin-marker pin-marker--category';
  btn.title = options.title;
  btn.setAttribute('aria-label', `${style.label}: ${options.title}`);

  const ring = options.selected ? '#1b4332' : '#ffffff';
  const scale = options.selected ? 'scale(1.08)' : 'scale(1)';

  btn.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    padding: 0;
    border: 3px solid ${ring};
    border-radius: 50%;
    background: ${style.bg};
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(26, 46, 26, 0.28);
    transform: ${scale};
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  btn.innerHTML = categoryIconMarkup(cat, 32);

  return btn;
}

export { CATEGORY_STYLES };
