const ContinifyPlugin = require('continify-plugin')
const { CronJob } = require('cron')

const kCronPrefix = Symbol('continify.cron.prefix')

function defaultRunHookPromise (name, job) {
  return new Promise((resolve, reject) => {
    const next = err => {
      if (err) reject(err)
      else resolve()
    }
    this.runHook(name, job, next)
  })
}

module.exports = ContinifyPlugin(async function (ins, options) {
  const cronJobs = []

  async function fireOnTick () {
    const { context } = this

    if (this.$busy) {
      return context.$log.warn(`cron busy: ${this.$fullname}`)
    }

    this.$busy = true
    context.$log.info(`cron execute: ${this.$fullname}`)
    await defaultRunHookPromise.call(context, 'onBeforeCron', this)
    try {
      await this.$handler.call(this.context, this)
      await defaultRunHookPromise.call(context, 'onAfterCron', this)
    } catch (err) {
      err.name = this.$name
      await defaultRunHookPromise.call(context, 'onError', err)
    }
    this.$busy = false
  }

  function cron (options) {
    const { name, time, timezone, handler } = options

    const job = new CronJob(time, null, null, false, timezone, this)

    cronJobs.push(job)

    const prefix = this[kCronPrefix]

    job.$fullname = `${prefix}.${name}`
    job.$fullname = job.$fullname.substring(1)

    job.$handler = handler
    job.$name = name
    job.$busy = false
    job.fireOnTick = fireOnTick

    job.start()
  }

  ins[kCronPrefix] = ''
  ins.decorate('$cronJobs', cronJobs)
  ins.decorate('cron', cron.bind(ins))
  ins.addHook('onRegister', async function (nIns) {
    const prefix = nIns[kCronPrefix]
    nIns[kCronPrefix] = `${prefix}.${nIns.$name}`

    nIns.decorate('cron', cron.bind(nIns))
  })

  ins.addHook('onClose', async function () {
    for (const job of cronJobs) {
      job.stop()
    }
  })
})
