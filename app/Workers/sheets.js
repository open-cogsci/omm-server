const workerpool = require('workerpool')
const XLSX = require('xlsx')
const { isArray } = require('lodash')
const { formatISO9075 } = require('date-fns')

// a deliberately inefficient implementation of the fibonacci sequence
function readSheet (path) {
  const workbook = XLSX.readFile(path)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet)
}

function writeSheet (jobs, format = 'csv') {
  const rows = jobs.reduce((result, job) => {
    // If there are multiple entries for data, suffix the object key values
    // eslint-disable-next-line camelcase, prefer-const
    let { data, trial_vars, timestamp, ...rest } = job

    if (isArray(data)) {
      data = job.data.reduce((total, dataEntry, idx) => {
        if (idx !== 0) {
          dataEntry = Object.entries(dataEntry).reduce((result, [key, value]) => {
            result[`${key}_${idx}`] = value
            return result
          }, {})
        }
        return { ...dataEntry, ...total }
      })
    }
    result.push({
      ...rest,
      ...data,
      // eslint-disable-next-line camelcase
      ...trial_vars,
      timestamp: formatISO9075(timestamp)
    })
    return result
  }, [])

  const sheet = XLSX.utils.json_to_sheet(rows)
  let formatted
  switch (format) {
    case 'csv':
      formatted = XLSX.utils.sheet_to_csv(sheet)
      break
    case 'xls':
      break

    case 'xlsx':
      break
  }

  return formatted
}
// create a worker and register public functions
workerpool.worker({
  readSheet, writeSheet
})
