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
  Route.post('/users/resend_account_email', 'UserController.resendAccountEmail').as('users.resend_account_email')
  Route.post('/users/search', 'UserController.search').as('users.search')
  Route.resource('users', 'UserController').apiOnly()
    .validator(new Map([
      [['users.store'], ['SaveUser']],
      [['users.update'], ['SaveUser']]
    ]))

  Route.get('/auth/user', 'UserController.me').as('users.me')
  Route.put('/auth/user', 'UserController.updateMe').as('users.update_me').validator('SaveUser')
  Route.put('/auth/password', 'UserController.changePassword').as('users.password')
  Route.post('/auth/logout', 'UserController.logout').as('logout')
  Route.post('/auth/email/resend', 'UserController.resendVerificationEmail').as('users.resend_verification_email')

  Route.get('/jobs/study/:study_id', 'JobController.index').as('jobs.index')
  Route.resource('jobs', 'JobController').apiOnly()

  Route.get('/participants/study/:study_id', 'ParticipantController.fetchForStudy').as('participants.fetch_for_study')
  Route.resource('participants', 'ParticipantController').apiOnly()
    .validator(new Map([
      [['participants.store'], ['SaveParticipant']],
      [['participants.update'], ['SaveParticipant']]
    ]))

  Route.get('/studies/:id/data', 'StudyController.downloadData').as('studies.download_data')
  Route.patch('/studies/:id/archive', 'StudyController.archive').as('studies.archive')
  Route.post('/studies/:id/upload/:type', 'StudyController.uploadFile')
    .as('studies.upload')
  Route.post('/studies/:id/collaborator', 'StudyController.addCollaborator').as('studies.add_collaborator')
  Route.patch('/studies/:id/collaborator', 'StudyController.updateCollaborator').as('studies.update_collaborator')
  Route.delete('/studies/:id/collaborator/:userID', 'StudyController.removeCollaborator').as('studies.remove_collaborator')
  Route.resource('studies', 'StudyController').apiOnly()
    .validator(new Map([
      [['studies.store'], ['SaveStudy']],
      [['studies.update'], ['SaveStudy']]
    ]))
  Route.get('/studies/:id/jobs/refresh', 'StudyController.refreshJobs').as('studies.refresh_jobs')
}).prefix(API_PREFIX).middleware(['auth:jwt', 'json'])

Route.group(() => {
  Route.post('/auth/login', 'UserController.login').as('login')
  Route.post('/auth/password/recover', 'UserController.forgotPassword').as('users.forgot_password')
  Route.post('/auth/password/reset/:token', 'UserController.updatePasswordByToken').as('users.reset_password')
  Route.post('/auth/email/verify/:token', 'UserController.verifyEmailAddress').as('users.verify_email')

  Route.get('participants/:identifier/announce', 'ParticipantController.announce').as('participants.announce')
  Route.get('/participants/:identifier/:studyID/currentjob', 'ParticipantController.fetchJob').as('participants.fetch_job')
  Route.get('/participants/:identifier/:studyID/currentjob_idx', 'ParticipantController.fetchJobIndex').as('participants.fetch_job_index')
  Route.get('/participants/:identifier/:studyID/jobs', 'ParticipantController.fetchJobs').as('participants.fetch_jobs')

  Route.patch('/participants/:identifier/:jobID/result', 'ParticipantController.processJobResult').as('jobs.submit_result')
  Route.patch('/jobs/:id/move/:position', 'JobController.moveToPosition').as('jobs.move_position')

  // CREATE:
  // The client inserts a list of jobs into the job table of the server.
  Route.post('/studies/:id/jobs', 'StudyController.insertJobs')
    .as('jobs.insert_sequence')
    .validator('InsertJobs')

  // READ:
  // The client gets a list of jobs from the server. This is not for running the jobs. Rather, it allows
  // the client to modify the jobs, and then update them on the server.
  // By default, the endpoint returns all the jobs of the current study. With optional from and to
  // query params (e.g. GET /studies/2/jobs?from=5&to=10) this can be limited to a subset of the jobs.
  // The id parameter is the study ID to retrieve the jobs from.
  Route.get('/studies/:id/jobs', 'StudyController.fetchJobs')
    .as('jobs.get_sequence')
    .validator('FetchJobs')

  // UPDATE:
  // The client changes the state of a list of jobs on the server. This is convenience operation which
  // could also be done by getting jobs, changing them, removing them, and finally inserting them again.
  Route.put('/studies/:id/jobs/state', 'StudyController.setJobStates')
    .as('jobs.set_states')
    .validator('SetJobStates')

  // DELETE:
  // The client deletes a list of jobs in the job table of the server. The index parameters are specified
  // in the url for making them required (and thus for safety of not deleting all records)
  Route.delete('/studies/:id/jobs/:from/:to', 'StudyController.deleteJobs').as('jobs.delete_sequence')

  Route.any('*', ({ response }) => {
    response.badRequest('This endpoint does not exist')
  })
}).prefix(API_PREFIX).middleware(['json'])

Route.any('*', 'NuxtController.render')
