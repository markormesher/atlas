FROM node:carbon

WORKDIR /usr/src/app

# dependencies
COPY package.json ./
RUN npm i
RUN git clone https://github.com/vishnubob/wait-for-it.git

# source code
COPY . .

# run
EXPOSE 3000
CMD ["node", "./app.js"]
