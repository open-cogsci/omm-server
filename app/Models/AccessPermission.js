'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class AccessPermission extends Model {
  /**
   * The study-user relationship this access level refers to.
   *
   * @method studyUser
   *
   * @return {Object}
   */
  studyUser () {
    this.hasMany('App/Models/StudyUser')
  }
}

module.exports = AccessPermission
