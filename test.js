// process.env['CONTINIFY_CRON_RUN-ON-INIT'] = true

const Continify = require('continify')
const ContinifyCron = require('.')

async function init () {
  const ins = Continify()
  ins.register(ContinifyCron)

  await ins.ready()

  ins.cron({
    name: 'cron-0',
    time: '* * * * * *',
    handler () {
      // console.log(this)
      ins.close()
    }
  })
}

init()

// const CronJob = require('cron').CronJob
// const job = new CronJob(
//   '* * * * * *',
//   function () {
//     console.log(this)

//     job.stop()
//     console.log('You will see this message every second')
//   },
//   null,
//   true,
//   'America/Los_Angeles',
//   { a: 11 }
// )

// console.log(job)
