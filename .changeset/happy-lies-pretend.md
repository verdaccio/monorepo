---
'@verdaccio/readme': minor
---

Added optional options object param to parseReadme where {pathname: string} can define the pathname to use when resolving anchor links by pre-padding the pathname to the anchor link.
Helps to resolve verdaccio/verdaccio#2712
