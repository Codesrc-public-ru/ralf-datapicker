declare const dp: {
  read(relativePath: string): string;
  exists(relativePath: string): boolean;
  relative(absolutePath: string): string;
  list(relativePath: string): string[];
};

declare function describe(name: string, fn: () => void): void;
declare function test(name: string, fn: () => void | Promise<void>): void;

declare namespace test {
  function skip(name: string, fn: () => void): void;
}

declare function expect(actual: unknown): {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toContain(expected: unknown): void;
  toMatch(expected: RegExp | string): void;
  toHaveLength(expected: number): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  not: {
    toContain(expected: unknown): void;
    toMatch(expected: RegExp | string): void;
    toBe(expected: unknown): void;
  };
};
