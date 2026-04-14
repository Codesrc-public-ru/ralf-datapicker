/** Pure parsing + formatting helpers. No DOM. No React. */
const CONTROL_CHARS_PATTERN = /[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g;
const SEPARATOR_PATTERN = /[\/\\-]/g;
const SPACING_AROUND_DOTS_PATTERN = /\s*\.\s*/g;
const MULTIPLE_DOTS_PATTERN = /\.{2,}/g;

export const sanitizeInputValue = (text: string): string => {
  const withoutControlChars = text.replace(CONTROL_CHARS_PATTERN, '');
  const normalizedSeparators = withoutControlChars.replace(SEPARATOR_PATTERN, '.');
  const normalizedSpacing = normalizedSeparators.replace(SPACING_AROUND_DOTS_PATTERN, '.');
  const collapsedDots = normalizedSpacing.replace(MULTIPLE_DOTS_PATTERN, '.');

  return collapsedDots.trim();
};
