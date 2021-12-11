---
'@verdaccio/commons-api': minor
'@verdaccio/file-locking': minor
'@verdaccio/readme': minor
'@verdaccio/streams': minor
'@verdaccio/types': minor
'@verdaccio/active-directory': minor
'verdaccio-audit': minor
'verdaccio-auth-memory': minor
'verdaccio-aws-s3-storage': minor
'verdaccio-google-cloud': minor
'verdaccio-htpasswd': minor
'@verdaccio/local-storage': minor
'verdaccio-memory': minor
---

feat: remove core-js from bundle

By using babel.js core-js injects some requires that are not necessarily dependencies and fails on pnpm and yarn 2 due are strict. No need to add this feature so is removed.

- https://babeljs.io/docs/en/babel-preset-env#usebuiltins
