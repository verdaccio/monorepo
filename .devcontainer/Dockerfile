# Verdaccio Monorepo VSCode DevContainer image
#
# To use Node Alpine image in VSCode DevContainers we need to add bash and git.
# Also, as there are some dependencies that uses node-gyp, we have to add
# support for it with tools like python, make and g++.

FROM node:alpine

ARG USER_UID=1000
ARG USER_GID=$USER_UID
ARG USERNAME=node
RUN if [ "$USER_GID" != "1000" ] || [ "$USER_UID" != "1000" ]; then \
        groupmod --gid $USER_GID $USERNAME \
        && usermod --uid $USER_UID --gid $USER_GID $USERNAME \
        && chown -R $USER_UID:$USER_GID /home/$USERNAME; \
    fi

RUN apk add --no-cache \
    bash git \
    g++ make python

USER $USER_UID
