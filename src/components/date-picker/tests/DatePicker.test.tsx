describe('DatePicker unit scaffold', () => {
  test('keeps the public component focused on controlled props', () => {
    const source = dp.read('src/components/date-picker/DatePicker.tsx');

    expect(source).toContain("import type { DatePickerProps } from './types/public.types';");
    expect(source).toContain('export default function DatePicker(props: DatePickerProps): null {');
    expect(source).toContain('return null;');
  });

  test('re-exports the public API from the feature index', () => {
    const source = dp.read('src/components/date-picker/index.ts');

    expect(source).toContain("export { default as DatePicker } from './DatePicker';");
    expect(source).toContain("export type { DatePickerProps } from './types/public.types';");
  });

  test('keeps presentational UI components separate from model and lib layers', () => {
    const uiFiles = [
      'src/components/date-picker/ui/DatePickerField.tsx',
      'src/components/date-picker/ui/DatePickerTrigger.tsx',
      'src/components/date-picker/ui/DatePickerError.tsx',
      'src/components/date-picker/ui/DatePickerDialog.tsx',
      'src/components/date-picker/ui/CalendarHeader.tsx',
      'src/components/date-picker/ui/CalendarWeekdays.tsx',
      'src/components/date-picker/ui/CalendarGrid.tsx',
      'src/components/date-picker/ui/CalendarDayCell.tsx'
    ];

    for (const file of uiFiles) {
      const source = dp.read(file);

      expect(source).not.toContain("../lib/");
      expect(source).not.toContain("../model/");
    }
  });

  test('renders dialog, grid, weekdays, and day cell semantics in UI layer', () => {
    expect(dp.read('src/components/date-picker/ui/DatePickerDialog.tsx')).toContain('role="dialog"');
    expect(dp.read('src/components/date-picker/ui/DatePickerDialog.tsx')).toContain(
      'aria-modal="true"'
    );
    expect(dp.read('src/components/date-picker/ui/CalendarGrid.tsx')).toContain('role="grid"');
    expect(dp.read('src/components/date-picker/ui/CalendarWeekdays.tsx')).toContain('scope="col"');
    expect(dp.read('src/components/date-picker/ui/CalendarDayCell.tsx')).toContain(
      'role="gridcell"'
    );
    expect(dp.read('src/components/date-picker/ui/CalendarDayCell.tsx')).toContain(
      'aria-selected'
    );
    expect(dp.read('src/components/date-picker/ui/CalendarDayCell.tsx')).toContain('disabled=');
  });
});
