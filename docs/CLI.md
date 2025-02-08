# CLI Documentation

## Basic Usage

```bash
check-duplicate-component-selectors "path/to/app;another/path"
```

## Command Line Options

- `-s, --suffix <suffix>`: Specify the component file suffix (default: `.component.ts`)
- `-v, --version`: Show version number
- `-h, --help`: Show help information

## Examples

### Single Directory
```bash
check-duplicate-component-selectors "src/app"
```

### Multiple Directories
```bash
check-duplicate-component-selectors "src/app;libs/shared"
```

### Custom File Suffix
```bash
check-duplicate-component-selectors "src/app" --suffix ".component.js"
```

## Exit Codes

- `0`: No duplicates found (success)
- `1`: Duplicates found or error occurred

### Handling Exit Codes in Scripts

To ignore failures in npm scripts:

```json
{
  "scripts": {
    "check-selectors": "check-duplicate-component-selectors \"src/app;libs\" || true"
  }
}
