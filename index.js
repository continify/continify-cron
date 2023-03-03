const ContinifyPlugin = require('continify-plugin')
const { schedule, getTasks } = require('node-cron')

module.exports = ContinifyPlugin(async function (ins, options) {
  function cron (options) {
    const task = schedule(
      options.expression,
      async () => {
        if (task.$busy) {
          return this.$log.warn(`cron skip: ${options.name}`)
        }

        task.$busy = true
        this.$log.info(`cron execute: ${options.name}`)
        try {
          await options.handler.call(this)
        } catch (err) {
          this.runHook('onError', err)
        }
        task.$busy = false
      },
      {
        scheduled: false,
        timezone: options.timezone
      }
    )

    task.$busy = false
    task.start()
  }

  ins.decorate('cron', cron.bind(ins))
  ins.addHook('onRegister', async function (nIns) {
    nIns.decorate('cron', cron.bind(nIns))
  })

  ins.addHook('onClose', async function () {
    const tasks = getTasks()
    for (const t of tasks) {
      t[1].stop()
    }
  })
})
