FROM node:carbon

WORKDIR /usr/src/app

# dependencies
COPY package.json .npmrc ./
RUN npm i
RUN git -c http.sslVerify=false clone https://github.com/vishnubob/wait-for-it.git

# source code
COPY . .

# run
EXPOSE 3000
CMD ["node", "./app.js"]
