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

## API documentation with swagger

The API endpoints are documented using [Swagger UI](https://swagger.io/tools/swagger-ui/). This makes the documentation dynamic and interactive.
Once the dev server is started with `npm run dev`, the documentation will be available at <http://localhost:3000/docs>.

Some endpoints are protected and require a logged in user to function correctly.
These endpoints are indicated by a lock icon at the right side of their entry. To access
these endpoints from swagger, you need to provide it with a JWT token first. This process is a bit
cumbersome, and needs to be performed after each refresh of Swagger UI (as it is stateless).

To retrieve the JWT token, first login as usual at <http://localhost:3000/login>. If you are already logged in,
you will be redirected to the dashboard right away. Next, open the Chrome (or your browser's) dev console
(`ctrl+shift+i` on non Macs, and `option+cmd+J` on Macs) and navigate to the network tab.
To filter out irrelevant requests, make sure XHR is selected in the third tab bar from the top.
In the left column, select a request which contains the path `/api/v1`. In the panel that opens, go to
**Request Headers**, and find the entry labelled _Authorization_. This will contain a value starting with
`Bearer ...`. Copy the whole line, including `Bearer` to your clipboard.

![Finding bearer token](/docs/retrieveToken.png)

Next in Swagger-UI at <http://localhost:3000/docs>, click on the button authorize at the top-right.

![Click Authorize](/docs/clickAuthorize.png)

Finally, paste your copied `Bearer XXXXX` string into the `Value` field and click *Authorize*.

![Enter token](/docs/enterToken.png)

You should now be able to access the protected endpoints.

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

