FROM node:16

ARG DATABASE_URL
ARG JWT_SECRET

ENV DATABASE_URL $DATABASE_URL
ENV JWT_SECRET $JWT_SECRET

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

WORKDIR /app
RUN yarn config set registry https://registry.npmmirror.com
RUN yarn --production --silent

COPY ./prisma /app/prisma
COPY ./dist /app/dist
RUN yarn prisma generate

EXPOSE 3000

CMD ["node","dist/src/main.js"]