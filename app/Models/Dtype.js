'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Dtype extends Model {
  variables () {
    return this.hasMany('App/Models/Variable')
  }
}

module.exports = Dtype
