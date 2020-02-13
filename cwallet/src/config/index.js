let config

export function initConfig() {
  const envConfig = {
    default: {
      DEV: false,
      PORT: 8443,
      SSL: true,
      SSL_CERT_PATH: '/app/tls/cert.pem',
      SSL_KEY_PATH: '/app/tls/key.pem',
      ENABLE_INTROSPECTION: true
    },
    ci: {
      SSL: false,
      PORT: 3000
    },
    dev: {
      DEV: true,
      PORT: 3000,
      SSL: false
    },
    prd: {
      ENABLE_INTROSPECTION: false
    }
  }

  const { APP_ENV = 'dev' } = process.env

  config = {
    ...envConfig.default,
    ...envConfig[APP_ENV],
    APP_ENV
  }
}

export { config }
