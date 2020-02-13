import bunyan from 'bunyan'
import loggerFormat from 'bunyan-format'

import { config } from '../config'

let log

export function initLogger() {
  log = bunyan.createLogger({
    name: 'nsa',
    env: config.APP_ENV,
    stream: loggerFormat({ outputMode: config.DEV ? 'short' : 'json' }),
    level: config.DEV ? 'debug' : 'info',
    serializers: bunyan.stdSerializers
  })
}

export { log }
