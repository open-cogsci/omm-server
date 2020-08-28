'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Database = use('Database')
/**
*  @swagger
*  definitions:
*    Participant:
*      type: object
*      properties:
*        id:
*          type: integer
*          example: 42
*        name:
*          type: string
*          example: Benny Banana
*        identifier:
*          type: string
*          example: AxcSDD
*        active:
*          type: boolean
*        created_at:
*          type: string
*          format: date-time
*        updated_at:
*          type: string
*          format: date-time
*      required:
*        - name
*        - identifier
*    ParticipantWithRelations:
*      allOf:
*         - $ref: '#/definitions/Participant'
*         - type: object
*           properties:
*             studies:
*               type: array
*               items:
*                 $ref: '#/definitions/StudyWithRelations'
*/
class Participant extends Model {
  studies () {
    return this
      .belongsToMany('App/Models/Study')
      .pivotModel('App/Models/Participation')
      .withPivot(['status_id', 'created_at', 'updated_at'])
  }

  jobs () {
    return this
      .belongsToMany('App/Models/Job')
      .pivotModel('App/Models/JobState')
      .withPivot(['data', 'status_id'])
  }

  async getStudiesProgress () {
    return (await Database.raw(`
      SELECT
        studies.id AS id,
        active,
        name,
        description,
        COALESCE(jc.jobs_count, 0) AS jobs_count,
        CONVERT(COALESCE(jc.completed, 0), UNSIGNED) AS completed_jobs_count
      FROM
        studies
      LEFT JOIN(
        SELECT
          study_id, COUNT(*) AS jobs_count, SUM(cc.amount) AS completed
        FROM
          jobs
        LEFT JOIN (
          SELECT
            job_id, COUNT(*) AS amount
          FROM
            job_states
          WHERE
            status_id = 3 AND participant_id = ?
          GROUP BY job_id
        ) AS cc ON jobs.id = cc.job_id
        GROUP BY study_id
      ) AS jc ON studies.id = jc.study_id
      LEFT JOIN participations ON studies.id = participations.study_id
      WHERE participations.participant_id = ?
      GROUP BY studies.id , name , description , jobs_count , completed_jobs_count
    `, [this.id, this.id]))[0]
  }
}

module.exports = Participant
