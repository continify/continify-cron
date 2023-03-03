import { Continify } from 'continify'

export interface ContinifyCronOptions {
}

export type ContinifyCronPlugin = (
  ins: Continify,
  options: ContinifyCronOptions
) => Promise<void>

export type CronHandler = (
  this: Continify
) => Promise<void> | void

export interface CronOptions {
  name: string
  expression: string
  handler: CronHandler
  timezone?: string
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
    cron(options: CronOptions): Continify
  }
}
