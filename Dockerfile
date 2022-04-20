FROM node:16.14.2-alpine
WORKDIR /atlas
COPY package.json yarn.lock ./
RUN yarn install
COPY . ./
EXPOSE 3000
CMD ["node", "./src/app.js"]
