import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { createRequire } from 'node:module';

import React from 'react';
import ReactDOMClient from 'react-dom/client';

const require = createRequire(import.meta.url);
const act = React.act;

export function createDatePickerTestHarness(rootDir) {
  const hooks = installSourceHooks(rootDir);
  const dom = createMiniDom();

  installGlobalDom(dom);

  const cleanupRegistry = new Set();

  const screen = createScreen(dom.document);
  const user = createUser(dom.document);

  async function render(element) {
    const container = dom.document.createElement('div');
    dom.document.body.appendChild(container);
    const root = ReactDOMClient.createRoot(container);

    await act(async () => {
      root.render(element);
    });

    const mounted = {
      container,
      root
    };

    cleanupRegistry.add(mounted);

    return {
      container,
      async rerender(nextElement) {
        await act(async () => {
          root.render(nextElement);
        });
      },
      async unmount() {
        await act(async () => {
          root.unmount();
        });
        cleanupRegistry.delete(mounted);
        container.remove();
      }
    };
  }

  async function cleanup() {
    for (const mounted of cleanupRegistry) {
      await act(async () => {
        mounted.root.unmount();
      });
      mounted.container.remove();
    }

    cleanupRegistry.clear();
    dom.document.body.replaceChildren();
    dom.document.activeElement = dom.document.body;
  }

  async function teardown() {
    await cleanup();
    hooks.restore();
  }

  return {
    React,
    act,
    cleanup,
    document: dom.document,
    render,
    requireSource,
    screen,
    teardown,
    user,
    window: dom.window
  };
}

function requireSource(relativePath) {
  return require(path.join(process.cwd(), relativePath));
}

function installSourceHooks(rootDir) {
  const originalResolveFilename = Module._resolveFilename;
  const originalTsHook = Module._extensions['.ts'];
  const originalTsxHook = Module._extensions['.tsx'];
  const originalCssHook = Module._extensions['.css'];

  Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
    try {
      return originalResolveFilename.call(this, request, parent, isMain, options);
    } catch (error) {
      if (!request.startsWith('.') && !path.isAbsolute(request)) {
        throw error;
      }

      const extensionCandidates = ['.ts', '.tsx', '.css'];

      for (const extension of extensionCandidates) {
        try {
          return originalResolveFilename.call(this, `${request}${extension}`, parent, isMain, options);
        } catch (_nextError) {
          // Continue.
        }
      }

      for (const suffix of ['/index.ts', '/index.tsx']) {
        try {
          return originalResolveFilename.call(this, `${request}${suffix}`, parent, isMain, options);
        } catch (_nextError) {
          // Continue.
        }
      }

      throw error;
    }
  };

  Module._extensions['.ts'] = function compileTypeScript(module, filename) {
    const source = fs.readFileSync(filename, 'utf8');
    const output = tsTranspile(source, filename);
    module._compile(output, filename);
  };

  Module._extensions['.tsx'] = function compileTypeScriptJsx(module, filename) {
    const source = fs.readFileSync(filename, 'utf8');
    const output = tsTranspile(source, filename);
    module._compile(output, filename);
  };

  Module._extensions['.css'] = function compileCssModule(module, filename) {
    module.exports = createCssModuleProxy(path.basename(filename, '.css'));
  };

  return {
    restore() {
      Module._resolveFilename = originalResolveFilename;
      Module._extensions['.ts'] = originalTsHook;
      Module._extensions['.tsx'] = originalTsxHook;

      if (originalCssHook) {
        Module._extensions['.css'] = originalCssHook;
      } else {
        delete Module._extensions['.css'];
      }
    }
  };
}

function tsTranspile(source, filename) {
  const ts = require('typescript');

  return ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    },
    fileName: filename
  }).outputText;
}

function createCssModuleProxy() {
  const styles = new Proxy(
    {},
    {
      get(_target, property) {
        if (property === '__esModule') {
          return true;
        }

        if (property === 'default') {
          return styles;
        }

        return String(property);
      }
    }
  );

  return {
    __esModule: true,
    default: styles
  };
}

function installGlobalDom(dom) {
  globalThis.window = dom.window;
  globalThis.document = dom.document;
  globalThis.navigator = dom.window.navigator;
  globalThis.Node = MiniNode;
  globalThis.Element = MiniElement;
  globalThis.HTMLElement = MiniElement;
  globalThis.HTMLInputElement = MiniElement;
  globalThis.HTMLButtonElement = MiniElement;
  globalThis.HTMLTextAreaElement = MiniElement;
  globalThis.HTMLSelectElement = MiniElement;
  globalThis.HTMLOptionElement = MiniElement;
  globalThis.HTMLFormElement = MiniElement;
  globalThis.HTMLTableElement = MiniElement;
  globalThis.HTMLTableRowElement = MiniElement;
  globalThis.HTMLTableCellElement = MiniElement;
  globalThis.HTMLTableSectionElement = MiniElement;
  globalThis.HTMLDivElement = MiniElement;
  globalThis.HTMLSpanElement = MiniElement;
  globalThis.HTMLBodyElement = MiniElement;
  globalThis.Text = MiniText;
  globalThis.Event = MiniEvent;
  globalThis.KeyboardEvent = MiniKeyboardEvent;
  globalThis.MouseEvent = MiniMouseEvent;
  globalThis.FocusEvent = MiniFocusEvent;
  globalThis.HTMLIFrameElement = MiniIFrameElement;
  globalThis.Document = MiniDocument;
  globalThis.customElements = undefined;
  globalThis.self = dom.window;
  globalThis.getComputedStyle = dom.window.getComputedStyle;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
}

function createMiniDom() {
  const document = new MiniDocument();
  const window = new MiniWindow(document);
  document.defaultView = window;

  return {
    document,
    window
  };
}

function createScreen(document) {
  return createQueryApi(() => document.body, document);
}

function createQueryApi(getRoot, document) {
  return {
    getByLabelText(label) {
      return getByQuery(() => queryByLabelText(getRoot(), label, false), 'label', label);
    },
    getByRole(role, options = {}) {
      return getByQuery(() => queryByRole(getRoot(), role, options, false), 'role', role);
    },
    getByText(text) {
      return getByQuery(() => queryByText(getRoot(), text, false), 'text', text);
    },
    queryByLabelText(label) {
      return queryByLabelText(getRoot(), label, true);
    },
    queryByRole(role, options = {}) {
      return queryByRole(getRoot(), role, options, false);
    },
    queryByText(text) {
      return queryByText(getRoot(), text, true);
    },
    root: getRoot,
    document
  };
}

function getByQuery(getter, kind, value) {
  const result = getter();

  if (result) {
    return result;
  }

  throw new Error(`Unable to find ${kind}: ${formatMatcher(value)}`);
}

function queryByLabelText(root, label, allowHidden) {
  return findFirst(root, (element) => {
    const ariaLabel = element.getAttribute('aria-label');

    if (!ariaLabel) {
      return false;
    }

    return matchesText(ariaLabel, label) && (allowHidden || !isHidden(element));
  });
}

function queryByRole(root, role, options, allowHidden) {
  return findFirst(root, (element) => {
    if (!isRole(element, role)) {
      return false;
    }

    if (!allowHidden && isHidden(element)) {
      return false;
    }

    if (options.name !== undefined) {
      return matchesText(getAccessibleName(element), options.name);
    }

    return true;
  });
}

function queryByText(root, text, allowHidden) {
  return findFirst(root, (element) => {
    if (!allowHidden && isHidden(element)) {
      return false;
    }

    return matchesText(element.textContent ?? '', text);
  });
}

function isRole(element, role) {
  const explicitRole = element.getAttribute('role');

  if (explicitRole === role) {
    return true;
  }

  if (role === 'button') {
    return element.tagName === 'BUTTON';
  }

  if (role === 'textbox') {
    return element.tagName === 'INPUT';
  }

  if (role === 'grid') {
    return element.tagName === 'TABLE';
  }

  return false;
}

function getAccessibleName(element) {
  const ariaLabel = element.getAttribute('aria-label');

  if (ariaLabel) {
    return ariaLabel;
  }

  const labelledBy = element.getAttribute('aria-labelledby');

  if (labelledBy) {
    return labelledBy
      .split(/\s+/)
      .map((id) => element.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' ')
      .trim();
  }

  return element.textContent ?? '';
}

function findFirst(root, predicate) {
  const stack = [...getChildElements(root)].reverse();

  while (stack.length > 0) {
    const element = stack.pop();

    if (predicate(element)) {
      return element;
    }

    stack.push(...getChildElements(element).reverse());
  }

  return null;
}

function getChildElements(root) {
  if (!root || !root.childNodes) {
    return [];
  }

  return root.childNodes.filter((node) => node instanceof MiniElement);
}

function createUser(document) {
  return {
    async click(element) {
      await runAct(() => {
        if (isFocusable(element)) {
          element.focus();
        }

        dispatchPointerEvent(element, 'pointerdown');
        dispatchPointerEvent(element, 'mousedown');
        dispatchPointerEvent(element, 'mouseup');
        dispatchPointerEvent(element, 'click');
      });
    },
    async keyboard(value) {
      const activeElement = document.activeElement ?? document.body;
      const keys = parseKeyboardInput(value);

      for (const key of keys) {
        await runAct(() => {
          dispatchKeyboardSequence(activeElement, key);
        });
      }
    },
    async tab(options = {}) {
      const activeElement = document.activeElement ?? document.body;

      await runAct(() => {
        const event = dispatchKeyboardEvent(activeElement, 'Tab', options);

        if (event.defaultPrevented) {
          return;
        }

        const focusables = getTabbableElements(document.body);
        const currentIndex = focusables.findIndex((element) => element === activeElement);
        const nextIndex = options.shift
          ? currentIndex <= 0
            ? focusables.length - 1
            : currentIndex - 1
          : currentIndex < 0 || currentIndex === focusables.length - 1
            ? 0
            : currentIndex + 1;
        const nextElement = focusables[nextIndex];

        if (nextElement) {
          nextElement.focus();
        }
      });
    },
    async type(element, text) {
      await runAct(() => {
        if (isFocusable(element)) {
          element.focus();
        }
      });

      for (const char of text) {
        await runAct(() => {
          if ('value' in element) {
            const nextValue = `${element.value ?? ''}${char}`;
            setNativeValue(element, nextValue);
            dispatchInputEvent(element, char, nextValue);
            return;
          }

          dispatchKeyboardSequence(element, char);
        });
      }
    }
  };
}

function setNativeValue(element, nextValue) {
  const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value');

  if (descriptor?.set) {
    descriptor.set.call(element, nextValue);
    return;
  }

  element.value = nextValue;
}

function parseKeyboardInput(value) {
  const tokens = [];
  let index = 0;

  while (index < value.length) {
    if (value[index] === '{') {
      const endIndex = value.indexOf('}', index);
      const token = value.slice(index + 1, endIndex);
      tokens.push(token);
      index = endIndex + 1;
      continue;
    }

    tokens.push(value[index]);
    index += 1;
  }

  return tokens;
}

function dispatchKeyboardSequence(target, token) {
  switch (token) {
    case 'Escape':
    case 'Enter':
    case 'Tab':
    case 'ArrowLeft':
    case 'ArrowRight':
    case 'ArrowUp':
    case 'ArrowDown':
    case 'Home':
    case 'End':
    case 'PageUp':
    case 'PageDown':
    case ' ':
      dispatchKeyboardEvent(target, token, {});
      return;
    default:
      dispatchKeyboardEvent(target, token, {});
  }
}

function dispatchKeyboardEvent(target, key, options = {}) {
  const event = new MiniKeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key,
    shiftKey: options.shift === true || options.shiftKey === true
  });

  target.dispatchEvent(event);

  const keyupEvent = new MiniKeyboardEvent('keyup', {
    bubbles: true,
    cancelable: true,
    key,
    shiftKey: options.shift === true || options.shiftKey === true
  });

  target.dispatchEvent(keyupEvent);

  return event;
}

function dispatchPointerEvent(target, type) {
  const event = new MiniMouseEvent(type, {
    bubbles: true,
    cancelable: true
  });

  target.dispatchEvent(event);
}

function dispatchInputEvent(target, data, value) {
  const event = new MiniEvent('input', {
    bubbles: true,
    cancelable: true
  });

  event.data = data;
  event.inputType = 'insertText';
  event.target = target;
  event.currentTarget = target;
  event.value = value;

  target.dispatchEvent(event);

  const changeEvent = new MiniEvent('change', {
    bubbles: true,
    cancelable: true
  });

  changeEvent.target = target;
  changeEvent.currentTarget = target;
  changeEvent.value = value;

  target.dispatchEvent(changeEvent);
}

function getTabbableElements(root) {
  const elements = [];

  walkElements(root, (element) => {
    if (!isFocusable(element)) {
      return;
    }

    elements.push(element);
  });

  return elements;
}

function isFocusable(element) {
  if (!(element instanceof MiniElement)) {
    return false;
  }

  if (element.hidden || element.disabled || isHidden(element)) {
    return false;
  }

  const tabIndex = element.tabIndex;

  return tabIndex >= 0 || element.tagName === 'INPUT' || element.tagName === 'BUTTON';
}

function walkElements(root, visit) {
  if (!root || !root.childNodes) {
    return;
  }

  for (const node of root.childNodes) {
    if (!(node instanceof MiniElement)) {
      continue;
    }

    visit(node);
    walkElements(node, visit);
  }
}

function matchesText(actual, expected) {
  if (expected instanceof RegExp) {
    return expected.test(actual);
  }

  return actual === String(expected);
}

function isHidden(element) {
  if (element.hidden || element.getAttribute('hidden') !== null) {
    return true;
  }

  let current = element.parentNode;

  while (current) {
    if (current instanceof MiniElement && (current.hidden || current.getAttribute('hidden') !== null)) {
      return true;
    }

    current = current.parentNode;
  }

  return false;
}

function formatMatcher(value) {
  if (value instanceof RegExp) {
    return value.toString();
  }

  return JSON.stringify(value);
}

function runAct(callback) {
  return React.act(callback);
}

class MiniEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = options.bubbles ?? false;
    this.cancelable = options.cancelable ?? false;
    this.composed = options.composed ?? false;
    this.defaultPrevented = false;
    this.eventPhase = 0;
    this.isTrusted = false;
    this.target = null;
    this.currentTarget = null;
    this.detail = options.detail ?? null;
    this.shiftKey = options.shiftKey ?? false;
    this.altKey = options.altKey ?? false;
    this.ctrlKey = options.ctrlKey ?? false;
    this.metaKey = options.metaKey ?? false;
    this.button = options.button ?? 0;
    this.key = options.key ?? '';
    this.data = options.data ?? null;
    this.inputType = options.inputType ?? '';
  }

  preventDefault() {
    if (this.cancelable) {
      this.defaultPrevented = true;
    }
  }

  stopPropagation() {
    this._propagationStopped = true;
  }

  stopImmediatePropagation() {
    this._immediatePropagationStopped = true;
    this._propagationStopped = true;
  }
}

class MiniKeyboardEvent extends MiniEvent {}
class MiniMouseEvent extends MiniEvent {}
class MiniFocusEvent extends MiniEvent {}

class MiniNode {
  constructor() {
    this.parentNode = null;
    this.ownerDocument = null;
    this.childNodes = [];
    this._textContent = '';
  }

  get isConnected() {
    let current = this;

    while (current) {
      if (current instanceof MiniDocument) {
        return true;
      }

      current = current.parentNode;
    }

    return false;
  }

  appendChild(node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }

    this.childNodes.push(node);
    node.parentNode = this;
    node.ownerDocument = this.ownerDocument ?? this;

    return node;
  }

  removeChild(node) {
    const index = this.childNodes.indexOf(node);

    if (index >= 0) {
      this.childNodes.splice(index, 1);
      node.parentNode = null;
    }

    return node;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  insertBefore(node, before) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }

    const index = this.childNodes.indexOf(before);

    if (index === -1) {
      return this.appendChild(node);
    }

    this.childNodes.splice(index, 0, node);
    node.parentNode = this;
    node.ownerDocument = this.ownerDocument ?? this;

    return node;
  }

  replaceChildren(...nodes) {
    for (const child of this.childNodes) {
      child.parentNode = null;
    }

    this.childNodes = [];

    for (const node of nodes) {
      this.appendChild(node);
    }
  }

  contains(node) {
    if (node === this) {
      return true;
    }

    let current = node?.parentNode;

    while (current) {
      if (current === this) {
        return true;
      }

      current = current.parentNode;
    }

    return false;
  }

  get firstChild() {
    return this.childNodes[0] ?? null;
  }

  get lastChild() {
    return this.childNodes[this.childNodes.length - 1] ?? null;
  }

  get textContent() {
    return this.childNodes.map((node) => node.textContent ?? '').join('');
  }

  set textContent(value) {
    for (const child of this.childNodes) {
      child.parentNode = null;
    }

    this.childNodes = [];

    if (value === '' || value === null || value === undefined) {
      return;
    }

    this.appendChild(new MiniText(String(value)));
  }
}

class MiniText extends MiniNode {
  constructor(text) {
    super();
    this.nodeType = 3;
    this.nodeName = '#text';
    this.data = String(text);
    this.nodeValue = this.data;
  }

  get textContent() {
    return this.data;
  }

  set textContent(value) {
    this.data = String(value);
    this.nodeValue = this.data;
  }
}

class MiniElement extends MiniNode {
  constructor(tagName) {
    super();
    this.nodeType = 1;
    this.tagName = String(tagName).toUpperCase();
    this.nodeName = this.tagName;
    this.namespaceURI = 'http://www.w3.org/1999/xhtml';
    this.attributes = new Map();
    this.style = {};
    this._listeners = new Map();
    this._className = '';
    this._id = '';
    this._hidden = false;
    this._tabIndex = -1;
    this._value = '';
    this._checked = false;
    this._disabled = false;
    this._type = this.tagName === 'INPUT' ? 'text' : '';
    this._name = '';
    this.selectionStart = 0;
    this.selectionEnd = 0;
  }

  get className() {
    return this._className;
  }

  set className(value) {
    this._className = String(value);
    this.attributes.set('class', this._className);
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = String(value);
    this.attributes.set('id', this._id);
  }

  get hidden() {
    return this._hidden;
  }

  set hidden(value) {
    this._hidden = Boolean(value);

    if (this._hidden) {
      this.attributes.set('hidden', '');
      return;
    }

    this.attributes.delete('hidden');
  }

  get tabIndex() {
    return this._tabIndex;
  }

  set tabIndex(value) {
    this._tabIndex = Number(value);
    this.attributes.set('tabindex', String(this._tabIndex));
  }

  get value() {
    return this._value;
  }

  set value(nextValue) {
    this._value = String(nextValue);
  }

  get checked() {
    return this._checked;
  }

  set checked(value) {
    this._checked = Boolean(value);
  }

  get disabled() {
    return this._disabled;
  }

  set disabled(value) {
    this._disabled = Boolean(value);

    if (this._disabled) {
      this.attributes.set('disabled', '');
      return;
    }

    this.attributes.delete('disabled');
  }

  get type() {
    return this._type;
  }

  set type(value) {
    this._type = String(value);
    this.attributes.set('type', this._type);
  }

  get name() {
    return this._name;
  }

  set name(value) {
    this._name = String(value);
    this.attributes.set('name', this._name);
  }

  get dataset() {
    const dataset = {};

    for (const [key, value] of this.attributes.entries()) {
      if (!key.startsWith('data-')) {
        continue;
      }

      const propertyName = key
        .slice(5)
        .split('-')
        .map((part, index) => (index === 0 ? part : part.slice(0, 1).toUpperCase() + part.slice(1)))
        .join('');

      dataset[propertyName] = value;
    }

    return dataset;
  }

  get children() {
    return this.childNodes.filter((node) => node instanceof MiniElement);
  }

  getAttribute(name) {
    const normalizedName = String(name).toLowerCase();

    if (normalizedName === 'class') {
      return this._className || null;
    }

    if (normalizedName === 'id') {
      return this._id || null;
    }

    if (normalizedName === 'hidden') {
      return this._hidden ? '' : null;
    }

    if (normalizedName === 'tabindex') {
      return String(this._tabIndex);
    }

    if (normalizedName === 'disabled') {
      return this._disabled ? '' : null;
    }

    if (normalizedName === 'value') {
      return this._value;
    }

    if (normalizedName === 'type') {
      return this._type || null;
    }

    if (normalizedName === 'name') {
      return this._name || null;
    }

    return this.attributes.has(normalizedName) ? this.attributes.get(normalizedName) : null;
  }

  hasAttribute(name) {
    return this.getAttribute(name) !== null;
  }

  setAttribute(name, value) {
    const normalizedName = String(name).toLowerCase();
    const stringValue = String(value);

    if (normalizedName === 'class') {
      this._className = stringValue;
      this.attributes.set('class', stringValue);
      return;
    }

    if (normalizedName === 'id') {
      this._id = stringValue;
      this.attributes.set('id', stringValue);
      return;
    }

    if (normalizedName === 'hidden') {
      this.hidden = true;
      return;
    }

    if (normalizedName === 'tabindex') {
      this._tabIndex = Number(stringValue);
      this.attributes.set('tabindex', stringValue);
      return;
    }

    if (normalizedName === 'disabled') {
      this.disabled = true;
      return;
    }

    if (normalizedName === 'value') {
      this._value = stringValue;
      this.attributes.set('value', stringValue);
      return;
    }

    if (normalizedName === 'type') {
      this._type = stringValue;
      this.attributes.set('type', stringValue);
      return;
    }

    if (normalizedName === 'name') {
      this._name = stringValue;
      this.attributes.set('name', stringValue);
      return;
    }

    this.attributes.set(normalizedName, stringValue);
  }

  removeAttribute(name) {
    const normalizedName = String(name).toLowerCase();

    if (normalizedName === 'class') {
      this._className = '';
    } else if (normalizedName === 'id') {
      this._id = '';
    } else if (normalizedName === 'hidden') {
      this._hidden = false;
    } else if (normalizedName === 'tabindex') {
      this._tabIndex = -1;
    } else if (normalizedName === 'disabled') {
      this._disabled = false;
    } else if (normalizedName === 'value') {
      this._value = '';
    } else if (normalizedName === 'type') {
      this._type = '';
    } else if (normalizedName === 'name') {
      this._name = '';
    }

    this.attributes.delete(normalizedName);
  }

  addEventListener(type, listener, options = {}) {
    const normalizedType = String(type);
    const capture = typeof options === 'boolean' ? options : Boolean(options?.capture);
    const listeners = this._listeners.get(normalizedType) ?? [];

    listeners.push({ capture, listener });
    this._listeners.set(normalizedType, listeners);
  }

  removeEventListener(type, listener, options = {}) {
    const normalizedType = String(type);
    const capture = typeof options === 'boolean' ? options : Boolean(options?.capture);
    const listeners = this._listeners.get(normalizedType) ?? [];

    this._listeners.set(
      normalizedType,
      listeners.filter((entry) => entry.listener !== listener || entry.capture !== capture)
    );
  }

  attachEvent() {}

  detachEvent() {}

  dispatchEvent(event) {
    if (!(event instanceof MiniEvent)) {
      throw new TypeError('dispatchEvent expects MiniEvent');
    }

    if (!event.target) {
      event.target = this;
    }

    const path = [];
    let current = this;

    while (current) {
      path.push(current);
      current = current.parentNode;
    }

    const capturePath = [...path].reverse();

    for (const node of capturePath) {
      if (!(node instanceof MiniElement || node instanceof MiniDocument)) {
        continue;
      }

      event.eventPhase = 1;
      event.currentTarget = node;
      invokeListeners(node, event, true);

      if (event._propagationStopped) {
        return !event.defaultPrevented;
      }
    }

    for (const node of path) {
      if (!(node instanceof MiniElement || node instanceof MiniDocument)) {
        continue;
      }

      event.eventPhase = node === this ? 2 : 3;
      event.currentTarget = node;
      invokeListeners(node, event, false);

      if (event._propagationStopped) {
        break;
      }
    }

    return !event.defaultPrevented;
  }

  focus() {
    if (this.disabled) {
      return;
    }

    const document = this.ownerDocument;

    if (!document) {
      return;
    }

    const previousActiveElement = document.activeElement;

    if (previousActiveElement === this) {
      return;
    }

    if (previousActiveElement && previousActiveElement !== document.body) {
      previousActiveElement.blur();
    }

    document.activeElement = this;
    this.dispatchEvent(new MiniFocusEvent('focusin', { bubbles: true, cancelable: false }));
    this.dispatchEvent(new MiniFocusEvent('focus', { bubbles: false, cancelable: false }));
  }

  blur() {
    const document = this.ownerDocument;

    if (!document || document.activeElement !== this) {
      return;
    }

    this.dispatchEvent(new MiniFocusEvent('focusout', { bubbles: true, cancelable: false }));
    this.dispatchEvent(new MiniFocusEvent('blur', { bubbles: false, cancelable: false }));
    document.activeElement = document.body;
  }

  click() {
    dispatchPointerEvent(this, 'click');
  }

  setSelectionRange(start, end) {
    this.selectionStart = start;
    this.selectionEnd = end;
  }

  matches(selector) {
    return matchesSelector(this, selector);
  }

  querySelector(selector) {
    return querySelector(this, selector);
  }

  querySelectorAll(selector) {
    return querySelectorAll(this, selector);
  }

  get textContent() {
    return this.childNodes.map((node) => node.textContent ?? '').join('');
  }

  set textContent(value) {
    for (const child of this.childNodes) {
      child.parentNode = null;
    }

    this.childNodes = [];

    if (value === '' || value === null || value === undefined) {
      return;
    }

    this.appendChild(new MiniText(String(value)));
  }

  get outerHTML() {
    const attributes = [];

    for (const [key, value] of this.attributes.entries()) {
      if (value === '') {
        attributes.push(key);
        continue;
      }

      attributes.push(`${key}="${escapeHtml(value)}"`);
    }

    const openingTag = attributes.length
      ? `<${this.tagName.toLowerCase()} ${attributes.join(' ')}>`
      : `<${this.tagName.toLowerCase()}>`;

    if (this.tagName === 'INPUT' || this.tagName === 'BR' || this.tagName === 'HR' || this.tagName === 'IMG') {
      return openingTag;
    }

    return `${openingTag}${this.textContent}</${this.tagName.toLowerCase()}>`;
  }
}

class MiniIFrameElement extends MiniElement {}

class MiniDocument extends MiniNode {
  constructor() {
    super();
    this.nodeType = 9;
    this.nodeName = '#document';
    this.ownerDocument = this;
    this.documentElement = new MiniElement('html');
    this.documentElement.ownerDocument = this;
    this.body = new MiniElement('body');
    this.body.ownerDocument = this;
    this.childNodes = [this.documentElement];
    this.documentElement.parentNode = this;
    this.documentElement.appendChild(this.body);
    this.activeElement = this.body;
    this._listeners = new Map();
  }

  createElement(tagName) {
    const element = new MiniElement(tagName);
    element.ownerDocument = this;
    return element;
  }

  createElementNS(_namespaceURI, tagName) {
    return this.createElement(tagName);
  }

  createTextNode(text) {
    const node = new MiniText(text);
    node.ownerDocument = this;
    return node;
  }

  createComment(text) {
    const node = new MiniText(text);
    node.nodeType = 8;
    node.nodeName = '#comment';
    return node;
  }

  getElementById(id) {
    return findFirst(this.body, (element) => element.id === id);
  }

  querySelector(selector) {
    return this.body.querySelector(selector);
  }

  querySelectorAll(selector) {
    return this.body.querySelectorAll(selector);
  }

  addEventListener(type, listener, options = {}) {
    const normalizedType = String(type);
    const capture = typeof options === 'boolean' ? options : Boolean(options?.capture);
    const listeners = this._listeners.get(normalizedType) ?? [];

    listeners.push({ capture, listener });
    this._listeners.set(normalizedType, listeners);
  }

  removeEventListener(type, listener, options = {}) {
    const normalizedType = String(type);
    const capture = typeof options === 'boolean' ? options : Boolean(options?.capture);
    const listeners = this._listeners.get(normalizedType) ?? [];

    this._listeners.set(
      normalizedType,
      listeners.filter((entry) => entry.listener !== listener || entry.capture !== capture)
    );
  }

  dispatchEvent(event) {
    if (!(event instanceof MiniEvent)) {
      throw new TypeError('dispatchEvent expects MiniEvent');
    }

    if (!event.target) {
      event.target = this;
    }

    invokeListeners(this, event, false);
    return !event.defaultPrevented;
  }
}

class MiniWindow {
  constructor(document) {
    this.document = document;
    this.navigator = { userAgent: 'node' };
    this.Node = MiniNode;
    this.Element = MiniElement;
    this.HTMLElement = MiniElement;
    this.HTMLInputElement = MiniElement;
    this.HTMLButtonElement = MiniElement;
    this.HTMLTextAreaElement = MiniElement;
    this.HTMLSelectElement = MiniElement;
    this.HTMLOptionElement = MiniElement;
    this.HTMLFormElement = MiniElement;
    this.HTMLTableElement = MiniElement;
    this.HTMLTableRowElement = MiniElement;
    this.HTMLTableCellElement = MiniElement;
    this.HTMLTableSectionElement = MiniElement;
    this.HTMLDivElement = MiniElement;
    this.HTMLSpanElement = MiniElement;
    this.HTMLBodyElement = MiniElement;
    this.HTMLIFrameElement = MiniIFrameElement;
    this.Text = MiniText;
    this.Event = MiniEvent;
    this.KeyboardEvent = MiniKeyboardEvent;
    this.MouseEvent = MiniMouseEvent;
    this.FocusEvent = MiniFocusEvent;
    this.Document = MiniDocument;
    this.getComputedStyle = () => ({
      getPropertyValue() {
        return '';
      }
    });
    this.requestAnimationFrame = (callback) => setTimeout(() => callback(Date.now()), 0);
    this.cancelAnimationFrame = (handle) => clearTimeout(handle);
  }
}

function invokeListeners(node, event, capturePhase) {
  const listeners = getListeners(node, event.type);

  for (const entry of listeners) {
    if (entry.capture !== capturePhase) {
      continue;
    }

    entry.listener.call(node, event);

    if (event._immediatePropagationStopped) {
      return;
    }
  }
}

function getListeners(node, type) {
  if (node instanceof MiniDocument) {
    return node._listeners.get(type) ?? [];
  }

  if (node instanceof MiniElement) {
    return node._listeners.get(type) ?? [];
  }

  return [];
}

function matchesSelector(element, selector) {
  const trimmedSelector = selector.trim();
  const notDisabledMatch = trimmedSelector.match(/^(.*):not\(\[disabled\]\)$/);
  const baseSelector = notDisabledMatch ? notDisabledMatch[1].trim() : trimmedSelector;

  if (notDisabledMatch && element.disabled) {
    return false;
  }

  if (baseSelector.startsWith('#')) {
    return element.id === baseSelector.slice(1);
  }

  const tagAndAttributeMatch = baseSelector.match(/^([a-z0-9-]+)?(?:\[([^=\]]+)(?:=(["']?)([^"']*)\3)?\])?$/i);

  if (tagAndAttributeMatch) {
    const [, tagName, attributeName, , attributeValue] = tagAndAttributeMatch;

    if (tagName && element.tagName !== tagName.toUpperCase()) {
      return false;
    }

    if (!attributeName) {
      return true;
    }

    const attribute = element.getAttribute(attributeName);

    if (attributeValue === undefined) {
      return attribute !== null;
    }

    return attribute === attributeValue;
  }

  return element.tagName === baseSelector.toUpperCase();
}

function querySelector(root, selector) {
  return querySelectorAll(root, selector)[0] ?? null;
}

function querySelectorAll(root, selector) {
  const results = [];

  walkElements(root, (element) => {
    if (matchesSelector(element, selector)) {
      results.push(element);
    }
  });

  return results;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
