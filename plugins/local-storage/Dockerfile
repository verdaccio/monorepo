FROM node:10.15.1-alpine
RUN mkdir /srv/github-actions-app
WORKDIR /srv/github-actions-app
COPY . .
RUN yarn install --production=false && yarn build && yarn test 
