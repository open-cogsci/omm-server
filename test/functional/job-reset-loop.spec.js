'use strict'

const { test, trait } = use('Test/Suite')('Job Reset and Looping')
const Study = use('App/Models/Study')
const Participant = use('App/Models/Participant')
const Database = use('Database')
const JobStateHelper = use('App/Helpers/JobStateHelper')

trait('Test/ApiClient')
trait('DatabaseTransactions')

function genIdentifier () {
  return 'repeat_reset_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
}

async function cleanup (ptcpId) {
  await Database.table('job_states').where('participant_id', ptcpId).delete()
  await Database.table('participations').where('participant_id', ptcpId).delete()
  await Database.table('job_results').where('participant_id', ptcpId).delete()
}


test('finished participant: resetting jobs changes status to pending (repeat disabled)', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const study = await Study.create({
    name: 'Reset Test Study',
    active: true,
    repeat: false  // Ensure repeat is disabled
  })

  const [job1, job2] = await Promise.all([
    study.jobs().create({ position: 1 }),
    study.jobs().create({ position: 2 })
  ])

  const ptcp = await Participant.create({
    name: 'Test Participant',
    identifier,
    active: true
  })

  await Database.table('participations').insert({
    participant_id: ptcp.id,
    study_id: study.id,
    status_id: 1  // Start as pending
  })

  await Database.table('job_states').insert([
    { participant_id: ptcp.id, job_id: job1.id, status_id: 1 },
    { participant_id: ptcp.id, job_id: job2.id, status_id: 1 }
  ])

  // Submit results for all jobs to finish the participation
  await client
    .patch(`/api/v1/participants/${identifier}/${job1.id}/result`)
    .send({ data: { correct: true } })
    .end()

  await client
    .patch(`/api/v1/participants/${identifier}/${job2.id}/result`)
    .send({ data: { correct: true } })
    .end()

  // Verify participation is now finished
  let participation = await Database.table('participations')
    .where('participant_id', ptcp.id)
    .first()
  assert.equal(participation.status_id, 3)  // Finished

  // Announce should fail now (no active studies with pending/started status)
  const announceRes = await client
    .get(`/api/v1/participants/${identifier}/announce`)
    .end()
  announceRes.assertStatus(404)

  // Now reset job1 to pending (simulate UI behavior: direct DB update + status check)
  await JobStateHelper.updateJobState(ptcp.id, job1.id, 1)

  participation = await Database.table('participations')
    .where('participant_id', ptcp.id)
    .first()
  assert.equal(participation.status_id, 1)  // Pending

  // Verify job states: job1 pending, job2 finished
  const jobStates = await Database.table('job_states')
    .where('participant_id', ptcp.id)
    .orderBy('job_id')
  assert.deepEqual(jobStates.map(s => s.status_id), [1, 3])  // Pending, Finished

  // Announce should now work again
  const announceRes2 = await client
    .get(`/api/v1/participants/${identifier}/announce`)
    .end()
  announceRes2.assertStatus(200)

  // And fetchJob should return job1
  const fetchRes = await client
    .get(`/api/v1/participants/${identifier}/${study.id}/currentjob`)
    .end()
  fetchRes.assertStatus(200)
  assert.equal(fetchRes.body.data.position, 1)

  await cleanup(ptcp.id)
})


test('participant finished: enabling repeat afterwards, resetting one job triggers full reset on submit', async ({ client, assert }) => {
  const identifier = genIdentifier()

  // Create study with repeat initially disabled
  const study = await Study.create({
    name: 'Loop After Finish Test',
    active: true,
    repeat: false
  })

  const [job1, job2, job3] = await Promise.all([
    study.jobs().create({ position: 1 }),
    study.jobs().create({ position: 2 }),
    study.jobs().create({ position: 3 })
  ])

  const ptcp = await Participant.create({
    name: 'Test Participant',
    identifier,
    active: true
  })

  await Database.table('participations').insert({
    participant_id: ptcp.id,
    study_id: study.id,
    status_id: 1  // Start as pending
  })

  await Database.table('job_states').insert([
    { participant_id: ptcp.id, job_id: job1.id, status_id: 1 },
    { participant_id: ptcp.id, job_id: job2.id, status_id: 1 },
    { participant_id: ptcp.id, job_id: job3.id, status_id: 1 }
  ])

  // Submit results for all jobs to finish the participation (repeat disabled)
  await client.patch(`/api/v1/participants/${identifier}/${job1.id}/result`).send({ data: { correct: true } }).end()
  await client.patch(`/api/v1/participants/${identifier}/${job2.id}/result`).send({ data: { correct: true } }).end()
  await client.patch(`/api/v1/participants/${identifier}/${job3.id}/result`).send({ data: { correct: true } }).end()

  // Verify participation is finished and all jobs are finished
  let participation = await Database.table('participations').where('participant_id', ptcp.id).first()
  assert.equal(participation.status_id, 3)  // Finished

  let jobStates = await Database.table('job_states').where('participant_id', ptcp.id).orderBy('job_id')
  assert.deepEqual(jobStates.map(s => s.status_id), [3, 3, 3])  // All finished

  // Now enable repeat on the study
  study.repeat = true
  await study.save()

  // Manually reset job1 to pending (simulate UI behavior: direct DB update + status check)
  await JobStateHelper.updateJobState(ptcp.id, job1.id, 1)

  // Verify participation is now pending (due to open job in pending state) and job1 is pending
  participation = await Database.table('participations').where('participant_id', ptcp.id).first()
  assert.equal(participation.status_id, 1)  // Pending

  jobStates = await Database.table('job_states').where('participant_id', ptcp.id).orderBy('job_id')
  assert.deepEqual(jobStates.map(s => s.status_id), [1, 3, 3])  // job1 pending, others finished

  // Announce to start the task
  const announceRes = await client.get(`/api/v1/participants/${identifier}/announce`).end()
  announceRes.assertStatus(200)

  // Submit result for job1 (the pending one)
  await client
    .patch(`/api/v1/participants/${identifier}/${job1.id}/result`)
    .send({ data: { correct: true } })
    .end()

  // Since repeat is now enabled and this completes the "cycle" 
  // (all jobs were finished before, and one was reset),
  // checkIfFinished should trigger a full reset of all jobs
  participation = await Database.table('participations').where('participant_id', ptcp.id).first()
  assert.equal(participation.status_id, 1)  // Reset to pending

  jobStates = await Database.table('job_states').where('participant_id', ptcp.id).orderBy('job_id')
  assert.deepEqual(jobStates.map(s => s.status_id), [1, 1, 1])  // All reset to pending

  await cleanup(ptcp.id)
})


