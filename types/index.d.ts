import { Continify } from 'continify'

export interface CronJob {
  $name: string

  start(): void
  stop(): void
}

export interface ContinifyCronOptions {
}

export type ContinifyCronPlugin = (
  ins: Continify,
  options: ContinifyCronOptions
) => Promise<void>

export type CronHandler = (
  this: Continify,
  job: CronJob
) => Promise<void> | void

export type OnCronBeforeHandler = (
  this: Continify,
  job: CronJob
) => Promise<void> | void

export type OnCronAfterHandler = (
  this: Continify,
  job: CronJob
) => Promise<void> | void

export interface CronOptions {
  name: string
  time: string
  timezone?: string
  handler: CronHandler
}

declare const plugin: ContinifyCronPlugin
export = plugin

declare module 'avvio' {
  interface Use<I, C = context<I>> {
    (fn: ContinifyCronPlugin, options?: ContinifyCronOptions): C
  }
}

declare module 'continify' {
  interface Continify {
    $cronJobs: CronJob[]
    cron(options: CronOptions): Continify

    addHook(name: 'onBeforeCron', fn: OnCronBeforeHandler): Continify
    addHook(name: 'onAfterCron', fn: OnCronAfterHandler): Continify

    runHook(name: 'onBeforeCron', job: CronJob): Continify
    runHook(name: 'onAfterCron', job: CronJob): Continify
  }
}
