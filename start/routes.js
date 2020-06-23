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
  Route.resource('studies', 'StudyController').apiOnly()
    .validator(new Map([
      [['studies.store'], ['SaveStudy']],
      [['studies.update'], ['SaveStudy']]
    ]))
}).prefix(API_PREFIX).middleware(['auth:jwt'])

Route.group(() => {
  Route.post('/auth/login', 'UserController.login').as('login')

  /**
  * @swagger
  * /announce/{rfid}:
  *   get:
  *     tags:
  *       - Job distribution
  *     summary: >
  *         When a participant enters a cubicle, the omm client announces this to the server, and the server replies by
  *         sending the experiment file. (Implementation detail: the experiment file should be cached.).
  *     parameters:
  *       - in: path
  *         name: rfid
  *         description: the RFID code of the participant transmitted by its chip.
  *         required: true
  *         type: string
  *     responses:
  *       200:
  *         description: Sends the study to perform, including a download link to the osexp file.
  *         example:
  *           message: Hello Guess
  *       404:
  *         description: The participant with the specified rfid was not found.
  */
  Route.get('/announce/:rfid', 'StudyController.announce').as('announce')

  /**
  * @swagger
  * /jobs/fetchfor/{rfid}:
  *   get:
  *     tags:
  *       - Job distribution
  *     summary: >
  *         The client asks for a job, and the server replies by sending job data. The current job is always
  *         the first job in the table with a ready state.
  *     parameters:
  *       - in: path
  *         name: rfid
  *         description: the RFID code of the participant transmitted by its chip.
  *         required: true
  *         type: string
  *     responses:
  *       200:
  *         description: Sends the current job in line
  *         example:
  *           message: Hello Guess
  *       404:
  *         description: The participant with the specified rfid was not found.
  */
  Route.get('/jobs/fetchfor/:rfid', 'StudyController.fetchJob').as('fetch_job')

  /**
  * @swagger
  * /jobs/indexfor/{rfid}:
  *   get:
  *     tags:
  *       - Job distribution
  *     summary: >
  *       The client asks the server the current job index, i.e. the row of the job table.
  *       The rfid parameter is the RFID code of the participant, transmitted by its chip.
  *     parameters:
  *       - in: path
  *         name: rfid
  *         description: the RFID code of the participant transmitted by its chip.
  *         required: true
  *         type: string
  *     responses:
  *       200:
  *         description: Sends the current job index in line
  *         example:
  *           message: Hello Guess
  *       404:
  *         description: The participant with the specified rfid was not found.
  */
  Route.get('/jobs/indexfor/:rfid', 'StudyController.currentJobIndex').as('current_job_index')

  /**
  * @swagger
  * /jobs/result:
  *   post:
  *     tags:
  *       - Job distribution
  *     summary: >
  *         Once a job has been completed, the client sends the resulting data to the server.
  *     responses:
  *       200:
  *         description: Sends the current job in line
  *         example:
  *           message: Hello Guess
  *       404:
  *         description: The participant with the specified rfid was not found.
  */
  Route.post('/jobs/result', 'JobController.processResult').as('post_job_result')

  /* Public job CRUD actions */

  // CREATE:
  // The client inserts a list of jobs into the job table of the server.
  Route.post('/studies/:id/jobs', 'StudyController.insertJobs').as('insert_job_sequence')

  // READ:
  // The client gets a list of jobs from the server. This is not for running the jobs. Rather, it allows
  // the client to modify the jobs, and then update them on the server.
  // By default, the endpoint returns all the jobs of the current study. With optional from and to
  // query params (e.g. GET /studies/2/jobs?from=5&to=10) this can be limited to a subset of the jobs.
  // The id parameter is the study ID to retrieve the jobs from.
  Route.get('/studies/:id/jobs', 'StudyController.fetchJobs').as('get_job_sequence')

  // UPDATE:
  // The client changes the state of a list of jobs on the server. This is convenience operation which
  // could also be done by getting jobs, changing them, removing them, and finally inserting them again.
  Route.patch('/studies/:id/jobs', 'StudyController.updateJobs').as('update_job_sequence')

  // DELETE:
  // The client deletes a list of jobs in the job table of the server. The index parameters are specified
  // in the url for making them required (and thus for safety of not deleting all records)
  Route.delete('/studies/:id/jobs/:from/:to', 'StudyController.deleteJobs').as('delete_job_sequence')

  Route.any('*', ({ response }) => {
    response.badRequest('This endpoint does not exist')
  })
}).prefix(API_PREFIX)

Route.any('*', 'NuxtController.render')
