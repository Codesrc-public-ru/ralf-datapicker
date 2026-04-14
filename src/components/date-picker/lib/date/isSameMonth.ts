export const isSameMonth = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
