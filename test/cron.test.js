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

tap.test('cron: runOnInit', async t => {
  const ins = Continify()
  ins.register(ContinifyCron, { runOnInit: true })

  await ins.ready()
  t.plan(1)

  ins.cron({
    name: 'cron-1',
    time: '* * * * * *',
    handler () {
      t.equal(this.$fullname, 'root')
      ins.close()
    }
  })

  await waitClose(ins)
})

tap.test('cron:scope 0', async t => {
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

tap.test('cron:scope 1', async t => {
  t.plan(1)

  const ins = Continify()
  ins.register(ContinifyCron)

  ins.register(
    async function (i1) {
      i1.register(
        async function (i2) {
          i2.cron({
            name: 'cron-scope',
            time: '* * * * * *',
            handler (job) {
              t.equal(job.$fullname, 'i1.i2.cron-scope')
              ins.close()
            }
          })
        },
        { name: 'i2' }
      )
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
    t.equal(job.$fullname, 'i1.cron-hook')
  })

  ins.addHook('onAfterCron', async function (job) {
    t.equal(job.$fullname, 'i1.cron-hook')
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
    t.equal(job.$fullname, 'i1.cron-hook')
  })

  ins.addHook('onAfterCron', async function (job) {
    t.equal(job.$fullname, 'i1.cron-hook')
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
