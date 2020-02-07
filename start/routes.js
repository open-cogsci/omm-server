'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/guides/routing
|
*/

const Route = use('Route')
const API_PREFIX = '/api/v1'

Route.group(() => {
  Route.resource('users', 'UserController').apiOnly()
  Route.get('/auth/user', 'UserController.me').as('users.me')
  Route.put('/auth/user', 'UserController.updateMe').as('users.update_me')
  Route.put('/auth/user/change_password', 'UserController.changePassword').as('users.password')
  Route.resource('jobs', 'JobController').apiOnly()
  Route.resource('participants', 'ParticipantController').apiOnly()
}).prefix(API_PREFIX).middleware(['auth:jwt'])

Route.group(() => {
  Route.post('/auth/login', 'UserController.login').as('login')
}).prefix(API_PREFIX)

Route.any('*', 'NuxtController.render')
