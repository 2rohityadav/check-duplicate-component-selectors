# check-duplicate-component-selectors

A command-line tool to detect duplicate component selectors in your frontend projects. While it works with any framework that uses component selectors, it's particularly useful for Angular, Web Components, and similar frameworks.

[![Coverage](https://codecov.io/gh/2rohityadav/check-duplicate-component-selectors/graph/badge.svg?token=QMW415ZMD9)](https://codecov.io/gh/2rohityadav/check-duplicate-component-selectors)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](./coverage/index.html)
[![npm](https://img.shields.io/npm/dt/check-duplicate-component-selectors)](https://www.npmjs.com/package/check-duplicate-component-selectors)
[![Package Size](https://img.shields.io/badge/Package%20Size-5.4%20kB-blue)](https://www.npmjs.com/package/check-duplicate-component-selectors)
[![Bundle size](https://pkg-size.dev/badge/bundle/3571)](https://pkg-size.dev/check-duplicate-component-selectors)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- ✨ Scans multiple directories for component files
- 🔍 Detects duplicate selectors across your codebase
- 📊 Provides detailed reports with file locations
- 🎨 Colorized output for better readability
- 🛠 Configurable component file suffix
- 📈 Shows summary statistics

## Installation

```bash
# Using npm
npm install -g check-duplicate-component-selectors

# Using pnpm
pnpm add -g check-duplicate-component-selectors

# Using yarn
yarn global add check-duplicate-component-selectors
```

## Quick Start

```bash
# Basic usage
check-duplicate-component-selectors "src/app;libs"
# OR
cdcs "src/app;libs"

# With custom suffix
check-duplicate-component-selectors "src/app" --suffix ".component.js"
# OR
cdcs "src/app" --suffix ".component.js"
```

## Documentation

- [CLI Usage Guide](docs/CLI.md)
- [API Reference](docs/API.md)
- [Examples With CI/CD integration](docs/EXAMPLES.md)
- [Contributing](docs/CONTRIBUTING.md)

## Basic Example

Add to your package.json:
```json
{
  "scripts": {
    "check-selectors": "check-duplicate-component-selectors \"src/app;libs\""
  }
}
```

Then run:
```bash
npm run check-selectors
# OR
npm run cdcs-check
```

### Command Line Options

- `-s, --suffix <suffix>`: Specify the component file suffix (default: `.component.ts`)
- `-v, --version`: Show version number
- `-h, --help`: Show help

## Exit Codes

- `0`: No duplicates found (success)
- `1`: Duplicates found or error occurred
  - Use `|| true` in npm scripts to ignore failures
  - Useful for CI/CD to catch selector conflicts

## Supported File Types

By default, the tool looks for files with the `.component.ts` extension, but you can configure this using the `--suffix` option to support other file types.

## Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/2rohityadav/check-duplicate-component-selectors/blob/main/docs/CONTRIBUTING.md) for details.

## License

MIT

## Author

[__rohityadav](https://www.npmjs.com/~__rohityadav)
