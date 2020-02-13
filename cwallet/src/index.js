import express from 'express'
import http from 'http'
import https from 'https'
import { readFileSync } from 'fs'
import { parse as parseUrl } from 'url'
import { ApolloServer } from 'apollo-server-express'
import { renderPlaygroundPage } from '@apollographql/graphql-playground-html'

import { initConfig, config } from './config'
import { initLogger, log } from './lib/log'

import * as health from './routes/health'
import { getTotalHoldings, getWalletAddr } from './routes/users'

import typeDefs from './schema/typeDefs'
import resolvers from './schema/resolvers'

async function init() {
  // Initialize
  initConfig()
  initLogger()
}

// export for the tests
export default init()
  .then(() => {
    const path = '/graphql'
    const app = express()

    app.get('/health/full', health.full)
    app.get('/health/version', health.version)

    // add playground with options allowing for query params propagation
    app.use(path, authHandler, (req, res, next) => {
      if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html')
        const playground = renderPlaygroundPage({
          settings: {
            'request.credentials': 'same-origin'
          },
          tabs: [
            {
              endpoint: `${path}?${parseUrl(req.url).query}`
            }
          ]
        })
        res.write(playground)
        res.end()
        return
      }
      next()
    })

    // get coin balance
    app.get('/users/:id/balances', getTotalHoldings)

    // translate BTC xpub to addr
    app.use('/keyTranslator', getWalletAddr)

    app.disable('x-powered-by')

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: config.ENABLE_INTROSPECTION,
      playground: false
    })
    server.applyMiddleware({ app, path })

    let protocol
    if (config.SSL) {
      protocol = https.createServer(
        {
          key: readFileSync(config.SSL_KEY_PATH),
          cert: readFileSync(config.SSL_CERT_PATH)
        },
        app
      )
    } else {
      protocol = http.createServer(app)
    }
    protocol.listen(config.PORT, () => log.info(`Listening on ${config.PORT}`))
  })
  .catch(err => {
    log.error({ err }, 'Service failed to initialize')
    process.exit(1)
  })
