const Continify = require('continify')
const ContinifyCron = require('.')

function timeout () {
  return new Promise(resolve => {
    setTimeout(resolve, 2000)
  })
}

async function init () {
  const ins = Continify()
  ins.register(ContinifyCron)
  await ins.ready()

  ins.cron({
    name: 'test cron',
    expression: '*/1 * * * * *',
    async handler () {
      console.log('cron schedule:' + this.$fullname)
      await timeout()
    }
  })

  setTimeout(() => {
    ins.close()
  }, 10000)
}

init()
