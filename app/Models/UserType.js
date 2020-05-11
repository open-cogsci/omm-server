'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class UserType extends Model {
  /**
   * The users that are of this user type
   *
   * @method user
   *
   * @return {Object}
   */
  users () {
    return this.hasMany('App/Models/User')
  }
}

module.exports = UserType
