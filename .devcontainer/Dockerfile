# Verdaccio Monorepo VSCode DevContainer image
#
# To use Node Alpine image in VSCode DevContainers we need to add bash and git.
# Also, as there are some dependencies that uses node-gyp, we have to add
# support for it with tools like python, make and g++.

FROM node:alpine

RUN apk add --no-cache \
    bash git \
    g++ make python
