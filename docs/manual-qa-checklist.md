# Manual QA Checklist for DatePicker

Source of truth:

- PRD section 11, "Тестирование и качество"
- PRD section 12, "Критерии приемки"

Use this checklist before release. Test the same scenarios in the same order every time.

## Test Matrix

Run the checklist in these environments:

- NVDA + Firefox
- NVDA + Chrome
- VoiceOver + Safari
- Safari iOS
- Chrome Android

## Test Fixtures

Use these states before each run:

- empty value
- selected date in current month
- selected date in another month
- out-of-range `value`
- disabled date inside visible month
- invalid manual input text
- required field state
- external invalid state

## Desktop Keyboard

### Open and close

- Open trigger with keyboard.
- Confirm dialog opens.
- Confirm focus lands on selected date or today.
- Press `Escape`.
- Confirm dialog closes.
- Confirm focus returns to trigger.
- Click trigger twice fast.
- Confirm no flicker or reopen loop.

### Navigation

- Move with Arrow keys.
- Confirm focus changes by one day or one week.
- Press `Home`.
- Confirm focus goes to start of week.
- Press `End`.
- Confirm focus goes to end of week.
- Press `PageUp`.
- Confirm month changes back one month.
- Press `PageDown`.
- Confirm month changes forward one month.
- Press `Shift+PageUp`.
- Confirm year changes back one year.
- Press `Shift+PageDown`.
- Confirm year changes forward one year.

### Selection

- Press `Enter` on focused day.
- Confirm value changes.
- Confirm dialog closes.
- Press `Space` on focused day.
- Confirm value changes.
- Confirm dialog closes.
- Move focus onto disabled day.
- Confirm disabled day cannot be selected.
- Confirm value does not change.

### Focus trap

- Open dialog.
- Press `Tab` across controls inside dialog.
- Confirm focus stays inside dialog.
- Press `Shift+Tab`.
- Confirm focus wraps inside dialog.

### Input

- Type partial date.
- Confirm draft text stays visible.
- Blur field with invalid full text.
- Confirm invalid text stays visible.
- Confirm error appears after blur.
- Clear field.
- Confirm `onChange(null)` path is reachable from clear action.

## Screen Reader

### Common checks

- Focus trigger.
- Confirm trigger label reflects empty state or selected date.
- Open dialog.
- Confirm dialog is announced as a modal dialog.
- Move month.
- Confirm month change is announced by live region.
- Focus a day.
- Confirm spoken label includes weekday, day, month, year, and state.

### Empty value

- Confirm trigger announces that no date is selected.
- Confirm opening starts on today.

### Selected value

- Confirm trigger announces the selected date.
- Confirm selected day is reported as selected.

### Disabled date

- Move screen reader focus to disabled date.
- Confirm date is announced as unavailable.
- Confirm disabled date cannot be chosen.

### Error state

- Enter invalid format.
- Blur the field.
- Confirm error is announced.
- Confirm input exposes `aria-invalid="true"`.
- Confirm described-by text links input and error text.

## Mobile Browser

### Safari iOS

- Open dialog on narrow viewport.
- Confirm field and trigger stack cleanly.
- Confirm dialog fits viewport.
- Confirm day buttons are large enough to tap.
- Confirm no horizontal overflow.
- Confirm calendar remains readable without separate mobile mode.

### Chrome Android

- Open dialog on narrow viewport.
- Confirm field and trigger stack cleanly.
- Confirm tap targets remain usable.
- Confirm dialog fits viewport.
- Confirm month header and grid do not clip.
- Confirm selection works by touch.

## Pass Criteria

Mark the run as pass only if all items below are true:

- keyboard flow works without mouse
- focus returns to trigger after close
- live region announces month changes
- disabled dates stay unavailable
- invalid input keeps draft text
- error state is exposed correctly
- mobile layout stays usable on narrow screens

