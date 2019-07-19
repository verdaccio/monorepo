FROM node:10.15.1-alpine
# Setup the working directory
RUN mkdir /srv/github-actions-app
WORKDIR /srv/github-actions-app
# Send over the dependency definitions to the container
COPY package.json yarn.lock ./
# Install the dependencies
RUN yarn install --production=false && yarn cache clean
# Copy the whitelisted files
COPY . .
# Run the tests
RUN yarn build && yarn test
