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
});
