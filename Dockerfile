FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --production

# Bundle app source
RUN mkdir -p /usr/src/app/server
COPY ./server /usr/src/app/server

RUN mkdir -p /usr/src/app/public
COPY ./public /usr/src/app/public

EXPOSE 4848
CMD [ "npm", "start" ]

