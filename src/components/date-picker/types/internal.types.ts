/** Internal Types */
export type InternalState = {
  isOpen: boolean;
  visibleMonth: Date | null;
  focusedDay: Date | null;
  rawInputValue: string;
  // ... other internal state fields
};
