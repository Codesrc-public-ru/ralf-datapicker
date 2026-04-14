#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import * as ts from 'typescript';

import { createDatePickerTestHarness } from './date-picker-test-harness.mjs';

const rootDir = process.cwd();
const mode = process.argv[2] ?? 'all';

const testFilesByMode = {
  all: [
    'src/components/date-picker/tests/DatePicker.test.tsx',
    'src/components/date-picker/tests/dom-stack.test.tsx',
    'src/components/date-picker/tests/controlled-sync.test.tsx',
    'src/components/date-picker/tests/helper-units.test.ts',
    'src/components/date-picker/tests/date-utils.test.ts',
    'src/components/date-picker/tests/input-validation.test.tsx',
    'src/components/date-picker/tests/keyboard-navigation.test.tsx',
    'src/components/date-picker/tests/focus-management.test.tsx',
    'src/components/date-picker/tests/accessibility.test.tsx'
  ],
  unit: [
    'src/components/date-picker/tests/DatePicker.test.tsx',
    'src/components/date-picker/tests/helper-units.test.ts',
    'src/components/date-picker/tests/date-utils.test.ts',
    'src/components/date-picker/tests/input-validation.test.tsx'
  ],
  integration: [
    'src/components/date-picker/tests/dom-stack.test.tsx',
    'src/components/date-picker/tests/controlled-sync.test.tsx',
    'src/components/date-picker/tests/keyboard-navigation.test.tsx',
    'src/components/date-picker/tests/focus-management.test.tsx'
  ],
  a11y: ['src/components/date-picker/tests/accessibility.test.tsx']
};

const testFiles = testFilesByMode[mode];

if (!testFiles) {
  console.error(`Unknown test mode: ${mode}`);
  process.exit(1);
}

const suites = [];
const testCases = [];
let skipped = 0;

const harness = createDatePickerTestHarness(rootDir);

const dp = {
  rootDir,
  read(relativePath) {
    return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
  },
  exists(relativePath) {
    return fs.existsSync(path.join(rootDir, relativePath));
  },
  relative(absolutePath) {
    return path.relative(rootDir, absolutePath).replaceAll(path.sep, '/');
  },
  list(relativePath) {
    return fs
      .readdirSync(path.join(rootDir, relativePath))
      .map((entry) => entry.replaceAll(path.sep, '/'));
  }
};

const context = vm.createContext({
  console,
  dp,
  React: harness.React,
  act: harness.act,
  cleanup: harness.cleanup,
  document: harness.document,
  expect,
  requireSource: harness.requireSource,
  render: harness.render,
  screen: harness.screen,
  user: harness.user,
  window: harness.window,
  describe,
  ts,
  test,
  globalThis: null
});
context.globalThis = context;

for (const relativePath of testFiles) {
  const absolutePath = path.join(rootDir, relativePath);
  const source = fs.readFileSync(absolutePath, 'utf8');
  try {
    vm.runInContext(source, context, { filename: absolutePath });
  } catch (error) {
    console.error(`Failed to load ${relativePath}`);
    throw error;
  }
}

let failures = 0;
let passed = 0;

for (const testCase of testCases) {
  const label = [...testCase.suites, testCase.name].join(' > ');
  try {
    const result = testCase.fn();
    if (result && typeof result.then === 'function') {
      await result;
    }
    console.log(`ok ${label}`);
    passed += 1;
  } catch (error) {
    failures += 1;
    console.error(`fail ${label}`);
    console.error(error instanceof Error ? error.stack : error);
  }
}

console.log(`done ${passed} passed, ${skipped} skipped, ${failures} failed`);

await harness.teardown();

if (failures > 0) {
  process.exit(1);
}

function describe(name, fn) {
  suites.push(name);
  try {
    fn();
  } finally {
    suites.pop();
  }
}

function test(name, fn) {
  testCases.push({
    name,
    fn,
    suites: [...suites]
  });
}

test.skip = function skipTest() {
  skipped += 1;
};

describe.skip = function skipDescribe() {};

function expect(actual) {
  return {
    toBeDisabled() {
      assert.ok(
        isDomElement(actual) && (actual.disabled || actual.getAttribute('disabled') !== null),
        'Expected element to be disabled'
      );
    },
    toBeInTheDocument() {
      assert.ok(isInDocument(actual), 'Expected node to be in document');
    },
    toBeVisible() {
      assert.ok(isDomElement(actual) && isVisibleElement(actual), 'Expected element to be visible');
    },
    toBe(expected) {
      assert.strictEqual(actual, expected);
    },
    toEqual(expected) {
      assert.deepStrictEqual(actual, expected);
    },
    toHaveAttribute(name, value) {
      assert.ok(isDomElement(actual), 'toHaveAttribute expects a DOM element');
      const attributeValue = actual.getAttribute(name);

      if (value === undefined) {
        assert.ok(attributeValue !== null, `Expected ${name} attribute to exist`);
        return;
      }

      assert.strictEqual(attributeValue, String(value));
    },
    toHaveFocus() {
      assert.ok(
        isDomElement(actual) && actual.ownerDocument?.activeElement === actual,
        'Expected element to have focus'
      );
    },
    toHaveTextContent(expected) {
      assert.ok(isDomElement(actual) || isTextNode(actual), 'toHaveTextContent expects a DOM node');
      const text = actual.textContent ?? '';

      if (expected instanceof RegExp) {
        assert.ok(expected.test(text), `Expected ${formatValue(text)} to match ${expected}`);
        return;
      }

      assert.strictEqual(text, String(expected));
    },
    toHaveValue(expected) {
      assert.ok(isDomElement(actual), 'toHaveValue expects a DOM element');
      assert.strictEqual(actual.value, expected);
    },
    toContain(expected) {
      assert.ok(
        typeof actual === 'string' || Array.isArray(actual),
        'toContain expects a string or an array'
      );
      assert.ok(
        actual.includes(expected),
        `Expected ${formatValue(actual)} to contain ${formatValue(expected)}`
      );
    },
    toMatch(expected) {
      assert.ok(typeof actual === 'string', 'toMatch expects a string');
      const regex = expected instanceof RegExp ? expected : new RegExp(String(expected));
      assert.ok(regex.test(actual), `Expected ${formatValue(actual)} to match ${regex}`);
    },
    toHaveLength(expected) {
      assert.strictEqual(actual.length, expected);
    },
    toBeTruthy() {
      assert.ok(actual);
    },
    toBeFalsy() {
      assert.ok(!actual);
    },
    not: {
      toBeDisabled() {
        assert.ok(
          !(isDomElement(actual) && (actual.disabled || actual.getAttribute('disabled') !== null)),
          'Expected element not to be disabled'
        );
      },
      toBeInTheDocument() {
        assert.ok(!isInDocument(actual), 'Expected node not to be in document');
      },
      toBeVisible() {
        assert.ok(!(isDomElement(actual) && isVisibleElement(actual)), 'Expected element not to be visible');
      },
      toContain(expected) {
        assert.ok(
          typeof actual === 'string' || Array.isArray(actual),
          'toContain expects a string or an array'
        );
        assert.ok(
          !actual.includes(expected),
          `Expected ${formatValue(actual)} not to contain ${formatValue(expected)}`
        );
      },
      toMatch(expected) {
        assert.ok(typeof actual === 'string', 'toMatch expects a string');
        const regex = expected instanceof RegExp ? expected : new RegExp(String(expected));
        assert.ok(!regex.test(actual), `Expected ${formatValue(actual)} not to match ${regex}`);
      },
      toBe(expected) {
        assert.notStrictEqual(actual, expected);
      },
      toHaveAttribute(name, value) {
        assert.ok(isDomElement(actual), 'toHaveAttribute expects a DOM element');
        const attributeValue = actual.getAttribute(name);

        if (value === undefined) {
          assert.ok(attributeValue === null, `Expected ${name} attribute to be absent`);
          return;
        }

        assert.notStrictEqual(attributeValue, String(value));
      },
      toHaveFocus() {
        assert.ok(
          !(isDomElement(actual) && actual.ownerDocument?.activeElement === actual),
          'Expected element not to have focus'
        );
      },
      toHaveTextContent(expected) {
        assert.ok(isDomElement(actual) || isTextNode(actual), 'toHaveTextContent expects a DOM node');
        const text = actual.textContent ?? '';

        if (expected instanceof RegExp) {
          assert.ok(!expected.test(text), `Expected ${formatValue(text)} not to match ${expected}`);
          return;
        }

        assert.notStrictEqual(text, String(expected));
      },
      toHaveValue(expected) {
        assert.ok(isDomElement(actual), 'toHaveValue expects a DOM element');
        assert.notStrictEqual(actual.value, expected);
      }
    }
  };
}

function isDomElement(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.getAttribute === 'function' &&
      typeof value.setAttribute === 'function' &&
      typeof value.tagName === 'string'
  );
}

function isTextNode(value) {
  return Boolean(value && typeof value === 'object' && value.nodeType === 3);
}

function isInDocument(value) {
  return Boolean(value && value.ownerDocument && value.ownerDocument.body.contains(value));
}

function isVisibleElement(element) {
  if (!isDomElement(element)) {
    return false;
  }

  if (element.hidden || element.getAttribute('hidden') !== null) {
    return false;
  }

  let current = element;

  while (current) {
    if (isDomElement(current) && (current.hidden || current.getAttribute('hidden') !== null)) {
      return false;
    }

    current = current.parentNode;
  }

  return true;
}

function formatValue(value) {
  if (typeof value === 'string' && value.length > 80) {
    return `${value.slice(0, 77)}...`;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
