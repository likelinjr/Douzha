import debug from 'debug'

export const toolLog = debug('app:tool')
export const thinkLog = debug('app:think')
export const commonLog = debug('app:common')

export const DEBUG_THINK = process.env.DEBUG_THINK === 'true'
export const DEBUG_DECIDE = process.env.DEBUG_DECIDE === 'true'
export const DEBUG_CHAT = process.env.DEBUG_CHAT === 'true'