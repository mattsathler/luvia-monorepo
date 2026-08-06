export const GENDERS = ['male', 'female', 'other'] as const;
export type Gender = (typeof GENDERS)[number];

export const DEFAULT_GENDER: Gender = 'other';
