FROM node:14-slim AS builder
RUN apt-get update
RUN apt-get install python make g++ git -y
WORKDIR /img
COPY . .
RUN npm clean-install
ENV ENV_SILENT=true
ENV APP_KEY=2wsjLSopTjD6WQEztTYIZgCFou8wpLJn
# RUN npm test
RUN npm run build
RUN npm prune --production

FROM node:14-alpine
WORKDIR /img
ENV ENV_SILENT=true
ENV NODE_ENV=production
COPY --from=builder ./img .
CMD node ace migration:run --force && \
    node ace seed --files ProductionSeeder.js --force && \
    npm start
