const workerpool = require('workerpool')
const XLSX = require('xlsx')
const { isArray, pick } = require('lodash')

// a deliberately inefficient implementation of the fibonacci sequence
function readSheet (path) {
  const workbook = XLSX.readFile(path)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet)
}

function writeSheet (jobs) {
  const data = jobs.reduce((result, job) => {
    const variables = job.variables.reduce((varList, variable) => {
      varList[variable.name] = variable.pivot.value
      return varList
    }, {})

    for (const ptcp of job.participants) {
      let jobData = {}
      if (ptcp.pivot.data !== null) {
        // If there are multiple entries for data, suffix the object key values
        if (isArray(ptcp.pivot.data)) {
          jobData = ptcp.pivot.data.reduce((total, dataEntry, idx) => {
            if (idx !== 0) {
              dataEntry = Object.entries(dataEntry).reduce((result, [key, value]) => {
                result[`${key}_${idx}`] = value
                return result
              }, {})
            }
            total = {
              ...dataEntry,
              ...total
            }
            return total
          })
        } else {
          jobData = ptcp.pivot.data
        }
      }

      const row = {
        job_id: job.id,
        study_id: job.study_id,
        position: job.position,
        ...pick(ptcp, ['name', 'identifier']),
        ...variables,
        ...jobData
      }
      result.push(row)
    }
    return result
  }, [])
  const sheet = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(sheet)
  return csv
}
// create a worker and register public functions
workerpool.worker({
  readSheet, writeSheet
})
