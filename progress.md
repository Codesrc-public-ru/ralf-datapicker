## Progress Update for TASK-021

**Status:** Done.

**Completion:** Implemented the keyboard engine in `src/components/date-picker/model/useDatePickerKeyboard.ts`. The resolver now maps Arrow keys, Home/End, PageUp/PageDown, Shift+PageUp/Down, Enter, Space, and Escape to the correct calendar actions, with keyboard constants centralized in `src/components/date-picker/constants/keyboard.ts`.

**Validation:** `node scripts/run-date-picker-tests.mjs all` and `node scripts/validate-date-picker-structure.mjs` passed. `uv run ruff check .` and `uv run pytest` could not run because `uv` is not installed in this workspace.

## Progress Update for TASK-011

**Status:** Done.

**Completion:** Implemented the validation layer in `src/components/date-picker/model/validation.ts`. The helper now resolves one error at a time in the order format -> range -> external -> required, and the internal validation state now carries `isInvalid` alongside `isVisible`.

**Validation:** `node scripts/run-date-picker-tests.mjs all` and `node scripts/validate-date-picker-structure.mjs` passed. `uv run ruff check .` and `uv run pytest` could not run because `uv` is not installed in this workspace.

## Progress Update for TASK-006

**Status:** Done.

**Completion:** Implemented the pure date movement layer in `lib/date`. `addDays`, `addMonths`, and `addYears` now use date-only math with month and leap-year clamping. Added a small `navigation.ts` helper module for Home, End, PageUp, PageDown, and Shift+PageUp/Down targets.

**Validation:** `node scripts/run-date-picker-tests.mjs all` and `node scripts/validate-date-picker-structure.mjs` passed. `uv run ruff check .` and `uv run pytest` could not run because `uv` is not installed in this workspace.

## Progress Update for TASK-002

**Status:** Done.

**Completion:** Public and internal DatePicker types are split by responsibility. `DatePickerProps` now uses reusable aliases, and internal state has explicit input, calendar, keyboard, focus, live region, and validation models.

**Validation:** Type stubs in `DatePicker.tsx` and the model hooks import the shared types directly. Task status updated after the type-layer work.

## Progress Update for TASK-003

**Status:** Done.

**Completion:** Added a self-contained DatePicker test runner in `scripts/run-date-picker-tests.mjs` and replaced the placeholder `tests/*.tsx` files with executable scaffold checks for unit, integration, and accessibility layers. The package scripts now expose `test:unit`, `test:integration`, `test:a11y`, and `test`.

**Validation:** The new runner checks the scaffold, source-level contracts, and the accessibility helper layer without external test dependencies.

## Progress Update for TASK-004

**Status:** Done.

**Completion:** Implemented the date-only core helpers in `lib/date`: `normalizeDate`, `compareByDay`, `compareDates`, `isSameDay`, `isSameMonth`, and `getToday`. The helpers now use calendar-day semantics instead of raw timestamp equality.

**Validation:** Updated the date utility scaffold test to lock in the date-only contracts and the module wiring for the new helpers. The requested `uv`, `ruff`, and `pytest` commands are not available in this workspace, so the local Node date-picker unit harness was used and passed.

## Progress Update for TASK-005

**Status:** Done.

**Completion:** Implemented the month-grid helpers in `lib/date` and `lib/i18n`: `startOfWeek` now normalizes a day to the requested week start, `getFirstDayOfWeek` resolves the locale week start through `Intl.Locale.weekInfo` with a fallback map, and `buildMonthMatrix` produces a predictable 6x7 calendar grid.

**Validation:** Extended the date utility scaffold checks for the new helpers and verified the local Node harness with `node scripts/run-date-picker-tests.mjs all` plus `node scripts/validate-date-picker-structure.mjs`. `uv run ruff check .` and `uv run pytest` are not runnable here because `uv` is not installed in this workspace.

## Progress Update for TASK-007

**Status:** Done.

**Completion:** Implemented the range and disabled helpers in `lib/date`. `isDateInRange` now normalizes date-only values, checks inclusive min/max bounds, and rejects reversed boundaries. `isDateDisabled` now reuses the range helper, then checks `disabledDates` by normalized day for both arrays and predicates.

**Validation:** `node scripts/run-date-picker-tests.mjs all` and `node scripts/validate-date-picker-structure.mjs` passed. `uv run ruff check .` and `uv run pytest` could not run because `uv` is not installed in this workspace.

## Progress Update for TASK-009

**Status:** Done.

**Completion:** Implemented the i18n helper layer in `lib/i18n`. `formatMonthLabel`, `getMonthYearLabel`, `formatWeekdayLabel`, `formatFullDateLabel`, `getWeekdayNames`, and `getFirstDayOfWeek` now use `Intl` with date-only normalization and locale-aware fallback logic.

**Validation:** Extended `src/components/date-picker/tests/date-utils.test.ts` with executable locale checks for `en-US` and `de-DE`. `node scripts/run-date-picker-tests.mjs all` and `node scripts/validate-date-picker-structure.mjs` passed. `uv run ruff check .` and `uv run pytest` could not run because `uv` is not installed in this workspace.

## Progress Update for TASK-008

**Status:** Done.

**Completion:** Implemented the input helper layer in `lib/input`. `sanitizeInputValue` now normalizes pasted separators without wiping invalid draft text, `parseInputDate` now separates empty, partial, valid, format, and calendar states, and `formatInputDate` now returns canonical `DD.MM.YYYY` text with zero padding.

**Validation:** `node scripts/run-date-picker-tests.mjs all` and `node scripts/validate-date-picker-structure.mjs` passed. `uv run ruff check .`, `uv run pytest`, and `tsc --noEmit` could not run here because those tools are not installed in this workspace.
