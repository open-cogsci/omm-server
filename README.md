# OpenMonkeyMind

*Server software*

## About

OpenMonkeyMind (OMM) allows OpenSesame experiments to be managed on a central server ([omm-server](https://github.com/open-cogsci/omm-server)) and deployed to computers running OpenSesame with the [omm-client](https://github.com/open-cogsci/omm-client) software installed. 


## Credits

© 2020 - 2021:

- Sebastiaan Mathôt (@smathot), University of Groningen, The Netherlands
- Daniel Schreij  (@dschreij)
- Joel Fagot (@joelfagot), CNRS and Aix-Marseille University, France
- Nicolas Claidère (@nclaidiere), CNRS and Aix-Marseille University, France
- Pascal Belin, Aix Marseille University, France

The development of Open Monkey Mind was supported by ERC Advanced grant COVOPRIM #78824

## Jump to

- [Running using docker](#running-using-docker)
- [Installing with npm](#installing-with-npm)
- [API documentation with swagget](#api-documentation-with-swagger)
- [Built on the shoulders of giants](#built-on-the-shoulders-of-giants)
- [License](#license)


## Running using docker

If you use Docker, it is really easy to get the server up and running:

### Download the server software

If you have `git` installed, you can simply clone the repository:

```
git clone https://github.com/open-cogsci/omm-server.git
```

### Install Docker

If you are using Windows, or MacOS, install docker desktop from https://www.docker.com/products/docker-desktop. In Linux you can use your favourite package manager to pull in the docker packages.
Refer to https://docs.docker.com/engine/install/ubuntu/ for instructions for this process.

Once this is done, you should have access to the docker commands from your terminal (Mac/Linux) of Powershell/Command (Windows)

### Start the Docker image

Navigate to the folder in which you placed the contents of omm-server (e.g. `cd /folder/to/omm-server`) and execute the command

```
docker-compose up -d
```

It may fail the first time because the first initialisation of the database takes a bit longer than usual. If so try executing the command again, or press the play/restart button for omm-server in the docker desktop dashboard.

After the docker-compose script has run for the first time, the entry for omm-server will stay in your Docker desktop dashboard, and the next time(s) you can simply start the server and database by pressing the button with the play icon behind the omm-server listing.


### Access the server

Open a browser and navigate to http://localhost:3000. You should now be able to play around with the omm-server. You can login with `admin@admin.com` and password `admin`


### Access account-verification email

Ideally, omm-server should be connected to a working mail server, so the account creation and management features work as designed. E-mails are for instace sent to a new user after an admin creates an account, or a user wants to reset his or her password. If such a connection to a mail server is not easily possible, the docker-compose setup comes with a built-in mail server which intercepts *all* e-mails that omm-server sends out. You can access the webmail interface of this mail server by going to http://localhost:3001 in your browser, once docker is running (the mail server also gets started when executing `docker-compose up`).

The mail server is currently configured to discard all emails after it is shut down, so every time you start up the server, you start with a completely empty and pristine mailbox. This is by design, as the built-in mail server is intended for testing purposes only, and not to be used as a real mail service.


## Installing with npm

This option is more suitable if you want to make changes to, or write code for omm-server itself. You will also need to make sure you have a database available and set it up so omm-server can access it. Needless to say, this is the more challenging and elaborate option to get the system running.

### Initial Setup

``` bash
# install dependencies
$ npm ci (or `npm install` if that fails)

# Start a dev server and serve with hot reload at localhost:3000
$ npm run dev
# Or
$ adonis serve

# build for production and launch server
$ npm run build
$ npm run start
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

### The adonis-cli tool

Many aspects of the server can easily be managed or configured by using the adonis-cli tool.
To install it, execute the follwing command in your terminal:

```
npm i -g @adonisjs/cli
```

This installs the adonis tool in you global namespace (making it available regardless of the current
working directory of you terminal). If succesfully installed, you should be presented with a list
of available commands when entering `adonis` in your terminal.

If you don't want to install adonis-cli globally, or do not have permission to do so, you can alternatively
access it using `npx`, e.g.

```
npx adonis <command>
```

or use the alternative cli tool that is included with the framework, but accepts the same parameters.

```
node ace <command>
```

### Initializing the database

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

Tests are implemented on the frontend with [Jest](https://jestjs.io/) and for the backend using Adonis.
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


## License

OpenMonkeyMind is distributed under the terms of the GNU General Public License 3. The full license should be included in the file COPYING, or can be obtained from:

- <http://www.gnu.org/licenses/gpl.txt>
