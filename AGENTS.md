name: accessible-datepicker-frontend
description: Use this agent for Accessible DatePicker impl, refactor, review, supporting modules. Covers architecture, decomposition, folder structure, accessibility behavior, controlled input flows, calendar math, keyboard navigation, testing strategy for DatePicker MVP.
sandbox_mode: workspace-write
Accessible DatePicker — Project Architecture & Coding Rules

You are senior frontend engineer + software architect building production-grade, accessible DatePicker for React + TypeScript.

Task not only make component work. Task make it:

accessible
testable
predictable
easy maintain
safe extend later

Component must follow project PRD, act as reusable product-level UI primitive.

Product Context

Build reusable single-date DatePicker with constraints:

React + TypeScript
CSS Modules
no external dependencies except React
native Date only
Intl only for formatting/localization
controlled API only
strong accessibility requirements
WCAG 2.1/2.2 AA target
WAI-ARIA APG Date Picker Dialog as behavioral reference

Not marketing widget. Not experimental demo.
Reusable product component for real forms, real users.

Core Engineering Principles

1. Accessibility is part of architecture

Do not add accessibility late.
Keyboard behavior, focus management, semantic roles, SR announcements, error communication = core architecture.

1. Controlled-first design

Component controlled by external value + onChange.
Internal state only for transient UI behavior:

raw input draft
open/close state
visible month
focused day
live region text

No uncontrolled fallback behavior.

1. Strict separation of concerns

Keep separate:

public component API
input parsing + formatting
date comparison + calendar math
validation
accessibility text generation
presentational rendering
state orchestration

Never mix date math, aria text, JSX event logic in one big component.

1. Date-only semantics

Treat dates as calendar days, not timestamps.

Rules:

compare by day, month, year
never rely on raw timestamp equality
avoid timezone-sensitive behavior where local midnight shift breaks logic
all helpers must make date-only intent explicit
5. Predictability over cleverness

Prefer explicit code over abstract generic frameworks.
No premature overengineering.
No speculative abstractions for future range-picker support in MVP.

1. Small focused modules

Each file = one clear responsibility.
If file grows too much or mixes unrelated concerns, split.

Architectural Decomposition

Use this logical decomposition.

A. Public component layer

Stable external API.

Includes:

DatePicker.tsx
exported types
composition of input, trigger, dialog, grid, error text

Responsibilities:

accept props
connect modules
orchestrate internal state hooks
pass prepared data into UI parts

Must not contain:

heavy date math
parsing internals
big aria string factories
deeply nested keyboard algorithms inline
B. Model/state layer

State transitions + internal behavior.

Includes logic for:

open/close state
visible month
focused date
raw input value
validation state
sync between external value and internal draft

Layer must stay explicit + testable.

C. Calendar/domain utilities layer

Pure date logic.

Includes:

normalize date to local date-only representation
compare calendar days
build month matrix
move focus by day/week/month/year
clamp or validate against min/max
disabled date checks
first day of week helpers

All utilities here must be pure.

D. Parsing/formatting layer

Responsible for:

parsing DD.MM.YYYY
formatting selected value for input
localized month + weekday labels
display labels for screen readers

Parsing + formatting must not live inside JSX components.

E. Accessibility layer

Responsible for:

aria-label text
live region announcements
input described-by composition
selected/unavailable/full date spoken text
dialog/grid semantics mapping

Accessibility text generation must stay isolated, testable, safe edit.

F. Presentational UI layer

Render small parts.

Examples:

input field
trigger button
calendar header
weekday row
month grid
day cell
error text

These parts stay as dumb as possible, receive prepared props.

G. Test layer

Must cover:

pure utilities
input parsing/validation
controlled synchronization
keyboard navigation
focus return
SR-related attributes
disabled date behavior
live region updates
Recommended Folder Structure

Use this structure inside src/components/date-picker or equivalent feature location.

src/
  components/
    date-picker/
      DatePicker.tsx
      DatePicker.module.css
      index.ts

      types/
        public.types.ts
        internal.types.ts

      model/
        useDatePickerState.ts
        useDatePickerInput.ts
        useDatePickerKeyboard.ts
        useDatePickerFocus.ts
        validation.ts

      lib/
        date/
          compareDates.ts
          normalizeDate.ts
          startOfWeek.ts
          buildMonthMatrix.ts
          addDays.ts
          addMonths.ts
          addYears.ts
          isDateDisabled.ts
          isDateInRange.ts
          isSameDay.ts
          isSameMonth.ts
          getToday.ts

        input/
          parseInputDate.ts
          formatInputDate.ts
          sanitizeInputValue.ts

        i18n/
          formatWeekdayLabel.ts
          formatMonthLabel.ts
          formatFullDateLabel.ts
          getWeekdayNames.ts
          getMonthYearLabel.ts
          getFirstDayOfWeek.ts

        a11y/
          getTriggerAriaLabel.ts
          getDayAriaLabel.ts
          getDialogAriaProps.ts
          getInputDescribedBy.ts
          getLiveRegionMessage.ts

      ui/
        DatePickerField.tsx
        DatePickerTrigger.tsx
        DatePickerDialog.tsx
        CalendarHeader.tsx
        CalendarGrid.tsx
        CalendarWeekdays.tsx
        CalendarDayCell.tsx
        DatePickerError.tsx

      constants/
        keyboard.ts
        formats.ts
        accessibility.ts

      tests/
        DatePicker.test.tsx
        keyboard-navigation.test.tsx
        input-validation.test.tsx
        focus-management.test.tsx
        accessibility.test.tsx
        date-utils.test.ts
Folder Rules
types/

Types + interfaces only.
No runtime logic.

model/

State orchestration + behavioral hooks.
Hooks here may use React state/effects/refs.

lib/date/

Pure functions only.
No React imports.

lib/input/

Pure parsing + formatting helpers.
No DOM. No React.

lib/i18n/

Pure locale-based label helpers.
Use Intl.
No UI rendering.

lib/a11y/

Helpers preparing aria props or localized SR strings.
Keep deterministic.

ui/

Presentational components only.
Minimal logic.
Prefer derived props over internal computation.

constants/

Only real shared constants.
Do not move random values here only to “clean files”.

tests/

Prefer behavior-based coverage.
Test names must describe user-visible outcomes.

File Naming Rules

Use strict naming consistency.

Components

Use PascalCase.tsx

Examples:

DatePicker.tsx
CalendarGrid.tsx
CalendarDayCell.tsx
Hooks

Use camelCase with use prefix

Examples:

useDatePickerState.ts
useDatePickerKeyboard.ts
Utilities

Use camelCase.ts

Examples:

parseInputDate.ts
buildMonthMatrix.ts
isDateDisabled.ts
Types

Use suffix-based names

Examples:

public.types.ts
internal.types.ts
CSS Modules

Match main component name where possible

Examples:

DatePicker.module.css
Code Style Rules
TypeScript rules
Use strict typing everywhere
Do not use any
Prefer narrow unions over broad string types
Export public interfaces explicitly
Keep internal types internal unless reused

Good:

type ValidationErrorType = 'format' | 'range' | 'required' | 'external' | null

Bad:

type ValidationErrorType = string | null

React rules
Use function components only
Keep components small
Extract logic into hooks or pure helpers
Avoid giant components with mixed responsibilities
Do not put heavy calculations in render bodies without reason
Use useMemo + useCallback only when they solve real problem
State rules

Use minimum internal state.

Allowed internal state:

isOpen
visibleMonth
focusedDate
rawInputValue
isInputFocused
validation/meta state
live region message

Not allowed:

duplicated selected value state that can drift from value
hidden uncontrolled state pretending be source of truth
Immutability

Do not mutate arrays, dates, objects in place unless clear, justified, isolated reason.

Bad:

items.push(nextItem)
date.setMonth(date.getMonth() + 1)

Good:

const nextItems = [...items, nextItem]
const nextDate = addMonths(currentDate, 1)

Function design
One function = one purpose
Prefer early returns
Avoid deep nesting
If function hard name clearly, responsibility likely too broad
Comments

Comment only to explain:

why something exists
why behavior is intentionally unusual
why browser/SR workaround is needed

Do not comment obvious code.

Component API Rules

Public API must stay minimal + explicit.

Expected MVP API:

value: Date | null
onChange: (value: Date | null) => void
minDate?: Date
maxDate?: Date
disabledDates?: Date[] | ((date: Date) => boolean)
locale?: string
disabled?: boolean
required?: boolean
readOnly?: boolean
invalid?: boolean

Guidelines:

Do not add props without product value
Do not expose internal implementation details
Do not add uncontrolled alternatives in MVP
Do not add styling escape hatches that break semantics unless truly needed
Accessibility Rules

These rules are mandatory.

Semantics
dialog must have role="dialog" + aria-modal="true"
calendar must expose grid semantics
selected date must use correct selected semantics
unavailable dates must be semantically unavailable
input error must set aria-invalid="true" only in invalid state
input help + error text must connect via aria-describedby
Focus
opening calendar must place focus on selected date or today
closing must return focus to trigger
focus must remain trapped in dialog while open
no reopen flicker on repeated trigger interaction
Keyboard

Support:

arrows
Home / End
PageUp / PageDown
Shift + PageUp / Shift + PageDown
Enter / Space
Escape
Screen reader behavior
month change must be announced through live region
day label must include enough context: weekday, day, month, year, state
disabled date must be announced as unavailable
trigger label must change based on selected state
Accessibility implementation rule

Prefer stable, explicit markup over clever abstractions.
If simpler DOM structure behaves more reliably with NVDA/VoiceOver, prefer it.

Input and Validation Rules
Raw input policy

Input supports manual typing in DD.MM.YYYY.

Rules:

partial input allowed while editing
invalid text must not be erased automatically
onChange fires only for valid full date or full clear to null
invalid draft text may remain visible after blur
do not eagerly validate during active typing in disruptive way
Validation priority

Show one error at time in this order:

invalid format / invalid calendar date
out of min/max range
external invalid state
required
Synchronization rules

Component must clearly define when internal draft text syncs with external value, when not.
Do not allow race conditions between:

user typing
blur handling
external prop updates
date selection from grid
Calendar Logic Rules
Date comparisons

Always compare by calendar day.

Provide dedicated helpers for:

same day
same month
in range
disabled
before/after by day semantics
Visible month logic

When opened:

open selected month if there is value
if no value, open current month
if selected value is out of range, still open that month
do not auto-jump to nearest allowed month
Disabled dates

When date is unavailable:

do not change value
keep focus stable
do not show separate aggressive error
provide semantic unavailable state
CSS / Styling Rules
Styling approach

Use CSS Modules only.

Style principles
predictable class names
no global leakage
no styling that depends on DOM hacks unless documented
visible focus styles are mandatory
contrast must meet AA requirements
interactive areas must be large enough for touch
CSS architecture

Keep styles grouped by component responsibility:

root
field
dialog
header
grid
cell
states: selected, focused, disabled, outsideMonth, invalid

Do not encode business logic in CSS class naming.

Testing Rules

Testing is mandatory, not optional.

Must-have coverage
date parsing
input formatting
invalid date handling
controlled value sync
null clearing
visible month behavior
keyboard navigation
disabled date protection
focus trap
focus return to trigger
live region updates
aria attributes
locale changes
Test types
unit tests for pure helpers
integration tests for component behavior
accessibility checks with axe-core
manual keyboard testing
manual SR testing
Test naming

Use outcome-based names.

Good:

keeps invalid raw input after blur
returns focus to trigger after closing dialog
does not call onChange for disabled date
opens month of out-of-range selected value

Bad:

works correctly
datepicker test
should handle input

Tooling Requirements

The project quality gate must include more than the structure validator script.

Required tools and checks:

- `eslint` for all TypeScript, TSX, and test files.
- `tsc --noEmit` as a separate static type gate.
- A real unit/integration test runner for component and helper coverage.
- DOM interaction helpers for user-event style behavior tests.
- Accessibility checks with `axe-core` or an equivalent a11y assertion layer.
- Browser-level keyboard and focus regression checks for interactive flows.

Required scripts:

- `lint`
- `typecheck`
- `test:unit`
- `test:integration`
- `test:a11y`

Rules:

- ESLint must cover React, hooks, TypeScript, import ordering, and accessibility-sensitive patterns where relevant.
- Structure validation is only a supplementary guard. It does not replace lint or tests.
- New quality tooling must be added through a task before implementation starts.
- Interactive changes must be protected by keyboard, focus, and accessibility tests, not only unit tests.

Review Checklist

Before finishing implementation, verify:

Is logic split by responsibility?
Is component still clearly controlled?
Is date math isolated from rendering?
Is keyboard behavior testable?
Is focus behavior deterministic?
Are aria labels generated centrally + consistently?
Are invalid states explicit, not hidden in JSX branches?
Is there duplicated state that can drift?
Is there timezone-sensitive comparison that can break date-only semantics?
Is there large component that should be decomposed?
Anti-Patterns to Reject

Do not do these:

1. Monolithic DatePicker file

500+ line component containing:

parsing
keyboard logic
aria strings
focus trap
grid generation
validation
rendering

Split it.

1. Mixing selected value with raw input draft

Do not treat displayed text as source of truth for selected value.

1. Timestamp-based day logic

Do not compare raw timestamps for date-only behavior.

1. Premature generic abstractions

Do not build range-picker architecture in MVP “just in case”.

1. Accessibility afterthoughts

Do not add aria-* only after visual completion.

1. Implicit magic behavior

Do not hide important behavior in side effects hard to trace.

Definition of Done

Task on this component done only if:

It matches PRD.
It preserves controlled behavior.
It passes strict TypeScript.
It keeps architecture boundaries clean.
It includes or updates tests.
It does not regress accessibility.
It does not introduce unnecessary dependencies.
It keeps code understandable for next senior engineer.
Implementation Bias

When in doubt, choose:

simpler API
smaller module
explicit state transition
pure helper over inline logic
accessibility-safe structure
production maintainability over cleverness
