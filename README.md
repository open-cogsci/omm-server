# omm

> OpenMonkeyMind

## Build Setup

``` bash
# install dependencies
$ npm ci (or `npm install` if that fails)

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## The adonis-cli tool

Many aspects of the server can easily be managed or configured by using the adonis-cli tool.
To install it, execute the follwing command in your terminal:

```
npm i -g @adonisjs/cli
```

This installs the adonis tool in you global namespace (making it available regardless of the current
working directory of you terminal). If succesfully installed, you should be presented with a list
of available commands when entering `adonis` in your terminal.

## Initializing the database

A snapshot of the development SQLite database is included in the repository. Nevertheless, if you
would like to start fresh you can do so easily using the Adonis CLI tool. If you execute

```
adonis migration:refresh
```

all database tables are dropped and recreated from scratch. To populate them with some initial data you can
use the

```
adonis seed
```

command. This will insert the data specified in the seed files under `database/seeds`.

> Note: the process may hang after this operation forcing you to quit it with ctrl-c, but it will
> likely have succeeded.

## Running tests

Tests are implemented on the frontend with [Jest](https://jestjs.io/) and for the backend using _TBD_.
Tests can be run with the command `npm test`.

## Built on the shoulders of giants

This project uses prominent open-source frameworks and libraries:

### Frontend

- [Vue](https://vuejs.org): Progressive JavaScript component framework.
  - [Vuetify](https://vuetifyjs.com): Material Design Components for Vue.
- [Vuex](https://vuex.vuejs.org/guide/): State management system.
  - [Vuex-ORM](https://vuex-orm.org/): ORM system for Vuex.
- [Nuxt](https://nuxtjs.org/): Frontend framework that makes wiring different Vue components easier.
  - [Axios for Nuxt](https://axios.nuxtjs.org/): Axios module for Nuxt
  - [Auth for Nuxt](https://auth.nuxtjs.org/): Authentication module for Nuxt.

### Backend

- [Adonis](https://adonisjs.com/): MVC and REST API framework based on Laravel.
  - [Bumblebee](https://github.com/rhwilr/adonis-bumblebee): Data serializer for structured json responses.
  - [Adonis-swagger](https://github.com/ahmadarif/adonis-swagger): Easy swagger documentation with Adonis.

