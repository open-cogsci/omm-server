'use strict'

class SetJobStates {
  get rules () {
    return {
      from: 'required|integer|above:0',
      to: 'required|integer|above:0',
      state: 'required|integer|range:0,4'
    }
  }

  get messages () {
    return {
      'from.required': 'From parameter is required',
      'to.required': 'To parameter is required',
      'state.required': 'State (id) parameter is required',
      'from.integer': 'From parameter is not an integer',
      'to.integer': 'To parameter is not an integer',
      'state.integer': 'State parameter is not an integer',
      'to.above': 'To parameter cannot be lower than 1',
      'from.above': 'From parameter cannot be lower than 1',
      'state.range': 'State should be one of 1 (pending), 2 (started), or 3 (finished)'
    }
  }

  get sanitizationRules () {
    return {
      from: 'to_int',
      to: 'to_int',
      state: 'to_int'
    }
  }
}

module.exports = SetJobStates
