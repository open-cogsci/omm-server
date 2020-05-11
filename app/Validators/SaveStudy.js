'use strict'

class SaveStudy {
  get rules () {
    return {
      // validation rules
      name: 'required|max:50',
      description: 'max:100'
    }
  }
}

module.exports = SaveStudy
