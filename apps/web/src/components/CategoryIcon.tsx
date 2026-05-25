import type { PinCategory } from '@freshmarket/shared';
import { CATEGORY_STYLES, categoryIconSvg } from '@/lib/categoryMarkers';

interface CategoryIconProps {
  category: PinCategory;
  size?: number;
}

export function CategoryIcon({ category, size = 20 }: CategoryIconProps) {
  const accent = CATEGORY_STYLES[category].accent;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden
      style={{ flexShrink: 0, display: 'block' }}
    >
      <g dangerouslySetInnerHTML={{ __html: categoryIconSvg(category, accent) }} />
    </svg>
  );
}
