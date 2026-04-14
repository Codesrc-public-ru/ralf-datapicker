import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const featureDir = path.join(rootDir, 'src/components/date-picker');

const requiredFiles = [
  'DatePicker.tsx',
  'DatePicker.module.css',
  'index.ts',
  'constants/accessibility.ts',
  'constants/formats.ts',
  'constants/keyboard.ts',
  'lib/a11y/getDayAriaLabel.ts',
  'lib/a11y/getDialogAriaProps.ts',
  'lib/a11y/getInputDescribedBy.ts',
  'lib/a11y/getLiveRegionMessage.ts',
  'lib/a11y/getTriggerAriaLabel.ts',
  'lib/date/addDays.ts',
  'lib/date/addMonths.ts',
  'lib/date/addYears.ts',
  'lib/date/buildMonthMatrix.ts',
  'lib/date/compareDates.ts',
  'lib/date/getToday.ts',
  'lib/date/isDateDisabled.ts',
  'lib/date/isDateInRange.ts',
  'lib/date/isSameDay.ts',
  'lib/date/isSameMonth.ts',
  'lib/date/normalizeDate.ts',
  'lib/date/startOfWeek.ts',
  'lib/i18n/formatFullDateLabel.ts',
  'lib/i18n/formatMonthLabel.ts',
  'lib/i18n/formatWeekdayLabel.ts',
  'lib/i18n/getFirstDayOfWeek.ts',
  'lib/i18n/getMonthYearLabel.ts',
  'lib/i18n/getWeekdayNames.ts',
  'lib/input/formatInputDate.ts',
  'lib/input/parseInputDate.ts',
  'lib/input/sanitizeInputValue.ts',
  'model/useDatePickerFocus.ts',
  'model/useDatePickerInput.ts',
  'model/useDatePickerKeyboard.ts',
  'model/useDatePickerState.ts',
  'model/validation.ts',
  'tests/DatePicker.test.tsx',
  'tests/accessibility.test.tsx',
  'tests/date-utils.test.ts',
  'tests/focus-management.test.tsx',
  'tests/input-validation.test.tsx',
  'tests/keyboard-navigation.test.tsx',
  'types/internal.types.ts',
  'types/public.types.ts',
  'ui/CalendarDayCell.tsx',
  'ui/CalendarGrid.tsx',
  'ui/CalendarHeader.tsx',
  'ui/CalendarWeekdays.tsx',
  'ui/DatePickerDialog.tsx',
  'ui/DatePickerError.tsx',
  'ui/DatePickerField.tsx',
  'ui/DatePickerTrigger.tsx'
];

const errors = [];

for (const relativePath of requiredFiles) {
  const absolutePath = path.join(featureDir, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`Missing file: ${path.relative(rootDir, absolutePath)}`);
  }
}

const indexPath = path.join(featureDir, 'index.ts');
const indexSource = fs.readFileSync(indexPath, 'utf8');
if (!indexSource.includes("export { default as DatePicker } from './DatePicker';")) {
  errors.push('index.ts must re-export DatePicker');
}
if (!indexSource.includes("export type { DatePickerProps } from './types/public.types';")) {
  errors.push('index.ts must export public types');
}

const sourceFiles = requiredFiles
  .filter((filePath) => filePath.endsWith('.ts') || filePath.endsWith('.tsx'))
  .map((filePath) => path.join(featureDir, filePath));

const importsByFile = new Map();
const importPattern = /^\s*import\s+(?:type\s+)?(?:[\w*${}\s,]+\s+from\s+)?['"](.+?)['"];?\s*$/gm;

for (const filePath of sourceFiles) {
  const source = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1];
    if (specifier.startsWith('.')) {
      const resolved = resolveRelativeImport(filePath, specifier);
      if (resolved) {
        imports.push(resolved);
      }
    }
  }
  importsByFile.set(filePath, imports);
}

for (const [filePath, imports] of importsByFile) {
  const relativePath = path.relative(featureDir, filePath).replace(/\\/g, '/');
  if (relativePath.startsWith('ui/')) {
    for (const importedPath of imports) {
      const importedRelative = path.relative(featureDir, importedPath).replace(/\\/g, '/');
      if (importedRelative.startsWith('lib/') || importedRelative.startsWith('model/')) {
        errors.push(`ui layer must not import logic modules directly: ${relativePath}`);
      }
    }
  }
}

const cycles = detectCycles(importsByFile);
for (const cycle of cycles) {
  errors.push(`Import cycle found: ${cycle}`);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('DatePicker scaffold check passed.');

function resolveRelativeImport(fromFile, specifier) {
  const basePath = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    path.join(basePath, 'index.ts'),
    path.join(basePath, 'index.tsx')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

function detectCycles(graph) {
  const visiting = new Set();
  const visited = new Set();
  const pathStack = [];
  const cycles = [];

  function visit(node) {
    if (visiting.has(node)) {
      const startIndex = pathStack.indexOf(node);
      const cycleNodes = pathStack.slice(startIndex).concat(node);
      cycles.push(cycleNodes.map((file) => path.relative(featureDir, file).replace(/\\/g, '/')).join(' -> '));
      return;
    }

    if (visited.has(node)) {
      return;
    }

    visiting.add(node);
    pathStack.push(node);

    for (const next of graph.get(node) ?? []) {
      visit(next);
    }

    pathStack.pop();
    visiting.delete(node);
    visited.add(node);
  }

  for (const node of graph.keys()) {
    visit(node);
  }

  return cycles;
}
