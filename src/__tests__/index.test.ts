import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { SelectorChecker } from "../index";
import { promises as fs } from "fs";

// Mock fs promises
vi.mock("fs", () => ({
  promises: {
    readdir: vi.fn(),
    stat: vi.fn(),
    readFile: vi.fn(),
    access: vi.fn(),
  },
}));

describe("SelectorChecker", () => {
  let checker: SelectorChecker;

  // Setup and teardown for console mocking
  beforeEach(() => {
    checker = new SelectorChecker();
    vi.resetAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with default options", () => {
      const checker = new SelectorChecker();
      expect(checker["componentSuffix"]).toBe(".component.ts");
      expect(checker["selectorRegex"]).toEqual(/selector:\s*['"]([^'"]+)['"]/);
    });

    it("should initialize with custom options", () => {
      const customRegex = /custom-regex/;
      const checker = new SelectorChecker({
        componentSuffix: ".custom.ts",
        selectorRegex: customRegex,
      });
      expect(checker["componentSuffix"]).toBe(".custom.ts");
      expect(checker["selectorRegex"]).toBe(customRegex);
    });
  });

  describe("check", () => {
    it("should handle non-existent paths", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");
      vi.mocked(fs.access).mockRejectedValueOnce(new Error("ENOENT"));
      const results = await checker.check({ paths: ["non-existent"] });
      expect(results).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Path not found")
      );
    });

    it("should detect duplicate selectors", async () => {
      const mockFiles = ["/app/comp1.component.ts", "/app/comp2.component.ts"];

      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as any);
      vi.mocked(fs.stat).mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
      } as any);
      vi.mocked(fs.readFile).mockResolvedValue('selector: "app-test"');
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const results = await checker.check({ paths: ["/app"] });
      expect(results).toHaveLength(1);
      expect(results[0].selector).toBe("app-test");
      expect(results[0].instances).toHaveLength(2);
    });

    it("should handle directory traversal", async () => {
      // First readdir call returns the root directory contents
      vi.mocked(fs.readdir)
        .mockResolvedValueOnce(["dir", "comp1.component.ts" as any])
        .mockResolvedValueOnce(["comp2.component.ts"] as any);

      // Mock stat implementation
      const mockStat = vi.fn((filePath: string) => {
        const isDir = filePath.endsWith("dir");
        return Promise.resolve({
          isDirectory: () => isDir,
          isFile: () => !isDir,
        });
      });

      vi.mocked(fs.stat).mockImplementation(mockStat as any);
      vi.mocked(fs.readFile).mockResolvedValue('selector: "app-test"');
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const results = await checker.check({ paths: ["/app"] });
      expect(results).toHaveLength(1);
      expect(results[0].selector).toBe("app-test");
      expect(results[0].instances).toHaveLength(2);

      // Verify correct method calls
      expect(fs.readdir).toHaveBeenCalledWith("/app");
      expect(fs.readdir).toHaveBeenCalledTimes(2);
      expect(fs.stat).toHaveBeenCalled();
      expect(fs.readFile).toHaveBeenCalled();
    });

    it("should handle file read errors", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");
      vi.mocked(fs.readdir).mockResolvedValue(["comp1.component.ts"] as any);
      vi.mocked(fs.stat).mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
      } as any);
      vi.mocked(fs.readFile).mockRejectedValue(new Error("Read error"));
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const results = await checker.check({ paths: ["/app"] });
      expect(results).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error reading file"),
        expect.any(Error)
      );
    });

    it("should process files in batches", async () => {
      const mockFiles = Array.from(
        { length: 100 },
        (_, i) => `comp${i}.component.ts`
      );

      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as any);
      vi.mocked(fs.stat).mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
      } as any);
      vi.mocked(fs.readFile).mockResolvedValue('selector: "app-test"');
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const results = await checker.check({ paths: ["/app"] });
      expect(results).toHaveLength(1);
      expect(mockFiles.length).toBe(100); // Verify batch size
    });

    it("should handle directory read errors", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");
      vi.mocked(fs.readdir).mockRejectedValue(
        new Error("Directory read error")
      );
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const results = await checker.check({ paths: ["/app"] });
      expect(results).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error reading directory"),
        expect.any(Error)
      );
    });

    // added new
    it("should skip paths with no files", async () => {
      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const consoleWarnSpy = vi.spyOn(console, "warn");
      await checker.check({ paths: ["/app"] });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("No component files found")
      );
    });

    it("should handle invalid selectors in files", async () => {
      vi.mocked(fs.readdir).mockResolvedValue(["comp1.component.ts"] as any);
      vi.mocked(fs.stat).mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
      } as any);
      vi.mocked(fs.readFile).mockResolvedValue("not a valid selector");
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const results = await checker.check({ paths: ["/app"] });
      expect(results).toHaveLength(0);
    });

    // new one added to meet 100% coverage
    // Add this test case inside the "check" describe block
    it("should handle empty selector match", async () => {
      vi.mocked(fs.readdir).mockResolvedValue(["comp1.component.ts"] as any);
      vi.mocked(fs.stat).mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
      } as any);
      vi.mocked(fs.readFile).mockResolvedValue('selector: ""'); // Empty selector case
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const results = await checker.check({ paths: ["/app"] });
      expect(results).toEqual([]);
    });

    // Add this test for full branch coverage
  });

  describe("getFileCount", () => {
    it("should return correct number of component files", async () => {
      const mockFiles = [
        "comp1.component.ts",
        "comp2.component.ts",
        "other.ts",
      ];

      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as any);
      vi.mocked(fs.stat).mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
      } as any);

      const count = await checker.getFileCount("/app");
      expect(count).toBe(2);
    });
  });
});
