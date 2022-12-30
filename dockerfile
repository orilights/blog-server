FROM node:16
COPY ./dist /app/dist
COPY ./prisma /app/prisma
COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock
WORKDIR /app

ARG DATABASE_URL
ARG JWT_SECRET

ENV DATABASE_URL $DATABASE_URL
ENV JWT_SECRET $JWT_SECRET

RUN yarn config set registry https://registry.npmmirror.com
RUN yarn --production --silent
RUN yarn prisma generate

EXPOSE 3000

CMD ["node","dist/src/main.js"]