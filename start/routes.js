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
  Route.get('/users/types', 'UserController.userTypes')
  Route.resource('users', 'UserController').apiOnly()
    .validator(new Map([
      [['users.store'], ['SaveUser']],
      [['users.update'], ['SaveUser']]
    ]))
  Route.get('/auth/user', 'UserController.me').as('users.me')
  Route.put('/auth/user', 'UserController.updateMe').as('users.update_me')
    .validator('SaveUser')
  Route.put('/auth/user/change_password', 'UserController.changePassword').as('users.password')
  Route.resource('jobs', 'JobController').apiOnly()
  Route.resource('participants', 'ParticipantController').apiOnly()
    .validator(new Map([
      [['participants.store'], ['SaveParticipant']],
      [['participants.update'], ['SaveParticipant']]
    ]))
  Route.resource('studies', 'StudyController').apiOnly()
    .validator(new Map([
      [['studies.store'], ['SaveStudy']],
      [['studies.update'], ['SaveStudy']]
    ]))
}).prefix(API_PREFIX).middleware(['auth:jwt'])

Route.group(() => {
  Route.post('/auth/login', 'UserController.login').as('login')

  Route.get('participants/:identifier/announce', 'ParticipantController.announce').as('participants.announce')
  Route.get('/participants/:identifier/:studyID/fetchjob', 'ParticipantController.fetchJob').as('participants.fetch_job')
  Route.get('/participants/:identifier/:studyID/jobindex', 'ParticipantController.fetchJobIndex').as('participants.fetch_job_index')

  Route.post('/jobs/result', 'JobController.processResult').as('jobs.submit_result')

  /* Public job CRUD actions */

  // CREATE:
  // The client inserts a list of jobs into the job table of the server.
  Route.post('/studies/:id/jobs', 'StudyController.insertJobs').as('jobs.insert_sequence')

  // READ:
  // The client gets a list of jobs from the server. This is not for running the jobs. Rather, it allows
  // the client to modify the jobs, and then update them on the server.
  // By default, the endpoint returns all the jobs of the current study. With optional from and to
  // query params (e.g. GET /studies/2/jobs?from=5&to=10) this can be limited to a subset of the jobs.
  // The id parameter is the study ID to retrieve the jobs from.
  Route.get('/studies/:id/jobs', 'StudyController.fetchJobs').as('jobs.get_sequence')

  // UPDATE:
  // The client changes the state of a list of jobs on the server. This is convenience operation which
  // could also be done by getting jobs, changing them, removing them, and finally inserting them again.
  Route.patch('/studies/:id/jobs', 'StudyController.updateJobs').as('jobs.update_sequence')

  // DELETE:
  // The client deletes a list of jobs in the job table of the server. The index parameters are specified
  // in the url for making them required (and thus for safety of not deleting all records)
  Route.delete('/studies/:id/jobs/:from/:to', 'StudyController.deleteJobs').as('jobs.delete_sequence')

  Route.any('*', ({ response }) => {
    response.badRequest('This endpoint does not exist')
  })
}).prefix(API_PREFIX)

Route.any('*', 'NuxtController.render')
