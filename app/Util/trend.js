const { range } = require('lodash')
const { format, differenceInCalendarDays } = require('date-fns')

module.exports = function (bins, dbData) {
  // Initialize an empty object with all the bins having value 0. This is necessary
  // because the database only returns bin numbers that actually have a value and omits
  // empty bins.
  const baseTrend = range(bins).reduce((result, val) => {
    result[val] = 0
    return result
  }, {})

  // Merge the real bin values into the empty array to get the complete array
  const values = Object.values({
    ...baseTrend,
    ...dbData.reduce((result, entry) => {
      result[entry.bin] = parseInt(entry.amount)
      return result
    }, {})
  })

  // Obtain the dates of the first occurence and the last occurence.
  const labels = { ...baseTrend }
  if (dbData.length > 0) {
    const first = dbData[0]
    const last = dbData.slice(-1)[0]
    const dayFormat = 'd MMM'
    const timeFormat = 'HH:mm'

    // If all participations are on the same day, show the time at the ends of the axis
    // with the day in the center. Otherwise, just show the first and last day at the ends
    // of the axis
    if (differenceInCalendarDays(last.updated_at, first.updated_at) === 0) {
      labels[0] = format(first.updated_at, timeFormat)
      labels[Math.floor(bins / 2)] = format(first.updated_at, dayFormat)
      labels[bins] = format(last.updated_at, timeFormat)
    } else {
      labels[0] = format(first.updated_at, dayFormat)
      labels[bins] = format(last.updated_at, dayFormat)
    }
  }
  return {
    labels: Object.values(labels).map(label => label || ' '),
    values
  }
}
