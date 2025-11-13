// src/utils/currency.ts
export const formatKES = (v: number | null | undefined) =>
  v == null ? '-' : new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v);
