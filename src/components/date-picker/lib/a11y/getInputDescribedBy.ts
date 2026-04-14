const normalizeDescribedById = (id) => (typeof id === 'string' ? id.trim() : '');

export const getInputDescribedBy = (...ids) =>
  Array.from(new Set(ids.map(normalizeDescribedById).filter(Boolean))).join(' ');
