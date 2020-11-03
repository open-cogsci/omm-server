const workerpool = require('workerpool')
const XLSX = require('xlsx')
const { isArray } = require('lodash')

// a deliberately inefficient implementation of the fibonacci sequence
function readSheet (path) {
  const workbook = XLSX.readFile(path)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet)
}

function writeSheet (jobs, destination, format = 'csv') {
  const rows = jobs.reduce((result, job) => {
    // If there are multiple entries for data, suffix the object key values
    const { data, trial_vars: trialVars, ...rest } = job
    let iteration = 1
    if (isArray(data)) {
      for (const row of data) {
        result.push({ ...rest, iteration, ...row, ...trialVars })
        iteration += 1
      }
    } else {
      result.push({ ...rest, iteration, ...data, ...trialVars })
    }
    return result
  }, [])
  const sheet = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheet, 'data')
  XLSX.writeFile(wb, destination, { type: format })
  return true
}
// create a worker and register public functions
workerpool.worker({
  readSheet, writeSheet
})
