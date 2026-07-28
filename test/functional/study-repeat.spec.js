'use strict'

const { test, trait } = use('Test/Suite')('Study Repeating')
const Study = use('App/Models/Study')
const Participant = use('App/Models/Participant')
const Database = use('Database')

trait('Test/ApiClient')
trait('DatabaseTransactions')


function genIdentifier () {
  return 'repeat_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
}

async function cleanup (ptcpId) {
  await Database.table('job_states').where('participant_id', ptcpId).delete()
  await Database.table('participations').where('participant_id', ptcpId).delete()
  await Database.table('job_results').where('participant_id', ptcpId).delete()
}


// test repeat behavior
test('repeat enabled: resets after all jobs finished', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const study = await Study.create({
    name: 'Repeat Study',
    active: true,
    repeat: true
  })

  const jobs = await Promise.all([
    study.jobs().create({ position: 1 }),
    study.jobs().create({ position: 2 }),
    study.jobs().create({ position: 3 })
  ])

  const ptcp = await Participant.create({
    name: 'Participant',
    identifier,
    active: true
  })

  await Database.table('participations').insert({
    participant_id: ptcp.id,
    study_id: study.id,
    status_id: 1
  })

  await Database.table('job_states').insert(
    jobs.map(j => ({
      participant_id: ptcp.id,
      job_id: j.id,
      status_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    }))
  )

  // Submit results for all jobs to trigger automatic reset
  for (const job of jobs) {
    await client
      .patch(`/api/v1/participants/${identifier}/${job.id}/result`)
      .send({ data: { correct: true } })
      .end()
  }

  const states = await Database.table('job_states')
    .where('participant_id', ptcp.id)
    .orderBy('job_id')

  states.forEach(s => assert.equal(s.status_id, 1))

  const participation = await Database.table('participations')
    .where('participant_id', ptcp.id)
    .first()

  assert.equal(participation.status_id, 1) // Reset to pending after all studies finished

  await cleanup(ptcp.id)
})

test('does NOT reset if not all jobs are finished (repeat enabled)', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const study = await Study.create({
    name: 'Partial Study',
    active: true,
    repeat: true
  })

  const [j1, j2, j3] = await Promise.all([
    study.jobs().create({ position: 1 }),
    study.jobs().create({ position: 2 }),
    study.jobs().create({ position: 3 })
  ])

  const ptcp = await Participant.create({
    name: 'Participant',
    identifier,
    active: true
  })

  await Database.table('participations').insert({
    participant_id: ptcp.id,
    study_id: study.id,
    status_id: 1
  })

  await Database.table('job_states').insert([
    { participant_id: ptcp.id, job_id: j1.id, status_id: 3 },
    { participant_id: ptcp.id, job_id: j2.id, status_id: 2 },
    { participant_id: ptcp.id, job_id: j3.id, status_id: 1 }
  ])

  const states = await Database.table('job_states')
    .where('participant_id', ptcp.id)
    .orderBy('job_id')

  assert.deepEqual(states.map(s => s.status_id), [3, 2, 1])

  await cleanup(ptcp.id)
})

test('repeat enabled: full cycle twice, results persisted', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const study = await Study.create({
    name: 'Full Cycle',
    active: true,
    repeat: true
  })

  const [job1, job2] = await Promise.all([
    study.jobs().create({ position: 1 }),
    study.jobs().create({ position: 2 })
  ])

  const ptcp = await Participant.create({
    name: 'Participant',
    identifier,
    active: true
  })

  await Database.table('participations').insert({
    participant_id: ptcp.id,
    study_id: study.id,
    status_id: 1
  })

  await Database.table('job_states').insert([
    { participant_id: ptcp.id, job_id: job1.id, status_id: 1 },
    { participant_id: ptcp.id, job_id: job2.id, status_id: 1 }
  ])

  for (let loop = 1; loop <= 2; loop++) {
    for (const job of [job1, job2]) {
      await client
        .patch(`/api/v1/participants/${identifier}/${job.id}/result`)
        .send({ data: { correct: true } })
        .end()
    }

    // Verify reset happened automatically
    const participation = await Database.table('participations')
      .where('participant_id', ptcp.id)
      .first()

    assert.equal(participation.status_id, 1) // Reset to pending after all studies finished
  }

  const count = await Database.table('job_results')
    .where('participant_id', ptcp.id)
    .getCount()

  assert.equal(count, 4)

  await cleanup(ptcp.id)
})


test('repeat enabled: preserves job results across multiple cycles', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const study = await Study.create({
    name: 'Result Study',
    active: true,
    repeat: true
  })

  const job = await study.jobs().create({ position: 1 })

  const ptcp = await Participant.create({
    name: 'Participant',
    identifier,
    active: true
  })

  await Database.table('participations').insert({
    participant_id: ptcp.id,
    study_id: study.id,
    status_id: 1
  })

  await Database.table('job_states').insert({
    participant_id: ptcp.id,
    job_id: job.id,
    status_id: 1
  })

  // First cycle
  const firstResult = {
    correct: true,
    answer: 'first cycle'
  }

  await client
    .patch(`/api/v1/participants/${identifier}/${job.id}/result`)
    .send({ data: firstResult })
    .end()

  // Because this is a one-job repeating study,
  // finishing the job should immediately reset it.
  let jobState = await Database.table('job_states')
    .where('participant_id', ptcp.id)
    .where('job_id', job.id)
    .first()

  assert.equal(jobState.status_id, 1)

  // Verify the first result still exists AFTER the reset.
  let results = await Database.table('job_results')
    .where('participant_id', ptcp.id)
    .where('job_id', job.id)
    .orderBy('id')

  assert.equal(results.length, 1)

  // Second cycle - deliberately use different data.
  const secondResult = {
    correct: false,
    answer: 'second cycle'
  }

  await client
    .patch(`/api/v1/participants/${identifier}/${job.id}/result`)
    .send({ data: secondResult })
    .end()

  // Both historical results should now exist.
  results = await Database.table('job_results')
    .where('participant_id', ptcp.id)
    .where('job_id', job.id)
    .orderBy('id')

  assert.equal(results.length, 2)

  assert.equal(results[0].participant_id, ptcp.id)
  assert.equal(results[0].job_id, job.id)

  assert.equal(results[1].participant_id, ptcp.id)
  assert.equal(results[1].job_id, job.id)

  const storedFirstData =
    typeof results[0].data === 'string'
      ? JSON.parse(results[0].data)
      : results[0].data

  const storedSecondData =
    typeof results[1].data === 'string'
      ? JSON.parse(results[1].data)
      : results[1].data

  assert.deepEqual(storedFirstData.correct, firstResult.correct)
  assert.deepEqual(storedFirstData.answer, firstResult.answer)
  assert.deepEqual(storedSecondData.correct, secondResult.correct)
  assert.deepEqual(storedSecondData.answer, secondResult.answer)

  await cleanup(ptcp.id)
})

test('repeat enabled: only resets jobs for participants who finished all jobs', async ({ client, assert }) => {
  const identifierA = 'repeat_partA_' + Date.now();
  const identifierB = 'repeat_partB_' + Date.now();

  const study = await Study.create({
    name: 'Multi Participant Study',
    active: true,
    repeat: true
  });

  const [job1, job2] = await Promise.all([
    study.jobs().create({ position: 1 }),
    study.jobs().create({ position: 2 })
  ]);

  // Participant A: finishes all jobs
  const ptcpA = await Participant.create({
    name: 'Participant A',
    identifier: identifierA,
    active: true
  });

  // Participant B: only finishes first job
  const ptcpB = await Participant.create({
    name: 'Participant B',
    identifier: identifierB,
    active: true
  });

  // Set up participations
  await Promise.all([
    Database.table('participations').insert({
      participant_id: ptcpA.id,
      study_id: study.id,
      status_id: 1
    }),
    Database.table('participations').insert({
      participant_id: ptcpB.id,
      study_id: study.id,
      status_id: 1
    })
  ]);

  // Set up job states - both start with pending
  await Database.table('job_states').insert([
    { participant_id: ptcpA.id, job_id: job1.id, status_id: 1 },
    { participant_id: ptcpA.id, job_id: job2.id, status_id: 1 },
    { participant_id: ptcpB.id, job_id: job1.id, status_id: 1 },
    { participant_id: ptcpB.id, job_id: job2.id, status_id: 1 }
  ]);

  // ptcpA finishes both jobs (triggers automatic reset)
  await client.patch(`/api/v1/participants/${identifierA}/${job1.id}/result`).send({ data: { correct: true } }).end()
  await client.patch(`/api/v1/participants/${identifierA}/${job2.id}/result`).send({ data: { correct: true } }).end()

  // ptcpB finishes only first job
  await client.patch(`/api/v1/participants/${identifierB}/${job1.id}/result`).send({ data: { correct: true } }).end()

  // Check current job index for both
  const resA = await client
    .get(`/api/v1/participants/${identifierA}/${study.id}/currentjob_idx`)
    .end();

  const resB = await client
    .get(`/api/v1/participants/${identifierB}/${study.id}/currentjob_idx`)
    .end();

  // Both should return 200 with job index 1 (after reset for A, job2 for B)
  resA.assertStatus(200);
  assert.equal(resA.body.data.current_job_index, 1); // Reset to start

  resB.assertStatus(200);
  assert.equal(resB.body.data.current_job_index, 2); // Still on second job

  // Verify job states: ptcpA reset to pending, ptcpB has job1 finished, job2 pending
  const statesA = await Database.table('job_states')
    .where('participant_id', ptcpA.id)
    .orderBy('job_id');

  const statesB = await Database.table('job_states')
    .where('participant_id', ptcpB.id)
    .orderBy('job_id');

  // ptcpA: both jobs reset to pending (status_id: 1)
  statesA.forEach(s => assert.equal(s.status_id, 1));

  // ptcpB: job1 finished (3), job2 pending (1)
  assert.deepEqual(statesB.map(s => s.status_id), [3, 1]);

  const participationA = await Database.table('participations')
    .where('participant_id', ptcpA.id)
    .first();

  const participationB = await Database.table('participations')
    .where('participant_id', ptcpB.id)
    .first();

  assert.equal(participationA.status_id, 1); // Reset to pending
  assert.equal(participationB.status_id, 1); // Pending (job2 still pending, not started)

  await cleanup(ptcpA.id);
  await cleanup(ptcpB.id);
});

test('repeat enabled: multiple repeat studies reset together when all studies finished', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const studyA = await Study.create({ name: 'Study A', active: true, repeat: false })
  const studyB = await Study.create({ name: 'Study B', active: true, repeat: false })
  const studyC = await Study.create({ name: 'Study C', active: true, repeat: true })
  const studyD = await Study.create({ name: 'Study D', active: true, repeat: true })

  const [jobA] = await Promise.all([studyA.jobs().create({ position: 1 })])
  const [jobB] = await Promise.all([studyB.jobs().create({ position: 1 })])
  const [jobC] = await Promise.all([studyC.jobs().create({ position: 1 })])
  const [jobD] = await Promise.all([studyD.jobs().create({ position: 1 })])

  const ptcp = await Participant.create({ name: 'Participant', identifier, active: true })

  await Database.table('participations').insert([
    { participant_id: ptcp.id, study_id: studyA.id, status_id: 1 },
    { participant_id: ptcp.id, study_id: studyB.id, status_id: 1 },
    { participant_id: ptcp.id, study_id: studyC.id, status_id: 1 },
    { participant_id: ptcp.id, study_id: studyD.id, status_id: 1 }
  ])

  await Database.table('job_states').insert([
    { participant_id: ptcp.id, job_id: jobA.id, status_id: 1 },
    { participant_id: ptcp.id, job_id: jobB.id, status_id: 1 },
    { participant_id: ptcp.id, job_id: jobC.id, status_id: 1 },
    { participant_id: ptcp.id, job_id: jobD.id, status_id: 1 }
  ])

  // Finish A and B (non-repeat) first
  await client.patch(`/api/v1/participants/${identifier}/${jobA.id}/result`).send({ data: { correct: true } }).end()
  await client.patch(`/api/v1/participants/${identifier}/${jobB.id}/result`).send({ data: { correct: true } }).end()

  // Finish C and D
  await client.patch(`/api/v1/participants/${identifier}/${jobC.id}/result`).send({ data: { correct: true } }).end()
  await client.patch(`/api/v1/participants/${identifier}/${jobD.id}/result`).send({ data: { correct: true } }).end()

  // C and D should now both be reset to pending (repeat enabled, all studies finished)
  const participationC = await Database.table('participations').where('participant_id', ptcp.id).where('study_id', studyC.id).first()
  const participationD = await Database.table('participations').where('participant_id', ptcp.id).where('study_id', studyD.id).first()
  assert.equal(participationC.status_id, 1) // Reset to pending
  assert.equal(participationD.status_id, 1) // Reset to pending

  // A and B should be finished
  const participationA = await Database.table('participations').where('participant_id', ptcp.id).where('study_id', studyA.id).first()
  const participationB = await Database.table('participations').where('participant_id', ptcp.id).where('study_id', studyB.id).first()
  assert.equal(participationA.status_id, 3) // Finished
  assert.equal(participationB.status_id, 3) // Finished

  await cleanup(ptcp.id)
})


// Test error cases
test('404 when jobs finished but repeat disabled', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const study = await Study.create({
    name: 'No Repeat',
    active: true,
    repeat: false
  })

  const job = await study.jobs().create({ position: 1 })

  const ptcp = await Participant.create({
    name: 'Participant',
    identifier,
    active: true
  })

  await Database.table('participations').insert({
    participant_id: ptcp.id,
    study_id: study.id,
    status_id: 1
  })

  await Database.table('job_states').insert({
    participant_id: ptcp.id,
    job_id: job.id,
    status_id: 1
  })

  // Submit result to finish the study
  await client
    .patch(`/api/v1/participants/${identifier}/${job.id}/result`)
    .send({ data: { correct: true } })
    .end()

  const res = await client
    .get(`/api/v1/participants/${identifier}/${study.id}/currentjob_idx`)
    .end()

  res.assertStatus(404)
  assert.include(res.body.message, 'no jobs')

  // Verify participation status is finished
  const participation = await Database.table('participations')
    .where('participant_id', ptcp.id)
    .first()

  assert.equal(participation.status_id, 3) // Finished

  await cleanup(ptcp.id)
})

test('412 when repeat enabled but participant is inactive', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const study = await Study.create({
    name: 'Inactive Participant',
    active: true,
    repeat: true
  })

  const job = await study.jobs().create({ position: 1 })

  const ptcp = await Participant.create({
    name: 'Participant',
    identifier,
    active: false
  })

  await Database.table('participations').insert({
    participant_id: ptcp.id,
    study_id: study.id,
    status_id: 1
  })

  await Database.table('job_states').insert({
    participant_id: ptcp.id,
    job_id: job.id,
    status_id: 3
  })

  const res = await client
    .get(`/api/v1/participants/${identifier}/${study.id}/currentjob_idx`)
    .end()

  res.assertStatus(412)  
  assert.include(res.body.message, 'not active')

  await cleanup(ptcp.id)
})

test('finished non-repeat study does not reset immediately when repeat is later enabled', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const study = await Study.create({
    name: 'Enable Repeat After Finish',
    active: true,
    repeat: false
  })

  const job = await study.jobs().create({ position: 1 })

  const ptcp = await Participant.create({
    name: 'Participant',
    identifier,
    active: true
  })

  await Database.table('participations').insert({
    participant_id: ptcp.id,
    study_id: study.id,
    status_id: 1
  })

  await Database.table('job_states').insert({
    participant_id: ptcp.id,
    job_id: job.id,
    status_id: 1
  })

  // Finish the study while repeat is disabled.
  await client
    .patch(`/api/v1/participants/${identifier}/${job.id}/result`)
    .send({ data: { correct: true } })
    .end()

  // The study should now be finished.
  let participation = await Database.table('participations')
    .where('participant_id', ptcp.id)
    .where('study_id', study.id)
    .first()

  let jobState = await Database.table('job_states')
    .where('participant_id', ptcp.id)
    .where('job_id', job.id)
    .first()

  assert.equal(participation.status_id, 3)
  assert.equal(jobState.status_id, 3)

  // Enable repeat AFTER the study has already finished.
  study.repeat = true
  await study.save()

  // Merely enabling repeat must NOT reset an already-finished study.
  participation = await Database.table('participations')
    .where('participant_id', ptcp.id)
    .where('study_id', study.id)
    .first()

  jobState = await Database.table('job_states')
    .where('participant_id', ptcp.id)
    .where('job_id', job.id)
    .first()

  assert.equal(participation.status_id, 3)
  assert.equal(jobState.status_id, 3)

  // There is still no current job because nothing triggered a new reset cycle.
  const res = await client
    .get(`/api/v1/participants/${identifier}/${study.id}/currentjob_idx`)
    .end()

  res.assertStatus(404)

  await cleanup(ptcp.id)
})

test('finished study enabled for repeat waits for next full completion before reset', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const studyA = await Study.create({
    name: 'Study A',
    active: true,
    repeat: false
  })

  const studyB = await Study.create({
    name: 'Study B',
    active: true,
    repeat: true
  })

  const jobA = await studyA.jobs().create({ position: 1 })
  const jobB = await studyB.jobs().create({ position: 1 })

  const ptcp = await Participant.create({
    name: 'Participant',
    identifier,
    active: true
  })

  await Database.table('participations').insert([
    {
      participant_id: ptcp.id,
      study_id: studyA.id,
      status_id: 1
    },
    {
      participant_id: ptcp.id,
      study_id: studyB.id,
      status_id: 1
    }
  ])

  await Database.table('job_states').insert([
    {
      participant_id: ptcp.id,
      job_id: jobA.id,
      status_id: 1
    },
    {
      participant_id: ptcp.id,
      job_id: jobB.id,
      status_id: 1
    }
  ])

  // Finish A while repeat=false
  await client
    .patch(`/api/v1/participants/${identifier}/${jobA.id}/result`)
    .send({ data: { correct: true } })
    .end()

  // Finish B while repeat=true.
  // Now all studies are finished, so B should reset.
  await client
    .patch(`/api/v1/participants/${identifier}/${jobB.id}/result`)
    .send({ data: { correct: true } })
    .end()

  let participationA = await Database.table('participations')
    .where('participant_id', ptcp.id)
    .where('study_id', studyA.id)
    .first()

  let participationB = await Database.table('participations')
    .where('participant_id', ptcp.id)
    .where('study_id', studyB.id)
    .first()

  assert.equal(participationA.status_id, 3)
  assert.equal(participationB.status_id, 1)

  // A was finished as non-repeat.
  // Enable repeat AFTER the previous reset cycle already happened.
  studyA.repeat = true
  await studyA.save()

  // B is currently pending, so not all studies are finished.
  // A must NOT reset yet.
  participationA = await Database.table('participations')
    .where('participant_id', ptcp.id)
    .where('study_id', studyA.id)
    .first()

  const jobStateA = await Database.table('job_states')
    .where('participant_id', ptcp.id)
    .where('job_id', jobA.id)
    .first()

  assert.equal(participationA.status_id, 3)
  assert.equal(jobStateA.status_id, 3)

  // Finish B again.
  // This creates the next "all studies finished" boundary.
  await client
    .patch(`/api/v1/participants/${identifier}/${jobB.id}/result`)
    .send({ data: { correct: true } })
    .end()

  // Now both A and B have repeat=true, so both should reset.
  participationA = await Database.table('participations')
    .where('participant_id', ptcp.id)
    .where('study_id', studyA.id)
    .first()

  participationB = await Database.table('participations')
    .where('participant_id', ptcp.id)
    .where('study_id', studyB.id)
    .first()

  assert.equal(participationA.status_id, 1)
  assert.equal(participationB.status_id, 1)

  const finalJobStateA = await Database.table('job_states')
    .where('participant_id', ptcp.id)
    .where('job_id', jobA.id)
    .first()

  const finalJobStateB = await Database.table('job_states')
    .where('participant_id', ptcp.id)
    .where('job_id', jobB.id)
    .first()

  assert.equal(finalJobStateA.status_id, 1)
  assert.equal(finalJobStateB.status_id, 1)

  await cleanup(ptcp.id)
})