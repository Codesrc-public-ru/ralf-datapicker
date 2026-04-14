/** Public Types */
export type DatePickerProps = {
  value: Date | null;
  onChange: (value: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  locale?: string;
};
