'use strict'

const { test, trait } = use('Test/Suite')('Job Reset and Looping')
const Study = use('App/Models/Study')
const Participant = use('App/Models/Participant')
const Database = use('Database')

trait('Test/ApiClient')
trait('DatabaseTransactions')

function genIdentifier () {
  return 'job_reset_loop_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
}

async function cleanup (ptcpId) {
  await Database.table('job_states').where('participant_id', ptcpId).delete()
  await Database.table('participations').where('participant_id', ptcpId).delete()
  await Database.table('job_results').where('participant_id', ptcpId).delete()
}


test('finished participant: resetting jobs changes status to started (looping disabled)', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const study = await Study.create({
    name: 'Reset Test Study',
    active: true,
    loop_enabled: false  // Ensure looping is disabled
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
  await Database.table('job_states')
    .where('participant_id', ptcp.id)
    .where('job_id', job1.id)
    .update({ status_id: 1 })  // Set to pending

  // Simulate UI calling checkIfFinished to update participation status
  const studyInstance = await Study.find(study.id)
  await studyInstance.checkIfFinished(ptcp.id)

  // Verify participation status changed back to started
  participation = await Database.table('participations')
    .where('participant_id', ptcp.id)
    .first()
  assert.equal(participation.status_id, 2)  // Started

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


test('participant finished: enabling looping afterwards, resetting one job triggers full reset on submit', async ({ client, assert }) => {
  const identifier = genIdentifier()

  // Create study with looping initially disabled
  const study = await Study.create({
    name: 'Loop After Finish Test',
    active: true,
    loop_enabled: false
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

  // Submit results for all jobs to finish the participation (looping disabled)
  await client.patch(`/api/v1/participants/${identifier}/${job1.id}/result`).send({ data: { correct: true } }).end()
  await client.patch(`/api/v1/participants/${identifier}/${job2.id}/result`).send({ data: { correct: true } }).end()
  await client.patch(`/api/v1/participants/${identifier}/${job3.id}/result`).send({ data: { correct: true } }).end()

  // Verify participation is finished and all jobs are finished
  let participation = await Database.table('participations').where('participant_id', ptcp.id).first()
  assert.equal(participation.status_id, 3)  // Finished
  assert.equal(participation.loop_count, 0)

  let jobStates = await Database.table('job_states').where('participant_id', ptcp.id).orderBy('job_id')
  assert.deepEqual(jobStates.map(s => s.status_id), [3, 3, 3])  // All finished

  // Now enable looping on the study
  study.loop_enabled = true
  await study.save()

  // Manually reset job1 to pending (simulate UI behavior: direct DB update + status check)
  await Database.table('job_states')
    .where('participant_id', ptcp.id)
    .where('job_id', job1.id)
    .update({ status_id: 1 })  // Set to pending

  // Simulate UI calling checkIfFinished to update participation status
  const studyInstance = await Study.find(study.id)
  await studyInstance.checkIfFinished(ptcp.id)

  // Verify participation is now started (due to open job) and job1 is pending
  participation = await Database.table('participations').where('participant_id', ptcp.id).first()
  assert.equal(participation.status_id, 2)  // Started

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

  // Since looping is now enabled and this completes the "cycle" 
  // (all jobs were finished before, and one was reset),
  // checkIfFinished should trigger a full reset of all jobs
  participation = await Database.table('participations').where('participant_id', ptcp.id).first()
  assert.equal(participation.status_id, 2)  // Remains started
  assert.equal(participation.loop_count, 1)  // Incremented

  jobStates = await Database.table('job_states').where('participant_id', ptcp.id).orderBy('job_id')
  assert.deepEqual(jobStates.map(s => s.status_id), [1, 1, 1])  // All reset to pending

  await cleanup(ptcp.id)
})


