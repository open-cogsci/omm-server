'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class File extends Model {
  /**
   * The study to which the file belongs
   *
   * @method study
   *
   * @returns {Object}
   * @memberof File
   */
  study () {
    return this.belongsTo('App/Models/Study')
  }
}

module.exports = File
