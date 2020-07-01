'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
/**
*  @swagger
*  definitions:
*    Dtype:
*      type: object
*      properties:
*        id:
*          type: integer
*        name:
*          type: string
*/
class Dtype extends Model {
  variables () {
    return this.hasMany('App/Models/Variable')
  }
}

module.exports = Dtype
