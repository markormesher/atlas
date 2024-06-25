FROM node:20.15.0-alpine@sha256:5361a6c5486c8ffed7d84727f0ce7f8cb7c530d3a6476bf0741b34663f599a0c
WORKDIR /atlas
COPY package.json yarn.lock ./
RUN yarn install
COPY . ./
EXPOSE 3000
CMD ["node", "./src/app.js"]
