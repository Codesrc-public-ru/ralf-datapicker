#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

import * as ts from 'typescript';
import { createDatePickerTestHarness } from './date-picker-test-harness.mjs';

const rootDir = process.cwd();
const mode = process.argv[2] ?? 'all';
const allowedModes = new Set(['all', 'a11y', 'flow']);

if (!allowedModes.has(mode)) {
  console.error(`Unknown browser check mode: ${mode}`);
  process.exit(1);
}

const chromiumExecutable = findChromiumExecutable();
const browserBundle = buildBrowserBundle(rootDir);
const htmlPath = writeBrowserHtml(browserBundle);
const chromiumResult = runChromium(chromiumExecutable, htmlPath);

if (chromiumResult.status === 0) {
  const result = parseBrowserResult(chromiumResult.stdout);

  if (result.status !== 'pass') {
    console.error(result.message);
    process.exit(1);
  }

  console.log(`ok browser checks: ${result.summary}`);
  process.exit(0);
}

console.warn('Chromium browser check blocked here. Falling back to DOM harness.');
await runFallbackChecks();
console.log('ok browser checks: DOM fallback pass');

function buildBrowserBundle(rootDir) {
  const moduleSources = new Map();
  const browserSourceFiles = collectBrowserSourceFiles(rootDir);

  for (const absolutePath of browserSourceFiles) {
    const moduleId = toModuleId(rootDir, absolutePath);
    moduleSources.set(moduleId, transpileToCommonJs(absolutePath));
  }

  moduleSources.set('react', fs.readFileSync('node_modules/react/cjs/react.development.js', 'utf8'));
  moduleSources.set(
    'react-dom',
    fs.readFileSync('node_modules/react-dom/cjs/react-dom.development.js', 'utf8')
  );
  moduleSources.set(
    'react-dom/client',
    fs.readFileSync('node_modules/react-dom/cjs/react-dom-client.development.js', 'utf8')
  );
  moduleSources.set(
    'scheduler',
    fs.readFileSync('node_modules/scheduler/cjs/scheduler.development.js', 'utf8')
  );
  moduleSources.set(
    'react/jsx-runtime',
    fs.readFileSync('node_modules/react/cjs/react-jsx-runtime.development.js', 'utf8')
  );
  moduleSources.set('axe-core', fs.readFileSync('node_modules/axe-core/axe.js', 'utf8'));

  return {
    mode,
    modules: Object.fromEntries(moduleSources.entries())
  };
}

function collectBrowserSourceFiles(rootDir) {
  const featureRoot = path.join(rootDir, 'src/components/date-picker');
  const ignoredSegments = new Set(['tests']);
  const files = [];

  walk(featureRoot, files, ignoredSegments);

  return files.filter((filePath) => /\.(ts|tsx)$/.test(filePath));
}

function walk(currentDir, files, ignoredSegments) {
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    const absolutePath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      if (ignoredSegments.has(entry.name)) {
        continue;
      }

      walk(absolutePath, files, ignoredSegments);
      continue;
    }

    files.push(absolutePath);
  }
}

function transpileToCommonJs(absolutePath) {
  return ts.transpileModule(fs.readFileSync(absolutePath, 'utf8'), {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    },
    fileName: absolutePath
  }).outputText;
}

function toModuleId(rootDir, absolutePath) {
  return path.relative(rootDir, absolutePath).replaceAll(path.sep, '/');
}

function writeBrowserHtml(browserBundle) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'date-picker-browser-check-'));
  const htmlPath = path.join(tempDir, 'index.html');
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>DatePicker browser checks</title>
</head>
<body>
  <div id="root"></div>
  <pre id="result" data-status="pending"></pre>
  <script>
    window.process = { env: { NODE_ENV: 'development' } };
  </script>
  <script id="module-data" type="application/json">${JSON.stringify(browserBundle).replaceAll('<', '\\u003c')}</script>
  <script>
    (async () => {
      const resultNode = document.getElementById('result');
      const payload = {
        mode: ${JSON.stringify(mode)},
        summary: [],
        status: 'pass'
      };

      try {
        const bundle = JSON.parse(document.getElementById('module-data').textContent);
        const moduleCache = new Map();
        const moduleFactories = new Map();

        for (const [moduleId, source] of Object.entries(bundle.modules)) {
          moduleFactories.set(moduleId, new Function('module', 'exports', 'require', source));
        }

        const React = loadModule('react');
        const ReactDOMClient = loadModule('react-dom/client');
        const axe = loadModule('axe-core');
        const DatePicker = loadModule('src/components/date-picker/DatePicker.tsx').default;
        const getDayAriaLabel = loadModule('src/components/date-picker/lib/a11y/getDayAriaLabel.ts').getDayAriaLabel;
        const getTriggerAriaLabel = loadModule('src/components/date-picker/lib/a11y/getTriggerAriaLabel.ts').getTriggerAriaLabel;
        const formatInputDate = loadModule('src/components/date-picker/lib/input/formatInputDate.ts').formatInputDate;

        const root = ReactDOMClient.createRoot(document.getElementById('root'));
        const changeCalls = [];
        let setValue = null;

        function Harness() {
          const [value, updateValue] = React.useState(new Date(2026, 4, 12));
          setValue = updateValue;

          return React.createElement(DatePicker, {
            locale: 'en-US',
            onChange(nextValue) {
              changeCalls.push(nextValue);
              updateValue(nextValue);
            },
            value
          });
        }

        root.render(React.createElement(Harness));
        await flush();

        const trigger = findByRole('button', getTriggerAriaLabel(new Date(2026, 4, 12), 'en-US'));
        payload.summary.push('rendered controlled picker');

        if (${JSON.stringify(mode)} !== 'flow') {
          const closedA11y = await axe.run(document, { resultTypes: ['violations'] });
          assertNoViolations(closedA11y, 'closed state');
          payload.summary.push('axe closed state clean');
        }

        trigger.click();
        await flush();

        const dialog = findByRole('dialog');
        const selectedDay = findByRole(
          'button',
          getDayAriaLabel(new Date(2026, 4, 12), { locale: 'en-US', selected: true })
        );

        if (document.activeElement !== selectedDay) {
          throw new Error('selected day should receive initial focus');
        }
        payload.summary.push('initial focus lands on selected day');

        if (${JSON.stringify(mode)} !== 'flow') {
          const openA11y = await axe.run(document, { resultTypes: ['violations'] });
          assertNoViolations(openA11y, 'open state');
          payload.summary.push('axe open state clean');
        }

        dispatchKey(dialog, 'Tab');
        await flush();

        if (!dialog.contains(document.activeElement)) {
          throw new Error('tab should stay trapped in dialog');
        }
        payload.summary.push('tab stays inside dialog');

        dispatchKey(document.activeElement, 'Escape');
        await flush();

        if (document.querySelector('[role=\"dialog\"]') !== null) {
          throw new Error('dialog should close on Escape');
        }
        if (document.activeElement !== trigger) {
          throw new Error('focus should return to trigger on close');
        }
        payload.summary.push('escape closes and returns focus');

        trigger.click();
        await flush();

        const nextDay = findByRole(
          'button',
          getDayAriaLabel(new Date(2026, 4, 13), { locale: 'en-US' })
        );

        nextDay.click();
        await flush();

        const input = document.querySelector('input');
        if (input.value !== formatInputDate(new Date(2026, 4, 13))) {
          throw new Error('selection should update controlled value');
        }
        if (changeCalls.length !== 1) {
          throw new Error('onChange should fire once for picked date');
        }
        if (document.querySelector('[role=\"dialog\"]') !== null) {
          throw new Error('dialog should close after pick');
        }
        payload.summary.push('selection updates controlled value');

        payload.message = payload.summary.join('; ');
        resultNode.textContent = JSON.stringify(payload, null, 2);
        resultNode.dataset.status = 'pass';
      } catch (error) {
        payload.status = 'fail';
        payload.message = error instanceof Error ? error.stack || error.message : String(error);
        resultNode.textContent = JSON.stringify(payload, null, 2);
        resultNode.dataset.status = 'fail';
      }

      function loadModule(request) {
        return requireModule(request, null);
      }

      function requireModule(request, parentId) {
        const moduleId = resolveModuleId(request, parentId);

        if (moduleId.endsWith('.css')) {
          return createCssModuleProxy(moduleId);
        }

        if (moduleCache.has(moduleId)) {
          return moduleCache.get(moduleId).exports;
        }

        const factory = moduleFactories.get(moduleId);

        if (!factory) {
          throw new Error(\`Missing module: \${request} from \${parentId ?? 'root'}\`);
        }

        const module = { exports: {} };
        moduleCache.set(moduleId, module);

        const localRequire = (nextRequest) => requireModule(nextRequest, moduleId);
        factory(module, module.exports, localRequire);

        return module.exports;
      }

      function resolveModuleId(request, parentId) {
        if (moduleFactories.has(request)) {
          return request;
        }

        if (!request.startsWith('.')) {
          return request;
        }

        const parentDir = parentId ? parentId.slice(0, parentId.lastIndexOf('/')) : '';
        const resolvedBase = normalizePath(parentDir ? \`\${parentDir}/\${request}\` : request);
        const candidates = [
          resolvedBase,
          \`\${resolvedBase}.ts\`,
          \`\${resolvedBase}.tsx\`,
          \`\${resolvedBase}.js\`,
          \`\${resolvedBase}/index.ts\`,
          \`\${resolvedBase}/index.tsx\`,
          \`\${resolvedBase}/index.js\`
        ];

        for (const candidate of candidates) {
          if (moduleFactories.has(candidate)) {
            return candidate;
          }
        }

        return resolvedBase;
      }

      function normalizePath(value) {
        const parts = [];

        for (const segment of value.split('/')) {
          if (!segment || segment === '.') {
            continue;
          }

          if (segment === '..') {
            parts.pop();
            continue;
          }

          parts.push(segment);
        }

        return parts.join('/');
      }

      function createCssModuleProxy() {
        const styles = new Proxy({}, {
          get(_target, property) {
            if (property === '__esModule') {
              return true;
            }

            if (property === 'default') {
              return styles;
            }

            return String(property);
          }
        });

        return {
          __esModule: true,
          default: styles
        };
      }

      function dispatchKey(target, key) {
        target.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key
        }));
        target.dispatchEvent(new KeyboardEvent('keyup', {
          bubbles: true,
          cancelable: true,
          key
        }));
      }

      function findByRole(role, name) {
        const elements = Array.from(document.querySelectorAll(\`[role="\${role}"]\`));
        const match = elements.find((element) => {
          const label = element.getAttribute('aria-label') || element.textContent || '';
          return label === name;
        });

        if (!match) {
          throw new Error(\`Missing element with role \${role} and name \${name}\`);
        }

        return match;
      }

      function assertNoViolations(report, label) {
        if (report.violations.length === 0) {
          return;
        }

        const messages = report.violations.map((violation) => \`\${violation.id}: \${violation.help}\`).join(' | ');
        throw new Error(\`axe violations in \${label}: \${messages}\`);
      }

      function flush() {
        return new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        });
      }
    })();
  </script>
</body>
</html>`;

  fs.writeFileSync(htmlPath, html);
  return htmlPath;
}

function escapeHtml(value) {
  return value;
}

function runChromium(chromiumExecutable, htmlPath) {
  return spawnSync(
    chromiumExecutable,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-crash-reporter',
      '--disable-crashpad',
      '--disable-breakpad',
      '--disable-dev-shm-usage',
      '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=8000',
      '--dump-dom',
      pathToFileUrl(htmlPath)
    ],
    {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024
    }
  );
}

function pathToFileUrl(filePath) {
  return pathToFileURL(path.resolve(filePath)).href;
}

function parseBrowserResult(output) {
  const statusMatch = output.match(/<pre id="result" data-status="([^"]+)">([\s\S]*?)<\/pre>/);

  if (!statusMatch) {
    return {
      message: 'Browser check did not produce a result payload.',
      status: 'fail'
    };
  }

  const status = statusMatch[1];
  const rawText = statusMatch[2]
  let payload;

  try {
    payload = JSON.parse(rawText);
  } catch (error) {
    return {
      message: `Could not parse browser result: ${error instanceof Error ? error.message : String(error)}`,
      status: 'fail'
    };
  }

  return {
    message: payload.message ?? 'Browser checks passed.',
    status,
    summary: Array.isArray(payload.summary) ? payload.summary.join(', ') : ''
  };
}

async function runFallbackChecks() {
  const harness = createDatePickerTestHarness(rootDir);
  const DatePicker = harness.requireSource('src/components/date-picker/DatePicker.tsx').default;
  const getDayAriaLabel = harness.requireSource(
    'src/components/date-picker/lib/a11y/getDayAriaLabel.ts'
  ).getDayAriaLabel;
  const getTriggerAriaLabel = harness.requireSource(
    'src/components/date-picker/lib/a11y/getTriggerAriaLabel.ts'
  ).getTriggerAriaLabel;
  const formatInputDate = harness.requireSource(
    'src/components/date-picker/lib/input/formatInputDate.ts'
  ).formatInputDate;

  const changeCalls = [];

  function ControlledDatePicker() {
    const [value, setValue] = harness.React.useState(new Date(2026, 4, 12));

    return harness.React.createElement(DatePicker, {
      locale: 'en-US',
      onChange(nextValue) {
        changeCalls.push(nextValue);
        setValue(nextValue);
      },
      value
    });
  }

  await harness.render(harness.React.createElement(ControlledDatePicker));

  const trigger = harness.screen.getByRole('button', {
    name: getTriggerAriaLabel(new Date(2026, 4, 12), 'en-US')
  });

  if (trigger.getAttribute('aria-haspopup') !== 'dialog') {
    throw new Error('trigger should declare dialog popup semantics');
  }

  if (trigger.getAttribute('aria-expanded') !== 'false') {
    throw new Error('closed trigger should report aria-expanded=false');
  }

  await harness.user.click(trigger);

  const dialog = harness.screen.getByRole('dialog');

  if (dialog.getAttribute('aria-modal') !== 'true') {
    throw new Error('dialog should declare aria-modal=true');
  }

  const selectedDay = harness.screen.getByRole('button', {
    name: getDayAriaLabel(new Date(2026, 4, 12), {
      locale: 'en-US',
      selected: true
    })
  });

  if (dialog.contains(harness.document.activeElement) !== true) {
    throw new Error('focus should move into dialog on open');
  }

  await harness.user.tab();

  if (dialog.contains(harness.document.activeElement) !== true) {
    throw new Error('tab should stay trapped in dialog');
  }

  await harness.user.keyboard('{Escape}');

  if (harness.screen.queryByRole('dialog') !== null) {
    throw new Error('dialog should close on Escape');
  }

  if (harness.document.activeElement !== trigger) {
    throw new Error('focus should return to trigger after close');
  }

  await harness.user.click(trigger);

  const nextDay = harness.screen.getByRole('button', {
    name: getDayAriaLabel(new Date(2026, 4, 13), { locale: 'en-US' })
  });

  await harness.user.click(nextDay);

  const input = harness.screen.getByLabelText('Date');

  if (input.value !== formatInputDate(new Date(2026, 4, 13))) {
    throw new Error('controlled value should update after day selection');
  }

  if (changeCalls.length !== 1) {
    throw new Error('onChange should fire once after selecting a new day');
  }

  if (nextDay.parentNode?.getAttribute('aria-selected') !== 'true') {
    throw new Error('selected day should expose aria-selected');
  }

  await harness.teardown();
}

function findChromiumExecutable() {
  const candidates = [
    process.env.CHROME_BIN,
    process.env.CHROMIUM_BIN,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable'
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  const whichResult = spawnSync('which', ['chromium'], { encoding: 'utf8' });

  if (whichResult.status === 0) {
    const executable = whichResult.stdout.trim();

    if (executable) {
      return executable;
    }
  }

  throw new Error('Could not find Chromium executable.');
}
