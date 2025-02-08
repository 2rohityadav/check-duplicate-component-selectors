import { describe, it, expect, beforeEach, vi } from "vitest";
import packageJson from "../../package.json";

// Create mock instance type
type MockSelectorChecker = {
  check: ReturnType<typeof vi.fn>;
  getFileCount: ReturnType<typeof vi.fn>;
};

// Mock process.exit
const mockExit = vi
  .spyOn(process, "exit")
  .mockImplementation(() => undefined as never);

// Mock console methods
const mockConsoleLog = vi
  .spyOn(console, "log")
  .mockImplementation(() => undefined);
const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => undefined);

// Create mock instance
const mockCheckerInstance: MockSelectorChecker = {
  check: vi.fn().mockResolvedValue([]),
  getFileCount: vi.fn().mockResolvedValue(0),
};

const mockConsoleWarn = vi
  .spyOn(console, "warn")
  .mockImplementation(() => undefined);

// Mock the SelectorChecker class
vi.mock("../index", () => ({
  SelectorChecker: vi.fn().mockImplementation(() => mockCheckerInstance),
}));

describe("CLI", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.argv = ["node", "cli.js"];
    mockCheckerInstance.check.mockReset().mockResolvedValue([]);
    mockCheckerInstance.getFileCount.mockReset().mockResolvedValue(0);
  });

  it("should show help when -h flag is used", async () => {
    process.argv.push("-h");
    await import("../cli");
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("USAGE:")
    );
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it("should show version when -v flag is used", async () => {
    process.argv.push("-v");
    await import("../cli");
    expect(mockConsoleLog).toHaveBeenCalled();
    expect(mockConsoleLog.mock.calls[0][0]).toMatch(/^\d+\.\d+\.\d+(-.*)?$/);
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it("should error when no paths provided", async () => {
    await import("../cli");
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("Error: Paths argument is required")
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("should handle custom suffix option", async () => {
    process.argv.push("src", "-s", ".custom.ts");
    const { SelectorChecker } = await import("../index");
    await import("../cli");

    expect(SelectorChecker).toHaveBeenCalledWith({
      componentSuffix: ".custom.ts",
    });
  });

  it("should handle multiple paths", async () => {
    process.argv.push("apps/web;libs/shared");
    await import("../cli");

    expect(mockCheckerInstance.check).toHaveBeenCalledWith({
      paths: ["apps/web"],
    });

    expect(mockCheckerInstance.getFileCount).toHaveBeenCalled();
  });

  it("should handle check errors", async () => {
    process.argv.push("src");
    mockCheckerInstance.check.mockRejectedValueOnce(new Error("Test error"));

    await import("../cli");

    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("An error occurred"),
      expect.any(Error)
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("should display summary when duplicates found", async () => {
    process.argv.push("src");
    mockCheckerInstance.check.mockResolvedValue([
      {
        selector: "test-selector",
        instances: ["path1", "path2"],
      },
    ]);

    await import("../cli");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Summary:")
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  // added new
  it("should handle ENOENT errors", async () => {
    process.argv.push("apps/web");
    const error = new Error("Path not found");
    (error as any).code = "ENOENT";
    mockCheckerInstance.check.mockRejectedValueOnce(error);

    await import("../cli");

    expect(mockConsoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("⚠️ Path not found")
    );
  });
  it("should handle paths with no component files", async () => {
    process.argv.push("apps/web");
    mockCheckerInstance.check.mockResolvedValueOnce([]);
    mockCheckerInstance.getFileCount.mockResolvedValueOnce(0);

    await import("../cli");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("No duplicate selectors found")
    );
  });

  it("should handle all paths in semicolon separated list", async () => {
    process.argv.push("apps/web;libs/shared;apps/mobile");
    await import("../cli");

    expect(mockCheckerInstance.check).toHaveBeenCalledWith(
      expect.objectContaining({
        paths: expect.arrayContaining([
          "apps/web",
          "libs/shared",
          "apps/mobile",
        ]),
      })
    );
  });
});
