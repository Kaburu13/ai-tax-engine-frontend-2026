// src/utils/date.ts
export const toLocalDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString() : 'N/A';
