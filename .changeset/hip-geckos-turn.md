---
'verdaccio-aws-s3-storage': minor
---

set ACL of tarball files

### Specify ACL of Tarball Files

You can specify ACL of tarball files in S3 by the _tarballACL_ configuration, set to 'private' by default. To enable S3 integrated CDN service (Amazon CloudFront for example), set _tarballACL_ to 'public-read' to grant tarball files anonymous read permission.

```yaml
store:
  aws-s3-storage:
    tarballACL: public-read
```
