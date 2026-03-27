'use strict'

const { test, trait, before } = use('Test/Suite')('Participant Jobs')

trait('Test/ApiClient')

const PARTICIPANT = 'a'
const STUDY_ID = 1

// Shared state across tests
let currentJobIndex = null
let currentJobId = null

test('can get canonical identifier', async ({ client, assert }) => {
  const response = await client
    .get(`/api/v1/participants/${PARTICIPANT}/canonical`)
    .end()
  response.assertStatus(200)
  const { data } = response.body
  assert.isString(data.identifier)
})

test('can announce participant and receive study info', async ({ client, assert }) => {
  const response = await client
    .get(`/api/v1/participants/${PARTICIPANT}/announce`)
    .end()
  response.assertStatus(200)
  const { data } = response.body
  // Study properties
  assert.isNumber(data.id)
  assert.isString(data.name)
  assert.isString(data.description)
  assert.isNumber(data.jobs_count)
  assert.isArray(data.files)
  // Participants nested in study
  assert.isArray(data.participants)
  assert.isAbove(data.participants.length, 0)
  const participant = data.participants[0]
  assert.isNumber(participant.id)
  assert.isString(participant.name)
  assert.isObject(participant.pivot)
  assert.isNumber(participant.pivot.participant_id)
  assert.isNumber(participant.pivot.study_id)
  assert.isNumber(participant.pivot.status_id)
})

test('can get current job index', async ({ client, assert }) => {
  const response = await client
    .get(`/api/v1/participants/${PARTICIPANT}/${STUDY_ID}/currentjob_idx`)
    .end()
  response.assertStatus(200)
  const { data } = response.body
  assert.isNumber(data.study_id)
  assert.isNumber(data.current_job_index)
  // Save for later use when submitting results
  currentJobIndex = data.current_job_index
})

test('can get current job with variables', async ({ client, assert }) => {
  const response = await client
    .get(`/api/v1/participants/${PARTICIPANT}/${STUDY_ID}/currentjob`)
    .end()
  response.assertStatus(200)
  const { data } = response.body
  // Job properties
  assert.isNumber(data.id)
  assert.isNumber(data.study_id)
  assert.isNumber(data.position)
  // Variables
  assert.isArray(data.variables)
  assert.isAbove(data.variables.length, 0)
  const variable = data.variables[0]
  assert.isNumber(variable.id)
  assert.isString(variable.name)
  assert.isObject(variable.dtype)
  assert.isString(variable.dtype.name)
  assert.isObject(variable.pivot)
  assert.exists(variable.pivot.value)
  // Save job ID for result submission
  currentJobId = data.id
})

test('can list all jobs for a participant and study', async ({ client, assert }) => {
  const response = await client
    .get(`/api/v1/participants/${PARTICIPANT}/${STUDY_ID}/jobs`)
    .end()
  response.assertStatus(200)
  const { data } = response.body
  assert.isArray(data)
  assert.isAbove(data.length, 0)
})

test('can list a range of jobs for a participant and study', async ({ client, assert }) => {
  const response = await client
    .get(`/api/v1/participants/${PARTICIPANT}/${STUDY_ID}/jobs`)
    .query({ from: currentJobIndex, to: currentJobIndex + 1 })
    .end()
  response.assertStatus(200)
  const { data } = response.body
  assert.isArray(data)
  assert.equal(data.length, 1)
})

test('can submit a job result', async ({ client, assert }) => {
  assert.isNotNull(currentJobId, 'currentJobId should have been set by a previous test')
  const response = await client
    .patch(`/api/v1/participants/${PARTICIPANT}/${currentJobId}/result`)
    .send({ data: { correct: true, rt: 435 } })
    .end()
  response.assertStatus(204)
})

test('current job index has incremented', async ({ client, assert }) => {
  const response = await client
    .get(`/api/v1/participants/${PARTICIPANT}/${STUDY_ID}/currentjob_idx`)
    .end()
  response.assertStatus(200)
  const { data } = response.body
  assert.isNumber(data.study_id)
  assert.isNumber(data.current_job_index)
  assert.equal(data.current_job_index, currentJobIndex + 1)
})

test('resetting first job to pending', async ({ client, assert }) => {
  const response = await client
    .put(`/api/v1/studies/${STUDY_ID}/jobs/state`)
    .send({ from: 1, to: 2, state: 1, participant: PARTICIPANT })
    .end()
  response.assertStatus(200)
  const { data } = response.body
  console.log(data)
})

test('current job index is 1', async ({ client, assert }) => {
  const response = await client
    .get(`/api/v1/participants/${PARTICIPANT}/${STUDY_ID}/currentjob_idx`)
    .end()
  response.assertStatus(200)
  const { data } = response.body
  assert.isNumber(data.study_id)
  assert.isNumber(data.current_job_index)
  assert.equal(data.current_job_index, 1)
})

test('can submit a job result', async ({ client, assert }) => {
  assert.isNotNull(currentJobId, 'currentJobId should have been set by a previous test')
  const response = await client
    .patch(`/api/v1/participants/${PARTICIPANT}/1/result`)
    .send({ data: { correct: true, rt: 435 } })
    .end()
  response.assertStatus(204)
})

test('current job index is back to incremented value', async ({ client, assert }) => {
  const response = await client
    .get(`/api/v1/participants/${PARTICIPANT}/${STUDY_ID}/currentjob_idx`)
    .end()
  response.assertStatus(200)
  const { data } = response.body
  assert.isNumber(data.study_id)
  assert.isNumber(data.current_job_index)
  assert.equal(data.current_job_index, currentJobIndex + 1)
})
