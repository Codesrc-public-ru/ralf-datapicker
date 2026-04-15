# Accessible DatePicker

SPA на `React + TypeScript + Vite` с доступным single-date `DatePicker`.

## Что внутри

- controlled API only
- ручной ввод дат в формате `DD.MM.YYYY`
- клавиатурная навигация по календарю
- `aria`-разметка для dialog, grid и day cells
- `Intl` для локализации
- `Date`-only семантика без timestamp-логики

## Как запустить

Установи зависимости:

```bash
npm install
```

Запусти dev-сервер:

```bash
npm run dev
```

Собери production build:

```bash
npm run build
```

Посмотри собранное приложение локально:

```bash
npm run preview
```

## Как разрабатывать

Главная точка входа:

- [index.html](/home/user/my/work/code_src/projects/my/ralf-datapicker/index.html)
- [src/main.tsx](/home/user/my/work/code_src/projects/my/ralf-datapicker/src/main.tsx)

Демо-приложение:

- [src/App.tsx](/home/user/my/work/code_src/projects/my/ralf-datapicker/src/App.tsx)

Компонент DatePicker:

- [src/components/date-picker/DatePicker.tsx](/home/user/my/work/code_src/projects/my/ralf-datapicker/src/components/date-picker/DatePicker.tsx)

Если меняешь логику, прогоняй проверки:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run test:a11y
```

Полный прогон:

```bash
npm run test
```

## Как использовать

```tsx
import { useState } from 'react';
import { DatePicker } from './components/date-picker';

export function MyFormField() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <DatePicker
      value={value}
      onChange={setValue}
      locale="en-US"
    />
  );
}
```

## Props

`DatePicker` принимает только controlled props:

- `value: Date | null`
- `onChange: (value: Date | null) => void`
- `minDate?: Date`
- `maxDate?: Date`
- `disabledDates?: Date[] | ((date: Date) => boolean)`
- `locale?: string`
- `disabled?: boolean`
- `required?: boolean`
- `readOnly?: boolean`
- `invalid?: boolean`

### `value`

Текущее выбранное значение. Если даты нет, передавай `null`.

### `onChange`

Вызывается, когда пользователь выбирает валидную дату или очищает значение.

### `minDate` / `maxDate`

Ограничивают доступный диапазон дат.

### `disabledDates`

Список отключенных дат или predicate:

```tsx
<DatePicker
  value={value}
  onChange={setValue}
  disabledDates={[
    new Date(2026, 4, 1),
    new Date(2026, 4, 9)
  ]}
/>
```

Или функция:

```tsx
<DatePicker
  value={value}
  onChange={setValue}
  disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
/>
```

### `locale`

Locale для форматирования и label-строк. Пример: `en-US`, `de-DE`.

### `disabled`

Отключает весь контрол.

### `required`

Помечает поле как обязательное.

### `readOnly`

Запрещает ручное редактирование, но не ломает controlled value.

### `invalid`

Внешний флаг невалидности. Полезен для интеграции с формой.

## Поведение ввода

- формат ручного ввода: `DD.MM.YYYY`
- partial input разрешен во время набора
- невалидный draft не стирается автоматически
- `onChange` не вызывается для мусорного текста
- при выборе из календаря input синхронизируется с `value`

## Проверки

Проект уже содержит:

- `eslint`
- `tsc --noEmit`
- unit tests
- integration tests
- browser/a11y smoke checks against built SPA

## Структура

Основные файлы:

- `src/components/date-picker/model` - state и поведение
- `src/components/date-picker/lib` - pure date/input/i18n/a11y helpers
- `src/components/date-picker/ui` - dumb UI parts
- `src/components/date-picker/tests` - unit и integration coverage

## Замечание

Проект SPA. Открывай через Vite entry, не как библиотеку без app shell.
