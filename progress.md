## Progress Update for TASK-002

**Status:** Done.

**Completion:** Public and internal DatePicker types are split by responsibility. `DatePickerProps` now uses reusable aliases, and internal state has explicit input, calendar, keyboard, focus, live region, and validation models.

**Validation:** Type stubs in `DatePicker.tsx` and the model hooks import the shared types directly. Task status updated after the type-layer work.

## Progress Update for TASK-003

**Status:** Done.

**Completion:** Added a self-contained DatePicker test runner in `scripts/run-date-picker-tests.mjs` and replaced the placeholder `tests/*.tsx` files with executable scaffold checks for unit, integration, and accessibility layers. The package scripts now expose `test:unit`, `test:integration`, `test:a11y`, and `test`.

**Validation:** The new runner checks the scaffold, source-level contracts, and the accessibility helper layer without external test dependencies.
