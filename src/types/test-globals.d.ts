declare const dp: {
  read(relativePath: string): string;
  exists(relativePath: string): boolean;
  relative(absolutePath: string): string;
  list(relativePath: string): string[];
};

declare const React: typeof import('react');
declare const document: Document;
declare const window: Window & typeof globalThis;

declare function describe(name: string, fn: () => void): void;
declare function test(name: string, fn: () => void | Promise<void>): void;

declare namespace test {
  function skip(name: string, fn: () => void): void;
}

declare function render(element: React.ReactElement): Promise<{
  container: HTMLElement;
  rerender(nextElement: React.ReactElement): Promise<void>;
  unmount(): Promise<void>;
}>;

declare const cleanup: () => void;

declare const requireSource: (relativePath: string) => unknown;

declare const screen: {
  document: Document;
  getByLabelText(text: string | RegExp): HTMLElement;
  getByRole(role: string, options?: { name?: string | RegExp }): HTMLElement;
  getByText(text: string | RegExp): HTMLElement;
  queryByLabelText(text: string | RegExp): HTMLElement | null;
  queryByRole(role: string, options?: { name?: string | RegExp }): HTMLElement | null;
  queryByText(text: string | RegExp): HTMLElement | null;
  root(): HTMLElement;
};

declare const user: {
  click(element: HTMLElement): Promise<void>;
  keyboard(value: string): Promise<void>;
  tab(options?: { shift?: boolean }): Promise<void>;
  type(element: HTMLInputElement | HTMLElement, text: string): Promise<void>;
};

declare function expect(actual: unknown): {
  toBeDisabled(): void;
  toBeInTheDocument(): void;
  toBeVisible(): void;
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toHaveAttribute(name: string, value?: string): void;
  toHaveFocus(): void;
  toHaveTextContent(expected: RegExp | string): void;
  toHaveValue(expected: unknown): void;
  toContain(expected: unknown): void;
  toMatch(expected: RegExp | string): void;
  toHaveLength(expected: number): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  not: {
    toBeDisabled(): void;
    toBeInTheDocument(): void;
    toBeVisible(): void;
    toContain(expected: unknown): void;
    toMatch(expected: RegExp | string): void;
    toBe(expected: unknown): void;
    toHaveAttribute(name: string, value?: string): void;
    toHaveFocus(): void;
    toHaveTextContent(expected: RegExp | string): void;
    toHaveValue(expected: unknown): void;
  };
};
