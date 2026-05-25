export const PIN_CATEGORIES = [
  'eggs',
  'vegetables',
  'fruits',
  'dairy',
  'meat',
  'honey',
  'other',
] as const;

export type PinCategory = (typeof PIN_CATEGORIES)[number];

export const PIN_CATEGORY_LABELS: Record<PinCategory, string> = {
  eggs: 'Jaja',
  vegetables: 'Warzywa',
  fruits: 'Owoce',
  dairy: 'Nabiał',
  meat: 'Mięso',
  honey: 'Miód',
  other: 'Inne',
};
