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
