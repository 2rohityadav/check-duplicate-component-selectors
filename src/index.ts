import { promises as fs } from "fs";
import path from "path";
import { red, yellow } from "colorette";

export interface SelectorCheckResult {
  selector: string;
  instances: string[];
}

export interface CheckOptions {
  paths: string[];
  componentSuffix?: string;
  selectorRegex?: RegExp;
}

export class SelectorChecker {
  private static readonly DEFAULT_SELECTOR_REGEX =
    /selector:\s*['"]([^'"]+)['"]/;
  private static readonly BATCH_SIZE = 50;
  private readonly componentSuffix: string;
  private readonly selectorRegex: RegExp;

  constructor(options?: Partial<CheckOptions>) {
    this.componentSuffix = options?.componentSuffix || ".component.ts";
    this.selectorRegex =
      options?.selectorRegex || SelectorChecker.DEFAULT_SELECTOR_REGEX;
  }

  private async findComponentFiles(dir: string): Promise<string[]> {
    const results: string[] = [];
    const queue: string[] = [dir];

    while (queue.length) {
      const batch = queue.splice(0, SelectorChecker.BATCH_SIZE);
      await Promise.all(
        batch.map(async (directory) => {
          try {
            const files = await fs.readdir(directory);
            const stats = await Promise.all(
              files.map(async (file) => {
                const filePath = path.join(directory, file);
                return {
                  path: filePath,
                  stat: await fs.stat(filePath),
                };
              })
            );

            for (const { path: filePath, stat } of stats) {
              if (stat.isDirectory()) {
                queue.push(filePath);
              } else if (
                path.basename(filePath).endsWith(this.componentSuffix)
              ) {
                results.push(filePath);
              }
            }
          } catch (error) {
            console.error(red(`Error reading directory ${directory}:`), error);
          }
        })
      );
    }

    return results;
  }

  private async processFiles(files: string[]): Promise<Map<string, string[]>> {
    const selectorMap = new Map<string, string>();
    const duplicates = new Map<string, string[]>();

    await Promise.all(
      files.map(async (file) => {
        try {
          const content = await fs.readFile(file, "utf8");
          const match = this.selectorRegex.exec(content);
          if (!match) return;

          const selector = match[1];
          if (!selector) return;

          if (selectorMap.has(selector)) {
            const existing = duplicates.get(selector);
            if (existing) {
              existing.push(file);
            } else {
              duplicates.set(selector, [selectorMap.get(selector)!, file]);
            }
          } else {
            selectorMap.set(selector, file);
          }
        } catch (error) {
          console.error(red(`Error reading file ${file}:`), error);
        }
      })
    );

    // Clean up memory
    selectorMap.clear();
    return duplicates;
  }

  public async check(options: CheckOptions): Promise<SelectorCheckResult[]> {
    const results = new Map<string, string[]>();

    for (const appPath of options.paths) {
      try {
        await fs.access(appPath);
      } catch {
        console.warn(yellow(`⚠️ Path not found: ${appPath}`));
        continue;
      }

      const files = await this.findComponentFiles(appPath);
      if (!files.length) {
        console.warn(yellow(`⚠️ No component files found in ${appPath}`));
        continue;
      }

      const duplicates = await this.processFiles(files);
      for (const [selector, instances] of duplicates) {
        const existing = results.get(selector);
        if (existing) {
          existing.push(...instances);
        } else {
          results.set(selector, instances);
        }
      }
    }

    return Array.from(results.entries()).map(([selector, instances]) => ({
      selector,
      instances: instances.map((instance) =>
        path.relative(process.cwd(), instance)
      ),
    }));
  }

  public async getFileCount(dir: string): Promise<number> {
    const files = await this.findComponentFiles(dir);
    return files.length;
  }
}
