# Verdaccio Monorepo

This monorepo contains all the packages that compose the Verdaccio 6.x architecture, except for [Verdaccio](https://github.com/verdaccio/verdaccio) itself and the [UI](https://github.com/verdaccio/ui).

## Packages

### Core

| Package | Description |
|---------|-------------|
| `@verdaccio/file-locking` | File locking utilities |
| `@verdaccio/streams` | Stream extensions |
| `@verdaccio/legacy-types` | Legacy type definitions (deprecated) |

### Plugins

| Package | Description |
|---------|-------------|
| `@verdaccio/local-storage-legacy` | Local filesystem storage |
| `@verdaccio/local-storage` | Local storage (modern) |
| `verdaccio-auth-memory` | In-memory authentication |
| `verdaccio-memory` | In-memory storage |

### Tools

| Package | Description |
|---------|-------------|
| `@verdaccio/eslint-config` | Shared ESLint configuration |
| `eslint-plugin-verdaccio` | Custom ESLint rules |

## Development

### Prerequisites

- Node.js >= 18
- pnpm 9.x

### Setup

```bash
pnpm install
```

### Build

```bash
pnpm -w run build
```

### Test

```bash
# Unit tests
pnpm -w run test

# E2E tests (requires build first)
pnpm -w run build && pnpm -w run test:e2e
```

### Lint

```bash
pnpm -w run lint
```

### E2E Tests

E2E tests live in `e2e/` and run against a real Verdaccio 6.5.2 instance with workspace plugin overrides via pnpm.

```bash
# Run all E2E suites
pnpm -w run test:e2e

# Run a specific suite
pnpm --filter @verdaccio/e2e-local-storage-legacy test
pnpm --filter @verdaccio/e2e-auth-memory test
```

## Contributing

Please refer to our [CONTRIBUTING](CONTRIBUTING.md) guide to learn how to contribute.

## License

Verdaccio Monorepo is an open-source project licensed under the [MIT license](LICENSE).
