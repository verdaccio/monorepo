FROM verdaccio/verdaccio:5

USER root

ENV NODE_ENV=production

RUN apk --no-cache add openssl ca-certificates wget && \
    apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python && \
    wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
    wget -q https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.25-r0/glibc-2.25-r0.apk && \
    apk add glibc-2.25-r0.apk

COPY . ./build/plugins/aws-s3-storage/

RUN npm i && npm install ./build/plugins/aws-s3-storage/
USER verdaccio
