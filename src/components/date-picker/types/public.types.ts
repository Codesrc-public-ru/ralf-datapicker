export type DatePickerValue = Date | null;

export type DatePickerDisabledDatePredicate = (date: Date) => boolean;

export type DatePickerDisabledDates = Date[] | DatePickerDisabledDatePredicate;

export interface DatePickerProps {
  value: DatePickerValue;
  onChange: (value: DatePickerValue) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: DatePickerDisabledDates;
  locale?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
}
