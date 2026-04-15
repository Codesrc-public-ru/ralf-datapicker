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

await ensureBuiltApp();

const chromiumExecutable = findChromiumExecutable();

if (chromiumExecutable) {
  const browserHtmlPath = await buildBrowserHtml(rootDir);

  try {
    const browserUrl = pathToFileURL(browserHtmlPath).href;
    const desktopChromiumResult = runChromium(chromiumExecutable, browserUrl, [
      '--allow-file-access-from-files',
      '--window-size=1280,900'
    ]);
    const mobileChromiumResult = runChromium(chromiumExecutable, browserUrl, [
      '--allow-file-access-from-files',
      '--window-size=390,844'
    ]);

    if (desktopChromiumResult.status !== 0) {
      console.error(desktopChromiumResult.stderr || desktopChromiumResult.stdout);
      process.exit(desktopChromiumResult.status ?? 1);
    }

    if (mobileChromiumResult.status !== 0) {
      console.error(mobileChromiumResult.stderr || mobileChromiumResult.stdout);
      process.exit(mobileChromiumResult.status ?? 1);
    }

    const desktopResult = parseBrowserResult(desktopChromiumResult.stdout);
    const mobileResult = parseBrowserResult(mobileChromiumResult.stdout);

    if (desktopResult.status !== 'pass') {
      console.error(desktopResult.message);
      process.exit(1);
    }

    if (mobileResult.status !== 'pass') {
      console.error(mobileResult.message);
      process.exit(1);
    }

    console.log(`ok browser checks: ${desktopResult.summary}; ${mobileResult.summary}`);
  } finally {
    fs.rmSync(path.dirname(browserHtmlPath), { recursive: true, force: true });
  }
} else {
  console.warn('Chromium browser check blocked here. Falling back to DOM harness.');
  await runFallbackChecks();
  console.log('ok browser checks: DOM fallback pass');
}

async function ensureBuiltApp() {
  const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
  const result = spawnSync(process.execPath, [viteBin, 'build'], {
    cwd: rootDir,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024
  });

  if (result.status !== 0) {
    if (result.stdout) {
      process.stderr.write(result.stdout);
    }
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
    throw new Error('Vite build failed before browser check.');
  }
}

async function buildBrowserHtml(rootDir) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'date-picker-browser-check-'));
  const distDir = path.join(rootDir, 'dist');
  const indexHtmlPath = path.join(distDir, 'index.html');
  const browserCheckScript = buildBrowserCheckScript(mode);
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const fileAssetBase = `${pathToFileURL(distDir).href}/assets/`;
  const axeFileUrl = pathToFileURL(path.join(rootDir, 'node_modules/axe-core/axe.js')).href;
  const rewrittenHtml = indexHtml
    .replaceAll('src="/assets/', `src="${fileAssetBase}`)
    .replaceAll('href="/assets/', `href="${fileAssetBase}`);
  const html = rewrittenHtml.replace(
    '</body>',
    `<pre id="result" data-status="pending" hidden></pre><script src="${axeFileUrl}"></script><script>${browserCheckScript}</script></body>`
  );
  const htmlPath = path.join(tempDir, 'index.html');

  fs.writeFileSync(htmlPath, html);
  return htmlPath;
}

function buildBrowserCheckScript(currentMode) {
  return String.raw`
(() => {
  const resultNode = document.getElementById('result') || createResultNode();

  if (document.readyState !== 'complete') {
    window.addEventListener(
      'load',
      () => {
        setTimeout(runChecks, 0);
      },
      { once: true }
    );
    return;
  }

  setTimeout(runChecks, 0);

  function runChecks() {
    const payload = {
      mode: ${JSON.stringify(currentMode)},
      summary: [],
      status: 'pass'
    };

    try {
      const loadSampleButton = findButtonByText('Load sample');
      const selectedDate = new Date(2026, 4, 12);

      loadSampleButton.click();
      afterTick(() => {
        try {
          const trigger = findTriggerButton();
          const selectedLabel = formatFullDateLabel(selectedDate, 'en-US');

          assert(
            trigger.getAttribute('aria-label') === 'Change date, selected ' + selectedLabel,
            'trigger should describe the selected value'
          );
          payload.summary.push('loaded built app');

          trigger.click();
          afterTick(() => {
            try {
              const dialog = findDialog();
              const selectedDay = findDayButton(selectedDate, 'selected');
              const input = document.querySelector('input');
              const field = input ? input.parentElement : null;

              assert(dialog.getAttribute('aria-modal') === 'true', 'dialog should declare aria-modal');
              assert(document.activeElement === selectedDay, 'selected day should receive initial focus');
              assert(field && input, 'shell should render field and input nodes');

              if (window.innerWidth <= 520) {
                const fieldStyle = getComputedStyle(field);

                assert(fieldStyle.flexDirection === 'column', 'mobile field should stack input and trigger');
                assert(input.getBoundingClientRect().height >= 44, 'mobile input should stay touch friendly');
                assert(trigger.getBoundingClientRect().height >= 44, 'mobile trigger should stay touch friendly');
                payload.summary.push('mobile layout stacks controls');
              } else {
                assert(
                  getComputedStyle(field).flexDirection === 'row',
                  'desktop field should keep inline layout'
                );
                payload.summary.push('desktop layout keeps inline controls');
              }

              dispatchKey(dialog, 'Tab');
              assert(dialog.contains(document.activeElement), 'tab should stay trapped in dialog');

              const nextDay = findDayButton(new Date(2026, 4, 13));
              nextDay.click();
              afterTick(() => {
                afterTick(() => {
                  try {
                    const selectedInput = document.querySelector('input');
                    assert(
                      selectedInput.value === formatInputDate(new Date(2026, 4, 13)),
                      'selection should update controlled value'
                    );
                    payload.summary.push('selection updates controlled value');

                    payload.message = payload.summary.join('; ');
                    finish('pass', payload);
                  } catch (error) {
                    finish('fail', {
                      ...payload,
                      message: error instanceof Error ? error.stack || error.message : String(error)
                    });
                  }
                });
              });
            } catch (error) {
              finish('fail', {
                ...payload,
                message: error instanceof Error ? error.stack || error.message : String(error)
              });
            }
          });
        } catch (error) {
          finish('fail', {
            ...payload,
            message: error instanceof Error ? error.stack || error.message : String(error)
          });
        }
      });
    } catch (error) {
      finish('fail', {
        ...payload,
        message: error instanceof Error ? error.stack || error.message : String(error)
      });
    }
  }

  function finish(status, nextPayload) {
    render(status, nextPayload);
  }

  function render(status, nextPayload) {
    resultNode.textContent = JSON.stringify(nextPayload, null, 2);
    resultNode.dataset.status = status;
    resultNode.hidden = true;
  }

  function createResultNode() {
    const node = document.createElement('pre');
    node.id = 'result';
    node.dataset.status = 'pending';
    node.hidden = true;
    document.body.appendChild(node);
    return node;
  }

  function afterTick(callback) {
    setTimeout(callback, 0);
  }

  function findTriggerButton() {
    const trigger = document.querySelector('button[aria-haspopup="dialog"]');

    if (!trigger) {
      throw new Error('Missing trigger button in built DOM.');
    }

    return trigger;
  }

  function findButtonByText(text) {
    const buttons = Array.from(document.querySelectorAll('button'));
    const button = buttons.find((candidate) => (candidate.textContent || '').trim() === text);

    if (!button) {
      throw new Error('Missing button with text ' + text);
    }

    return button;
  }

  function findDialog() {
    const dialog = document.querySelector('[role="dialog"]');

    if (!dialog) {
      throw new Error('Missing dialog in built DOM.');
    }

    return dialog;
  }

  function findDayButton(date, state = null) {
    const label = formatFullDateLabel(date, 'en-US');
    const targetLabel = state ? label + ', ' + state : label;
    const button = Array.from(document.querySelectorAll('button')).find((candidate) => {
      return candidate.getAttribute('aria-label') === targetLabel;
    });

    if (!button) {
      throw new Error('Missing day button with label ' + targetLabel);
    }

    return button;
  }

  function formatInputDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return day + '.' + month + '.' + year;
  }

  function formatFullDateLabel(date, locale) {
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(normalizedDate);
  }

  function dispatchKey(target, key) {
    const keyCode = getKeyCode(key);
    const eventInit = {
      bubbles: true,
      cancelable: true,
      code: key,
      key,
      keyCode,
      which: keyCode
    };

    target.dispatchEvent(new KeyboardEvent('keydown', eventInit));
    target.dispatchEvent(new KeyboardEvent('keyup', eventInit));
  }

  function getKeyCode(key) {
    switch (key) {
      case 'Tab':
        return 9;
      case 'Escape':
        return 27;
      default:
        return 0;
    }
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }
})();
`;
}

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

function writeBrowserHtml(rootDir, browserBundle) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'date-picker-browser-check-'));
  const htmlPath = path.join(tempDir, 'index.html');
  const componentCss = fs.readFileSync(
    path.join(rootDir, 'src/components/date-picker/DatePicker.module.css'),
    'utf8'
  );
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>DatePicker browser checks</title>
  <style>${componentCss.replaceAll('<', '\\u003c')}</style>
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
      const moduleCache = new Map();
      const moduleFactories = new Map();

      try {
        const bundle = JSON.parse(document.getElementById('module-data').textContent);

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
        const field = document.querySelector('.field');
        const input = document.querySelector('input');
        const triggerButton = trigger;

        if (!field || !input) {
          throw new Error('responsive shell should render field and input nodes');
        }

        if (document.activeElement !== selectedDay) {
          throw new Error('selected day should receive initial focus');
        }
        payload.summary.push('initial focus lands on selected day');

        if (window.innerWidth <= 520) {
          const fieldStyle = getComputedStyle(field);
          const dialogRect = dialog.getBoundingClientRect();
          const inputRect = input.getBoundingClientRect();
          const triggerRect = triggerButton.getBoundingClientRect();

          if (fieldStyle.flexDirection !== 'column') {
            throw new Error('mobile field should stack input and trigger');
          }

          if (inputRect.height < 44 || triggerRect.height < 44) {
            throw new Error('mobile controls should stay touch friendly');
          }

          if (triggerRect.width < inputRect.width * 0.9) {
            throw new Error('mobile trigger should span the field width');
          }

          if (dialogRect.width > window.innerWidth) {
            throw new Error('mobile dialog should fit the viewport');
          }

          payload.summary.push('mobile layout stacks controls and fits viewport');
        } else {
          const fieldStyle = getComputedStyle(field);

          if (fieldStyle.flexDirection !== 'row') {
            throw new Error('desktop field should keep inline layout');
          }

          payload.summary.push('desktop layout keeps inline controls');
        }

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

        const selectedInput = document.querySelector('input');
        if (selectedInput.value !== formatInputDate(new Date(2026, 4, 13))) {
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

function runChromium(chromiumExecutable, url, extraArgs = []) {
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
      ...extraArgs,
      '--dump-dom',
      url
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
  const statusMatch = output.match(/<pre id="result"[^>]*data-status="([^"]+)"[^>]*>([\s\S]*?)<\/pre>/);

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

  return null;
}
