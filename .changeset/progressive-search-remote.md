---
'@verdaccio/local-storage-legacy': minor
'@verdaccio/local-storage': patch
'@verdaccio/file-locking': patch
'@verdaccio/streams': patch
'verdaccio-auth-memory': patch
'verdaccio-memory': patch
---

feat: add promise-based search API with optional remote uplink search

- Added `searchAsync(query)` method returning `Promise<SearchItem[]>` for modern search consumers
- Added `searchWithUplinks(query)` that merges local and remote registry results via `/-/v1/search`
- Remote search is opt-in via `remoteSearch: true` plugin configuration
- Legacy callback-based `search()` method remains unchanged for Verdaccio 6.x compatibility
- Migrated all packages from Babel + Jest to Vite 8 + Vitest (CJS output)
- Removed babel entirely from the monorepo
