FROM node:20.15.0-alpine@sha256:df01469346db2bf1cfc1f7261aeab86b2960efa840fe2bd46d83ff339f463665
WORKDIR /atlas
COPY package.json yarn.lock ./
RUN yarn install
COPY . ./
EXPOSE 3000
CMD ["node", "./src/app.js"]
