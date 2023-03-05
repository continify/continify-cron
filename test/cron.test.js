const tap = require('tap')
const Continify = require('continify')
const ContinifyCron = require('..')

function waitClose (ins) {
  return new Promise(resolve => {
    ins.addHook('onClose', resolve)
  })
}

function timeout () {
  return new Promise(resolve => {
    setTimeout(resolve, 1500)
  })
}

tap.test('cron', async t => {
  const ins = Continify()
  ins.register(ContinifyCron)

  await ins.ready()
  t.plan(1)

  ins.cron({
    name: 'cron-0',
    time: '* * * * * *',
    handler () {
      t.equal(this.$fullname, 'root')
      ins.close()
    }
  })

  await waitClose(ins)
})

tap.test('cron:scope', async t => {
  t.plan(1)

  const ins = Continify()
  ins.register(ContinifyCron)

  ins.register(
    async function (i1) {
      i1.cron({
        name: 'cron-scope',
        time: '* * * * * *',
        handler () {
          t.equal(this.$fullname, 'root.i1')
          ins.close()
        }
      })
    },
    { name: 'i1' }
  )

  await ins.ready()
  await waitClose(ins)
})

tap.test('cron:timeout', async t => {
  t.plan(1)

  const ins = Continify()
  ins.register(ContinifyCron)

  ins.register(
    async function (i1) {
      i1.cron({
        name: 'cron-timeout',
        time: '* * * * * *',
        async handler () {
          t.equal(this.$fullname, 'root.i1')
          await timeout()
          ins.close()
        }
      })
    },
    { name: 'i1' }
  )

  await ins.ready()
  await waitClose(ins)
})

tap.test('cron:error', async t => {
  t.plan(1)

  const ins = Continify()
  ins.register(ContinifyCron)

  ins.addHook('onError', function (err) {
    t.equal(err.message, 'cron error')
    ins.close()
  })

  ins.register(
    async function (i1) {
      i1.cron({
        name: 'cron-timeout',
        time: '* * * * * *',
        async handler () {
          throw new Error('cron error')
        }
      })
    },
    { name: 'i1' }
  )

  await ins.ready()
  await waitClose(ins)
})

tap.test('cron:hook', async t => {
  t.plan(2)

  const ins = Continify()
  ins.register(ContinifyCron)

  ins.addHook('onBeforeCron', async function (job) {
    t.equal(job.$name, 'cron-hook')
  })

  ins.addHook('onAfterCron', async function (job) {
    t.equal(job.$name, 'cron-hook')
    this.close()
  })

  ins.register(
    async function (i1) {
      i1.cron({
        name: 'cron-hook',
        time: '* * * * * *',
        async handler () {}
      })
    },
    { name: 'i1' }
  )

  await ins.ready()
  await waitClose(ins)
})

tap.test('cron:hook error', async t => {
  t.plan(3)

  const ins = Continify()
  ins.register(ContinifyCron)

  ins.addHook('onError', function (err) {
    t.equal(err.message, 'cron error')
    ins.close()
  })

  ins.addHook('onBeforeCron', async function (job) {
    t.equal(job.$name, 'cron-hook')
  })

  ins.addHook('onAfterCron', async function (job) {
    t.equal(job.$name, 'cron-hook')
    throw new Error('cron error')
  })

  ins.register(
    async function (i1) {
      i1.cron({
        name: 'cron-hook',
        time: '* * * * * *',
        async handler () {}
      })
    },
    { name: 'i1' }
  )

  await ins.ready()
  await waitClose(ins)
})
