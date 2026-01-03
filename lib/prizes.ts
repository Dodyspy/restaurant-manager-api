import { Prize } from '../types/prize';

export const PRIZES: Prize[] = [
  {
    id: 'nowin',
    label: 'Merci 🙏',
    kind: 'nowin',
    terms: 'À très vite',
    probability: 0.50,
    emoji: '🙏',
  },
  {
    id: 'espresso',
    label: 'Espresso offert',
    kind: 'instant',
    terms: 'À consommer sur place aujourd\'hui',
    probability: 0.25,
    emoji: '☕',
  },
  {
    id: 'limoncello',
    label: 'Digestif offert',
    kind: 'instant',
    terms: 'Limoncello à consommer sur place aujourd\'hui',
    probability: 0.15,
    emoji: '🍋',
  },
  {
    id: 'dessert',
    label: 'Dessert offert',
    kind: 'next_visit',
    terms: 'Valable lors de votre prochaine visite',
    probability: 0.08,
    emoji: '🍰',
  },
  {
    id: 'discount',
    label: '-15% sur votre prochain repas',
    kind: 'next_visit',
    terms: 'Hors menu, valable lors de votre prochaine visite',
    probability: 0.02,
    emoji: '🎁',
  },
];

export function selectRandomPrize(): Prize {
  const random = Math.random();
  let cumulative = 0;

  for (const prize of PRIZES) {
    cumulative += prize.probability;
    if (random < cumulative) {
      return prize;
    }
  }

  return PRIZES[0];
}

export function generateRedeemCode(prizeId: string): string | null {
  if (prizeId === 'nowin') {
    return null;
  }

  const prefix = prizeId.substring(0, 3).toUpperCase();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${prefix}-${code}`;
}
