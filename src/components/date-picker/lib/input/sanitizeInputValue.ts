/** Pure parsing + formatting helpers. No DOM. No React. */
const SPACING_AROUND_DOTS_PATTERN = /\s*\.\s*/g;
const MULTIPLE_DOTS_PATTERN = /\.{2,}/g;

export const sanitizeInputValue = (text: string): string => {
  let withoutControlChars = '';

  for (const char of text) {
    const code = char.charCodeAt(0);

    if (
      (code >= 0 && code <= 31) ||
      (code >= 127 && code <= 159) ||
      code === 8203 ||
      code === 8204 ||
      code === 8205 ||
      code === 65279
    ) {
      continue;
    }

    if (char === '/' || char === '\\' || char === '-') {
      withoutControlChars += '.';
      continue;
    }

    withoutControlChars += char;
  }

  const normalizedSpacing = withoutControlChars.replace(SPACING_AROUND_DOTS_PATTERN, '.');
  const collapsedDots = normalizedSpacing.replace(MULTIPLE_DOTS_PATTERN, '.');

  return collapsedDots.trim();
};
