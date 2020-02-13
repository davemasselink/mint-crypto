import balanceCtrl from '../controllers/balanceCtrl'
import walletCtrl from '../controllers/walletCtrl'

export const getTotalHoldings = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')

  try {
    balanceCtrl.getNetBalance(req, res, next)
  } catch (e) {
    console.debug(e)
    res.status(500).send(e.message)
  }
}

export const getWalletAddr = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')

  try {
    walletCtrl.translateXPub(req, res, next)
  } catch (e) {
    console.debug(e)
    res.status(500).send(e.message)
  }
}
