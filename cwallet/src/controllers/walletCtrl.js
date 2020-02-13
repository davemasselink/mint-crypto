import { parse as parseUrl } from 'url'
import Wallet from 'ethereumjs-wallet'

const translateXPub = (req, res, next) => {
  const search = parseUrl(req.url).query
  const { xpub } = JSON.parse(
    `{"${search.replace(/&/g, '","').replace(/=/g, '":"')}"}`,
    (key, value) => (key === '' ? value : decodeURIComponent(value))
  )
  const addr = Wallet.fromExtendedPublicKey(xpub).getAddressString()
  res.write(JSON.stringify(addr))
  res.end()
  next()
}

exports.translateXPub = translateXPub
