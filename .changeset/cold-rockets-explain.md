---
'verdaccio-htpasswd': minor
---

Eliminating all synchronous calls to bcrypt library.

Change and update password routines are now fully asynchronous when using bcrypt (which is important, since bcrypt is slow).
