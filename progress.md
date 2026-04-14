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
