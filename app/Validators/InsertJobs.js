'use strict'

class InsertJobs {
  get rules () {
    return {
      at: 'required|integer|min:1',
      jobs: 'required|array|min:1'
    }
  }

  get messages () {
    return {
      'at.required': 'You must specify a position to insert the jobs at.',
      'at.integer': '"at" needs to be an integer greater than 0',
      'at.min': '"at" needs to be an integer greater than 0',
      'jobs.required': 'Missing jobs field',
      'jobs.array': 'Jobs field needs to be of type array',
      'jobs.min': 'Jobs array needs to have a minimum length of 1'
    }
  }
}

module.exports = InsertJobs
