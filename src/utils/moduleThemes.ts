export interface ModuleTheme {
  id: number;
  slug: string;
  name_bn: string;
  step_label: string;
  colorName: string;
  // Soft badge colors (easy on the eyes)
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  // Card styles
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  iconBg: string;
  iconText: string;
  accentText: string;
  buttonBg: string;
  buttonHoverBg: string;
  gradient: string;
}

export const MODULE_THEMES: Record<number, ModuleTheme> = {
  1: {
    // Grammar Foundation
    id: 1,
    slug: 'grammar',
    name_bn: 'গ্রামার ফাউন্ডেশন (Grammar Foundation)',
    step_label: 'ধাপ ১',
    colorName: 'Emerald Green',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    cardBg: 'bg-emerald-50/20',
    cardBorder: 'border-emerald-200/80',
    cardHoverBorder: 'hover:border-emerald-400',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-700',
    accentText: 'text-emerald-800',
    buttonBg: 'bg-emerald-700',
    buttonHoverBg: 'hover:bg-emerald-800',
    gradient: 'from-emerald-800 to-teal-900',
  },
  2: {
    // Vocabulary & Collocations
    id: 2,
    slug: 'vocabulary',
    name_bn: 'ভোকাবুলারি ও কলোকেশন (Vocabulary Building)',
    step_label: 'ধাপ ২',
    colorName: 'Warm Amber',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-200',
    cardBg: 'bg-amber-50/20',
    cardBorder: 'border-amber-200/80',
    cardHoverBorder: 'hover:border-amber-400',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-700',
    accentText: 'text-amber-800',
    buttonBg: 'bg-amber-600',
    buttonHoverBg: 'hover:bg-amber-700',
    gradient: 'from-amber-700 to-orange-800',
  },
  3: {
    // Reading Comprehension
    id: 3,
    slug: 'reading',
    name_bn: 'রিডিং স্কিলস ও টেকনিকস (Reading Comprehension)',
    step_label: 'ধাপ ৩',
    colorName: 'Ocean Blue',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-900',
    badgeBorder: 'border-blue-200',
    cardBg: 'bg-blue-50/20',
    cardBorder: 'border-blue-200/80',
    cardHoverBorder: 'hover:border-blue-400',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-700',
    accentText: 'text-blue-800',
    buttonBg: 'bg-blue-700',
    buttonHoverBg: 'hover:bg-blue-800',
    gradient: 'from-blue-800 to-indigo-900',
  },
  4: {
    // Writing Task 1 & 2
    id: 4,
    slug: 'writing',
    name_bn: 'রাইটিং টাস্ক ১ ও ২ (Writing Mastery)',
    step_label: 'ধাপ ৪',
    colorName: 'Royal Violet',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-900',
    badgeBorder: 'border-purple-200',
    cardBg: 'bg-purple-50/20',
    cardBorder: 'border-purple-200/80',
    cardHoverBorder: 'hover:border-purple-400',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-700',
    accentText: 'text-purple-800',
    buttonBg: 'bg-purple-700',
    buttonHoverBg: 'hover:bg-purple-800',
    gradient: 'from-purple-800 to-slate-900',
  },
  5: {
    // Speaking Fluency & Cue Cards
    id: 5,
    slug: 'speaking',
    name_bn: 'স্পিকিং ফ্লুয়েন্সি ও কিউ কার্ড (Speaking Fluency)',
    step_label: 'ধাপ ৫',
    colorName: 'Warm Rose',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-900',
    badgeBorder: 'border-rose-200',
    cardBg: 'bg-rose-50/20',
    cardBorder: 'border-rose-200/80',
    cardHoverBorder: 'hover:border-rose-400',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-700',
    accentText: 'text-rose-800',
    buttonBg: 'bg-rose-700',
    buttonHoverBg: 'hover:bg-rose-800',
    gradient: 'from-rose-800 to-pink-900',
  },
  6: {
    // Listening & Accent
    id: 6,
    slug: 'listening',
    name_bn: 'লিসেনিং ও অ্যাকসেন্ট মাস্টারি (Listening Mastery)',
    step_label: 'ধাপ ৬',
    colorName: 'Calm Teal',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-900',
    badgeBorder: 'border-teal-200',
    cardBg: 'bg-teal-50/20',
    cardBorder: 'border-teal-200/80',
    cardHoverBorder: 'hover:border-teal-400',
    iconBg: 'bg-teal-100',
    iconText: 'text-teal-700',
    accentText: 'text-teal-800',
    buttonBg: 'bg-teal-700',
    buttonHoverBg: 'hover:bg-teal-800',
    gradient: 'from-teal-800 to-cyan-900',
  },
  7: {
    // IELTS Academic
    id: 7,
    slug: 'ielts-academic',
    name_bn: 'আইইএলটিএস একাডেমিক মক (IELTS Academic)',
    step_label: 'ধাপ ৭',
    colorName: 'Deep Indigo',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-900',
    badgeBorder: 'border-indigo-200',
    cardBg: 'bg-indigo-50/20',
    cardBorder: 'border-indigo-200/80',
    cardHoverBorder: 'hover:border-indigo-400',
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-700',
    accentText: 'text-indigo-800',
    buttonBg: 'bg-indigo-700',
    buttonHoverBg: 'hover:bg-indigo-800',
    gradient: 'from-indigo-800 to-slate-900',
  },
  8: {
    // IELTS General
    id: 8,
    slug: 'ielts-general',
    name_bn: 'আইইএলটিএস জেনারেল ট্রেনিং (IELTS General Training)',
    step_label: 'ধাপ ৮',
    colorName: 'Sky Cyan',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-900',
    badgeBorder: 'border-cyan-200',
    cardBg: 'bg-cyan-50/20',
    cardBorder: 'border-cyan-200/80',
    cardHoverBorder: 'hover:border-cyan-400',
    iconBg: 'bg-cyan-100',
    iconText: 'text-cyan-700',
    accentText: 'text-cyan-800',
    buttonBg: 'bg-cyan-700',
    buttonHoverBg: 'hover:bg-cyan-800',
    gradient: 'from-cyan-800 to-teal-900',
  }
};

export function getModuleTheme(categoryId?: number): ModuleTheme {
  if (!categoryId || !MODULE_THEMES[categoryId]) {
    // Default fallback
    return MODULE_THEMES[1];
  }
  return MODULE_THEMES[categoryId];
}
