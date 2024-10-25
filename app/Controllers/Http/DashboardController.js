'use strict'

const Database = use('Database')
const JobState = use('App/Models/JobState')

class DashboardController {
  /**
   * Get data about participations (job result count over time)
   * 
   * In the input (via request entry 'type') it accepts 'day', 'week', 'month', or 'year'.
   * 
   * It returns an object with 'values' (array of job result counts), 'labels' (array of strings), 'bins' (array of categories used to group by the data)
   *
   * @param {*} { request, auth }
   * @return {*}
   * @memberof DashboardController
   */
  async participationTrend ({ request, auth }) {
    const trendType = request.input('type', 'week')
    const userID = auth.user.id

    let sqlDateFormat // Used in SQL query
    let sqlDateComponent // Used in SQL query
    let sqlDatePeriod // Used in SQL query
    let dates // Used for intermediate calculation of bins and labels
    let bins // Used in the end to generate final values that include count 0
    let labels // String representation of the bins
    const now = new Date()
    switch(trendType) {
      case 'day':
        // 24 hours
        // bins: numeric hours, e.g. 1
        // labels: hours as string, e.g. 1:00
        sqlDateFormat = "%H" // aligns with bins data format
        sqlDateComponent = 'HOUR'
        sqlDatePeriod = 24
        bins = [...Array(sqlDatePeriod)]
            .map((_, i) => (now.getHours() - i))
            .map(e => e > 0 ? e : 24 + e)
            .reverse()
        labels = bins.map((e) => e + ":00")
        break
      case 'week':
        // 7 days
        // bins: numeric days of month, e.g. 30
        // labels: week days as string, e.g. Monday
        sqlDateFormat = "%d" // aligns with bins data format
        sqlDateComponent = 'DAY'
        sqlDatePeriod = 7
        dates = [...Array(sqlDatePeriod)]
            .map((_, i) => {
              const d = new Date(now.getTime())
              d.setDate(d.getDate() - i)
              return d
            })
            .reverse()
        bins = dates.map(d => d.getDate()) 
        labels = dates.map(d => d.toLocaleDateString('en-gb', {  weekday: 'long' }))
        break
      case 'month':
        // 30 days
        // bins: days of month as string with format 'month-day', e.g. '10-30'
        // labels: day of month as string, e.g. 10/30
        sqlDateFormat = "%m-%d" // aligns with bins data format
        sqlDateComponent = 'DAY'
        sqlDatePeriod = 30
        dates = [...Array(sqlDatePeriod)]
            .map((_, i) => {
              const d = new Date(now.getTime())
              d.setDate(d.getDate() - i)
              return d
            }).reverse()
        bins = dates.map(d => d.getFullMonth() + '-' + d.getFullDay())
        labels = dates.map(d => d.toLocaleDateString("en-gb", {month: "2-digit", day: "numeric"}))
        break
      case 'year':
        // 12 months
        // bins: month of year as string with format 'year-month', e.g. '2024-11'
        // labels: month names, e.g. October
        sqlDateFormat = "%Y-%m" // aligns with bins data format
        sqlDateComponent = 'MONTH'
        sqlDatePeriod = 12
        dates = [...Array(sqlDatePeriod)]
            .map((_, i) => {
              const d = new Date(now.getTime())
              d.setMonth(d.getMonth() - i)
              return d
            }).reverse()
        bins = dates.map(d => d.getFullYear() + '-' + d.getFullMonth())
        labels = dates.map(d => d.toLocaleDateString("en-gb", {month: "long"}))
        break
      default:
        console.error("Wrong trend type: %t", trendType)
        return {}
    }

    const result = (await Database.raw(`
      SELECT
        DATE_FORMAT(job_results.created_at, "${sqlDateFormat}") as bin,
        COUNT(job_results.id) as count
      FROM
        job_results
      LEFT JOIN
        study_users ON job_results.study_id = study_users.study_id
      WHERE
        study_users.user_id = ${userID}
        AND job_results.created_at >= DATE_SUB(NOW(), INTERVAL ${sqlDatePeriod} ${sqlDateComponent})
      GROUP BY
        bin
      ORDER BY
        bin
    `))[0]

    // Turn result into a new Map with bin:count as key:value
    const countPerBin = Object.fromEntries(result.map(e => [e.bin, e.count]))
    
    // Generate final values: the data from the database doesn't contain empty bins - adding bins with count 0 for empty bins
    const values = bins.map(g => countPerBin[g] ?? 0)
    return { data: { labels: labels, values: values, bins: bins }}
  }

  /**
   * Gets the most recent participations (per unique participant)
   *
   * @param {*} { request, auth }
   * @return {*}
   * @memberof DashboardController
   */
  async mostRecentParticipations ({ request, auth }) {
    const limit = request.input('limit', 1000)
    const data = await JobState.query()
      .select('participants.name AS participant',
        'participants.identifier',
        'studies.name AS study',
        Database.raw('MAX(job_states.updated_at) AS occurrence'))
      .leftJoin('participants', 'job_states.participant_id', 'participants.id')
      .leftJoin('jobs', 'job_states.job_id', 'jobs.id')
      .leftJoin('studies', 'jobs.study_id', 'studies.id')
      .leftJoin('study_users', 'studies.id', 'study_users.study_id')
      .where('study_users.user_id', auth.user.id)
      .where('job_states.status_id', 3) // job state status 'finished'
      .where('studies.active', 1)
      .groupByRaw('identifier, participant, study')
      .orderBy('occurrence', 'desc')
      .limit(limit)
      .fetch()
    return { data }
  }

  /**
   * Gets the most active studies
   *
   * @param {*} { request, auth }
   * @return {*}
   * @memberof DashboardController
   */
  async mostActiveStudies ({ request, auth }) {
    const limit = request.input('limit', 1000)
    const days = request.input('days', 7)
    const data = await JobState.query()
      .select(
        Database.raw('COUNT(*) as participations'),
        'studies.id',
        'studies.name'
      )
      .leftJoin('jobs', 'job_states.job_id', 'jobs.id')
      .leftJoin('studies', 'jobs.study_id', 'studies.id')
      .leftJoin('study_users', 'studies.id', 'study_users.study_id')
      .where('study_users.user_id', auth.user.id)
      .where('studies.active', 1)
      .whereRaw('job_states.updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)', [days])
      .whereNot('job_states.status_id', 1) // job state status 'pending'
      .groupByRaw('studies.name, studies.id')
      .orderBy('participations', 'desc')
      .limit(limit)
      .fetch()
    return { data }
  }

  /**
   * Gets the most active participants over all studies, thus also not from the current user
   *
   * @param {*} { request }
   * @return {*}
   * @memberof DashboardController
   */
  async mostActiveParticipants ({ request }) {
    const limit = request.input('limit', 1000)
    const days = request.input('days', 7)
    const data = await JobState.query()
      .select('participants.name',
        'participants.identifier',
        Database.raw('COUNT(*) as participations')
      )
      .leftJoin('participants', 'job_states.participant_id', 'participants.id')
      .whereRaw('job_states.updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)', [days])
      .whereNot('job_states.status_id', 1) // job state status 'pending'
      .groupByRaw('name, identifier')
      .orderBy('participations', 'desc')
      .limit(limit)
      .fetch()
    return { data }
  }
}

Date.prototype.getFullDay = function() {
  const day = this.getDate();
  return day < 10 ? '0' + day : '' + day;
}

Date.prototype.getFullMonth = function() {
  const month = this.getMonth() + 1;
  return month < 10 ? '0' + month : '' + month;
}

module.exports = DashboardController
