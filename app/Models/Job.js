'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
/**
*  @swagger
*  definitions:
*    Job:
*      type: object
*      properties:
*        id:
*          type: integer
*        study_id:
*          type: integer
*        order:
*          type: integer
*        created_at:
*          type: string
*          format: date-time
*        updated_at:
*          type: string
*          format: date-time
*      required:
*        - name
*    JobWithRelations:
*      allOf:
*         - $ref: '#/definitions/Job'
*         - type: object
*           properties:
*             study:
*               $ref: '#/definitions/Study'
*/

class Job extends Model {
  study () {
    return this.belongsTo('App/Model/Study')
  }

  fields () {
    return this.manyThrough('App/Model/Study', 'jobFields')
  }

  fieldValues () {
    return this.hasMany('App/Model/JobFieldValue')
  }

  states () {
    return this.hasMany('App/Model/JobState')
  }

  results () {
    return this.hasMany('App/Model/JobResults')
  }
}

module.exports = Job
