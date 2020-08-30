FROM node:14-slim AS builder
RUN apt-get update
RUN apt-get install python make g++ git -y
WORKDIR /img
COPY . .
RUN npm clean-install
# RUN npm test
RUN npm run build
RUN npm prune --production

FROM node:14-alpine
WORKDIR /img
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=80
COPY --from=builder ./img .
CMD node ace migration:run --force && \
    node ace seed --files ProductionSeeder.js --force && \
    npm start
