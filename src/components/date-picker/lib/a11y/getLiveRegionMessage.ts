const normalizeMessagePart = (part: string | null | undefined): string =>
  typeof part === 'string' ? part.trim() : '';

export const getLiveRegionMessage = (...parts: Array<string | null | undefined>): string =>
  parts.map(normalizeMessagePart).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
