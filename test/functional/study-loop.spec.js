'use strict'

const { test, trait } = use('Test/Suite')('Study Looping')
const Study = use('App/Models/Study')
const Participant = use('App/Models/Participant')
const Database = use('Database')

trait('Test/ApiClient')

function genIdentifier () {
  return 'loop_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
}

async function cleanup (ptcpId) {
  await Database.table('job_states').where('participant_id', ptcpId).delete()
  await Database.table('participations').where('participant_id', ptcpId).delete()
  await Database.table('job_results').where('participant_id', ptcpId).delete()
}


// test looping behavior
test('looping enabled: resets after all jobs finished + increments loop_count', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const study = await Study.create({
    name: 'Loop Study',
    active: true,
    loop_enabled: true
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

  assert.equal(participation.loop_count, 1)
  assert.equal(participation.status_id, 2) // Should remain in progress for looping

  await cleanup(ptcp.id)
})

test('does NOT reset if not all jobs are finished (looping enabled)', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const study = await Study.create({
    name: 'Partial Study',
    active: true,
    loop_enabled: true
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

test('looping enabled: full cycle twice, loop_count = 2 and results persisted', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const study = await Study.create({
    name: 'Full Cycle',
    active: true,
    loop_enabled: true
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

    assert.equal(participation.loop_count, loop)
    assert.equal(participation.status_id, 2) // Remains in progress
  }

  const count = await Database.table('job_results')
    .where('participant_id', ptcp.id)
    .getCount()

  assert.equal(count, 4)

  await cleanup(ptcp.id)
})


// test results behavior
test('job_result stores loop_count after reset', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const study = await Study.create({
    name: 'Result Study',
    active: true,
    loop_enabled: true
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
    status_id: 1 // Start with pending
  })

  // Submit first result (loop 0)
  await client
    .patch(`/api/v1/participants/${identifier}/${job.id}/result`)
    .send({ data: { correct: true } })
    .end()

  // This triggers reset, now submit result again (loop 1)
  await client
    .patch(`/api/v1/participants/${identifier}/${job.id}/result`)
    .send({ data: { correct: true } })
    .end()

  const results = await Database.table('job_results')
    .where('participant_id', ptcp.id)
    .orderBy('id')

  assert.equal(results[0].data.loop_count, 0) // First submission
  assert.equal(results[1].data.loop_count, 1) // After reset

  await cleanup(ptcp.id)
})


test('looping enabled: only resets jobs for participants who finished all jobs', async ({ client, assert }) => {
  const identifierA = 'loop_partA_' + Date.now();
  const identifierB = 'loop_partB_' + Date.now();

  const study = await Study.create({
    name: 'Multi Participant Study',
    active: true,
    loop_enabled: true
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
  assert.equal(resA.body.data.current_job_index, 1); // Reset to start of loop

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

  // Verify loop counts and status: ptcpA looped and in progress, ptcpB not looped and in progress
  const participationA = await Database.table('participations')
    .where('participant_id', ptcpA.id)
    .first();

  const participationB = await Database.table('participations')
    .where('participant_id', ptcpB.id)
    .first();

  assert.equal(participationA.loop_count, 1);
  assert.equal(participationA.status_id, 2); // In progress
  assert.equal(participationB.loop_count, 0);
  assert.equal(participationB.status_id, 2); // In progress

  await cleanup(ptcpA.id);
  await cleanup(ptcpB.id);
});


// Test error cases
test('404 when jobs finished but looping disabled', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const study = await Study.create({
    name: 'No Loop',
    active: true,
    loop_enabled: false
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

test('404 when looping enabled but participant is inactive', async ({ client, assert }) => {
  const identifier = genIdentifier()

  const study = await Study.create({
    name: 'Inactive Participant',
    active: true,
    loop_enabled: true
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
