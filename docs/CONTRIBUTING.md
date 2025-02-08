# Contributing Guide

Thank you for considering contributing to check-duplicate-component-selectors! This document provides guidelines for contributions.

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/2rohityadav/check-duplicate-component-selectors.git
cd check-duplicate-component-selectors
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the project:
```bash
pnpm run build
```

4. Run tests:
```bash
pnpm test
```

## Commit Guidelines

We use conventional commits for version management. Please format your commit messages as follows:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature (minor version)
- `fix`: Bug fix (patch version)
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code changes (no functionality change)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Pull Request Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## Code Style

- Use TypeScript
- Follow ESLint rules
- Maintain test coverage (minimum 95%)
- Document public APIs
- Add tests for new features