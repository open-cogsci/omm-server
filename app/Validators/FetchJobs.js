'use strict'

class FetchJobs {
  get rules () {
    return {
      from: 'integer|above:0',
      to: 'integer|above:0'
    }
  }

  get messages () {
    return {
      'from.integer': 'From parameter is not an integer',
      'from.above': 'From parameter cannot be lower than 1',
      'to.integer': 'To parameter is not an integer',
      'to.above': 'To parameter cannot be lower than 1'
    }
  }

  get sanitizationRules () {
    return {
      from: 'to_int',
      to: 'to_int'
    }
  }
}

module.exports = FetchJobs
