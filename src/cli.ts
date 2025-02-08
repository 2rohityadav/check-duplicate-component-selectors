#!/usr/bin/env node

import { blue, yellow, cyan, white, gray, green, red } from "colorette";
import path from "path";
import { SelectorChecker } from "./index.js";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(path.join(__dirname, "../package.json"), "utf-8")
);
const VERSION = packageJson.version;

function printHelp(): void {
  console.log(`
${white("check-duplicate-component-selectors")} v${VERSION}
${gray("A tool to check for duplicate component selectors across your project")}

${white("USAGE:")}
  check-duplicate-component-selectors <paths> [options]

${white("ARGUMENTS:")}
  paths        Paths to check, separated by semicolons (e.g., "apps/web-app;libs")

${white("OPTIONS:")}
  -s, --suffix <suffix>  Component file suffix (default: ".component.ts")
  -h, --help            Show this help message
  -v, --version         Show version number
`);
}

async function main() {
  const args = process.argv.slice(2);

  // Handle help and version flags
  if (args.includes("-h") || args.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  if (args.includes("-v") || args.includes("--version")) {
    console.log(VERSION);
    process.exit(0);
  }

  // Get paths argument
  const pathsArg = args.find((arg) => !arg.startsWith("-"));
  if (!pathsArg) {
    console.error(red("❌ Error: Paths argument is required"));
    printHelp();
    process.exit(1);
  }

  // Get suffix option
  let suffix = ".component.ts";
  const suffixIndex = args.findIndex(
    (arg) => arg === "-s" || arg === "--suffix"
  );
  if (suffixIndex !== -1 && args[suffixIndex + 1]) {
    suffix = args[suffixIndex + 1];
  }

  try {
    console.log(blue("🚀 Starting duplicate selectors check...\n"));

    const checker = new SelectorChecker({
      componentSuffix: suffix,
    });

    const pathsToCheck = pathsArg
      .split(";")
      .map((p) => p.trim())
      .filter(Boolean);

    for (const appPath of pathsToCheck) {
      console.log(blue(`🔍 Checking duplicates in: ${appPath}`));

      try {
        const results = await checker.check({ paths: [appPath] });

        if (results.length > 0) {
          console.log(
            yellow(`\n⚠️ Duplicate selectors found in ${appPath}!\n`)
          );

          results.forEach(({ selector, instances }) => {
            console.log(cyan(`\n📂 Duplicate Selector: "${selector}"`));

            instances.forEach((filePath, index) => {
              console.log(white(`\n🔍 Instance ${index + 1}`));
              console.log(white(`File: ${path.basename(filePath)}`));
              console.log(gray(`Path: ${filePath}`));
            });
            console.log("─".repeat(100));
          });
        } else {
          const filesCount = await checker.getFileCount(appPath);
          console.log(
            green(
              `✅ No duplicate selectors found in ${appPath} (${filesCount} files checked)`
            )
          );
        }
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "ENOENT"
        ) {
          console.warn(yellow(`⚠️ Path not found: ${appPath}`));
        } else {
          throw error;
        }
      }
    }

    // Collect all results for summary
    const allResults = await checker.check({ paths: pathsToCheck });

    if (allResults.length > 0) {
      console.log(yellow("\n📊 Summary:"));
      allResults.forEach(({ selector, instances }) => {
        console.log(
          white(`- "${selector}": ${instances.length} instances found`)
        );
      });
    }

    console.log(blue("\n🏁 Duplicate selector check complete."));

    // Exit with error code if duplicates found
    if (allResults.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(red("❌ An error occurred:"), error);
    process.exit(1);
  }
}

main();
