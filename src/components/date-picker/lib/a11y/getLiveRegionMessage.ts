const normalizeMessagePart = (part) => (typeof part === 'string' ? part.trim() : '');

export const getLiveRegionMessage = (...parts) =>
  parts.map(normalizeMessagePart).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
