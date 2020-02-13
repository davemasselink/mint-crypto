import Coin from '../model/coin'

const axios = require('axios')

const supportedCoins = { BTC: 1, ETH: 1, LTC: 1 }

// ///////// PRIVATE ///////////

// helper function to retrieve coin price
const _getPrice = async coin => {
  try {
    const resp = await axios.get(coin.usdPriceUrl)
    const price = await parseFloat(resp.data[0].price_usd)

    // const rank = parseInt(resp.data[0]['rank'])

    return price
  } catch (error) {
    console.log(`error in _getPrice for ${coin.name}`, error)
    throw error
  }
}

// helper function to retrieve coin balance
const _getBalance = async coin => {
  try {
    let balance = 0

    for (const addr of coin.addrs) {
      let resp = null

      try {
        // eslint-disable-next-line no-await-in-loop
        resp = await axios.get(coin.balanceUrl + addr)
      } catch (error) {
        // gulp
        console.log(`ERROR: getBalance: ${coin.name} addr:${addr} `, error.message)
      }

      let coinAddrBalance = 0

      try {
        if (resp && resp.data && !Number.isNaN(Number.parseFloat(resp.data[coin.balanceProp]))) {
          // eslint-disable-next-line no-await-in-loop
          coinAddrBalance = await parseFloat(resp.data[coin.balanceProp] / coin.balanceScaleFactor)
        }
      } catch (error) {
        console.log(`ERROR: coinAddrBalance: ${coin.name} addr:${addr} `, error.message)
      }

      // console.log(`+adding coinAddrBalance: ${coin.name} addr:${addr} = ${coinAddrBalance}`);

      balance += coinAddrBalance
    }

    console.log(`getBalance: ${coin.name} balance: `, balance)
    return balance
  } catch (error) {
    console.log(`error in _getBalance for ${coin.name}`, error)
    throw error
  }
}

// async function to combine price and balance into coin holdings
const _getCoinUsdBalance = async coin => {
  try {
    const price = await _getPrice(coin)
    const balance = await _getBalance(coin)
    console.log(`${coin.name} QTY: `, coin.qty)

    // add coin qty from user
    coin.qty = balance + coin.qty

    console.log(`${coin.name} price: `, price)
    console.log(`${coin.name} balance: `, coin.qty)

    return price * coin.qty
  } catch (error) {
    console.log(`error in _getCoinUsdBalance for ${coin.name}`, error)
    throw error
  }
}

// Util
const _getCoinsConfig = reqQuery => {
  // create coins
  const coins = []
  const addr = []
  addr.push(reqQuery.addr)

  let qty = 0
  try {
    const t = parseInt(reqQuery.qty, 10)
    if (!Number.isNaN(t)) {
      qty = t
    }
  } catch (e) {
    // gulp
  }

  console.debug(`${reqQuery.coinType} : ${reqQuery.qty} : Addresses = ", ${reqQuery.addr}`)

  // btc
  if (reqQuery.coinType === 'BTC') {
    coins.push(
      new Coin(
        'BTC',
        6993875,
        'https://api.coinmarketcap.com/v1/ticker/bitcoin/',
        addr,
        qty,
        'https://blockchain.info/rawaddr/',
        1e8,
        'final_balance'
      )
    )
  }

  // eth
  if (reqQuery.coinType === 'ETH') {
    coins.push(
      new Coin(
        'ETH',
        0,
        'https://api.coinmarketcap.com/v1/ticker/ethereum/',
        addr,
        qty,
        'https://api.etherscan.io/api?module=account&action=balance&address=',
        1e18,
        'result'
      )
    )
  }

  // zec
  if (reqQuery.coinType === 'ZEC') {
    coins.push(
      new Coin(
        'ZEC',
        0,
        'https://api.coinmarketcap.com/v1/ticker/zcash/',
        addr,
        qty,
        'https://api.zcha.in/v2/mainnet/accounts/',
        1,
        'balance'
      )
    )
  }

  // bch
  if (reqQuery.coinType === 'BCH') {
    coins.push(
      new Coin(
        'BCH',
        0,
        'https://api.coinmarketcap.com/v1/ticker/bitcoin-cash/',
        addr,
        qty,
        'https://bitcoincash.blockexplorer.com/api/addr/',
        1,
        'balance'
      )
    )
  }

  // ltc
  if (reqQuery.coinType === 'LTC') {
    coins.push(
      new Coin(
        'LTC',
        0,
        'https://api.coinmarketcap.com/v1/ticker/litecoin/',
        addr,
        qty,
        'https://api.blockcypher.com/v1/ltc/main/addrs/',
        1e8,
        'balance'
      )
    )
  }

  return coins
}

// ///////////////////////////////////
// /////////// PUBLIC ///////////////
// /////////////////////////////////

function getNetBalance(req, res) {
  const startTime = new Date().getTime()

  const reqQuery = req.query

  /*
  {
    "coinType": "BTC",
    "qty": 0,
    "addr": "13tswV3GH6JSYDA8ogkci7DhHCryk3mmsz"
  }
   */

  if (!reqQuery.hasOwnProperty('coinType')) {
    res.status(400).send('Coin Type missing')
  }

  if (!(reqQuery.hasOwnProperty('qty') || reqQuery.hasOwnProperty('addr'))) {
    res.status(400).send('Address or Quantity required.')
  }

  if (reqQuery.hasOwnProperty('coinType') && !supportedCoins[reqQuery.coinType.toUpperCase()]) {
    console.log(`${reqQuery.coinType} not supported. 
                Supported Coins: ${JSON.stringify(supportedCoins)}`)

    res.status(400).send(`${reqQuery.coinType} not supported`)
  }

  if (reqQuery.hasOwnProperty('addr')) {
    console.log(`Addr:: ${reqQuery.addr}`)
  }

  const coins = _getCoinsConfig(reqQuery)
  console.debug('$$ Coins', coins)

  // eslint-disable-next-line no-unused-vars
  let totalHoldings = 0
  const costBasis2017 = 0
  const costBasis2018 = 0
  // eslint-disable-next-line no-unused-vars
  const totalCostBasis = costBasis2017 + costBasis2018
  // eslint-disable-next-line no-unused-vars
  const coinCnt = coins.length
  // eslint-disable-next-line no-unused-vars
  let balanceCnt = 0
  let response = null
  let endTime = null

  if (coins && Array.isArray(coins)) {
    const coin = coins[0]
    _getCoinUsdBalance(coin)
      .then(coinUsdBalance => {
        balanceCnt += 1
        totalHoldings += coinUsdBalance

        endTime = new Date().getTime()

        console.debug(`NET BALANCE: ${coinUsdBalance} in ${coin.name}`)

        response = {
          coinType: reqQuery.coinType,
          qty: coin.qty,
          addr: reqQuery.addr,
          unit: 'USD',
          totalHolding: coinUsdBalance,
          requestDurationSec: (endTime - startTime) / 1000
        }

        res.status(200).send(response)
      })
      .catch(err => {
        // gulp
        console.log(err)
      })
  } else {
    endTime = new Date().getTime()
    response = {
      coinType: reqQuery.coinType,
      qty: reqQuery.qty,
      addr: reqQuery.addr,
      unit: 'USD',
      totalHolding: 0,
      requestDurationSec: (endTime - startTime) / 1000
    }

    res.status(200).send(response)
  }
}

exports.getNetBalance = getNetBalance
