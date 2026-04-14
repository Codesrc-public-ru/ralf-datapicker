const normalizeDescribedById = (id: string | null | undefined): string =>
  typeof id === 'string' ? id.trim() : '';

export const getInputDescribedBy = (...ids: Array<string | null | undefined>): string =>
  Array.from(new Set(ids.map(normalizeDescribedById).filter(Boolean))).join(' ');
