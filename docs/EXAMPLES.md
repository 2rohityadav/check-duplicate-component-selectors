# Usage Examples

## Command Line Examples
```bash
# Check a single directory
check-duplicate-component-selectors "src/app"

# Check multiple directories
check-duplicate-component-selectors "apps/web-app;apps/admin-app;libs"

# With custom suffix
check-duplicate-component-selectors "src/app" --suffix ".component.js"
```

## Programmatic Usage
```typescript
import { SelectorChecker } from "check-duplicate-component-selectors";

async function checkForDuplicates() {
  const checker = new SelectorChecker({
    componentSuffix: ".component.ts", // optional
  });

  const results = await checker.check({
    paths: ["src/app", "libs"],
  });

  if (results.length > 0) {
    console.log("Found duplicate selectors:", results);
    process.exit(1);
  }
}
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Release

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Check selectors
        run: check-duplicate-component-selectors "src/app;libs"
```

### GitLab CI/CD
```yaml
stages:
  - test

check-selectors:
  stage: test
  image: node:lts
  before_script:
    - npm install -g pnpm
    - pnpm config set store-dir .pnpm-store
  script:
    - pnpm install
    - pnpm add -g check-duplicate-component-selectors
    - check-duplicate-component-selectors "src/app;libs"
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - .pnpm-store
      - node_modules/
  rules:
    - if: $CI_PIPELINE_SOURCE == "push"
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

## Output Examples

### No Duplicates Found
```
🚀 Starting duplicate selectors check...

🔍 Checking duplicates in: src/components
✅ No duplicate selectors found in src/components (45 files checked)

🏁 Duplicate selector check complete.
```

### Duplicates Found
```
🚀 Starting duplicate selectors check...

🔍 Checking duplicates in: libs

⚠️ Duplicate selectors found in libs!

📂 Duplicate Selector: "app-user-profile"

🔍 Instance 1
File: user-profile.component.ts
Path: libs/shared/components/user-profile/user-profile.component.ts

🔍 Instance 2
File: user-profile.component.ts
Path: libs/admin/components/user-profile/user-profile.component.ts
────────────────────────────────────────────────────────────────────────────────────────────────────

📊 Summary:
- "app-user-profile": 2 instances found

🏁 Duplicate selector check complete.
```

## Package.json Integration
```json
{
  "scripts": {
    "check": "check-duplicate-component-selectors \"src/app;libs\"",
    "precommit": "check-duplicate-component-selectors \"src/app;libs\"",
    "ci-check": "check-duplicate-component-selectors \"src/app;libs\" || true"
  }
}
```
