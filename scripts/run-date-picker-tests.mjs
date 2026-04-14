#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const rootDir = process.cwd();
const mode = process.argv[2] ?? 'all';

const testFilesByMode = {
  all: [
    'src/components/date-picker/tests/DatePicker.test.tsx',
    'src/components/date-picker/tests/date-utils.test.ts',
    'src/components/date-picker/tests/input-validation.test.tsx',
    'src/components/date-picker/tests/keyboard-navigation.test.tsx',
    'src/components/date-picker/tests/focus-management.test.tsx',
    'src/components/date-picker/tests/accessibility.test.tsx'
  ],
  unit: [
    'src/components/date-picker/tests/DatePicker.test.tsx',
    'src/components/date-picker/tests/date-utils.test.ts',
    'src/components/date-picker/tests/input-validation.test.tsx'
  ],
  integration: [
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
  expect,
  describe,
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
    toBe(expected) {
      assert.strictEqual(actual, expected);
    },
    toEqual(expected) {
      assert.deepStrictEqual(actual, expected);
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
      }
    }
  };
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
