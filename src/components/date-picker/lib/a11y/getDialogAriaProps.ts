// Helpers preparing aria props or localized SR strings.
export const getDialogAriaProps = (isOpen: boolean): { 'aria-modal': string, 'role': string } => ({ 'aria-modal': 'true', 'role': 'dialog' });
