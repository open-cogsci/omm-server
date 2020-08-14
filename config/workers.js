const os = require('os')
const cpuCount = os.cpus().length

const Env = use('Env')

module.exports = {
  /*
  minWorkers: number | 'max'.

  The minimum number of workers that must be initialized and kept available.
  Setting this to 'max' will create maxWorkers default workers (see below).
  */
  minWorkers: Env.get('MIN_WORKERS', 'max'),

  /*
  maxWorkers: number.

  The default number of maxWorkers is the number of CPU's minus one.
  When the number of CPU's could not be determined (for example in older browsers),
  maxWorkers is set to 3.
  */
  maxWorkers: Env.get('MAX_WORKERS', cpuCount - 1),

  /*
  maxQueueSize: number.

  The maximum number of tasks allowed to be queued. Can be used to prevent running out of memory.
  If the maximum is exceeded, adding a new task will throw an error. The default value is Infinity.
  */
  maxQueueSize: Env.get('MAX_QUEUE_SIZE', Infinity),

  /*
  workerType: 'auto' | 'web' | 'process' | 'thread'.

  In case of 'auto' (default), workerpool will automatically pick a suitable type of worker: when in a browser environment, 'web' will be used. When in a node.js environment, worker_threads will be used if available (Node.js >= 11.7.0), else child_process will be used.
  In case of 'web', a Web Worker will be used. Only available in a browser environment.
  In case of 'process', child_process will be used. Only available in a node.js environment.
  In case of 'thread', worker_threads will be used. If worker_threads are not available, an error is thrown. Only available in a node.js environment.
  */
  workerType: Env.get('WORKER_TYPE', 'auto')
}
