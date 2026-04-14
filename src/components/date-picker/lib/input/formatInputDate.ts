/** Pure parsing + formatting helpers. No DOM. No React. */
const padInputDatePart = (value: number): string => String(value).padStart(2, '0');

export const formatInputDate = (date: Date): string => {
  const day = padInputDatePart(date.getDate());
  const month = padInputDatePart(date.getMonth() + 1);
  const year = String(date.getFullYear()).padStart(4, '0');

  return `${day}.${month}.${year}`;
};
