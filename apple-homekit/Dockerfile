FROM node:12-alpine

ARG NODE_ENV
WORKDIR /usr/src/app
COPY package.json ./
RUN npm i --quiet
COPY . .

RUN apk add --no-cache bash vim curl iputils

# USER node
EXPOSE 5353 51826 51827

CMD ["start"]
ENTRYPOINT ["npm"]
