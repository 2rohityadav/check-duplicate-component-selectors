# API Reference

## Programmatic Usage

You can use the checker programmatically in your Node.js scripts:

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

## API Options

### SelectorChecker Constructor

```typescript
interface CheckerOptions {
  componentSuffix?: string;  // Default: ".component.ts"
}

class SelectorChecker {
  constructor(options?: CheckerOptions);
}
```

### Check Method

```typescript
interface CheckResult {
  selector: string;
  instances: string[];
}

interface CheckOptions {
  paths: string[];
}

class SelectorChecker {
  async check(options: CheckOptions): Promise<CheckResult[]>;
}
```

## Return Format

```typescript
// Example return value
[
  {
    selector: "app-user-profile",
    instances: [
      "libs/shared/components/user-profile/user-profile.component.ts",
      "libs/admin/components/user-profile/user-profile.component.ts"
    ]
  }
]
```
