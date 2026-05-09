---
'@verdaccio/eslint-config': minor
---

Make optional peer plugins (`eslint-plugin-cypress`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-verdaccio`, `@vitest/eslint-plugin`) load lazily via dynamic `import()`. Previously they were declared as optional peerDependencies but imported statically, so the config failed to load if any one was missing. Now consumers can install only the plugins they need; configs whose plugins aren't installed export an empty array.
