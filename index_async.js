const pepperMint = require('pepper-mint');
const https = require('https');
const axios = require('axios');
//Next two lines to "allow insecure SSL" which seems to be necessary for
//BTG block explorer
//const process = require('process');
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

class Coin {
  constructor(name, mintAcctId, usdPriceUrl, addrs, balanceUrl,
  balanceScaleFactor, balanceProp) {
    this.name = name;
    this.mintAcctId = mintAcctId;
    this.usdPriceUrl = usdPriceUrl;
    this.addrs = addrs;
    this.balanceUrl = balanceUrl;
    this.balanceScaleFactor = balanceScaleFactor;
    this.balanceProp = balanceProp;
  }
}

// create coins
let coins = [];

//btc
let btcAddrs = [];
coins.push(new Coin('BTC', 0, 'https://api.coinmarketcap.com/v1/ticker/bitcoin/',
btcAddrs, 'https://blockchain.info/rawaddr/', 1e8, 'final_balance'));

//eth
let ethAddrs = [];
coins.push(new Coin('ETH', 0, 'https://api.coinmarketcap.com/v1/ticker/ethereum/',
ethAddrs, 'https://api.etherscan.io/api?module=account&action=balance&address=',
1e18, 'result'));

// zec
let zecAddrs = [];
coins.push(new Coin('ZEC', 0, 'https://api.coinmarketcap.com/v1/ticker/zcash/',
zecAddrs, 'https://api.zcha.in/v2/mainnet/accounts/', 1, 'balance'));

//bch
let bchAddrs = [];
coins.push(new Coin('BCH', 0, 'https://api.coinmarketcap.com/v1/ticker/bitcoin-cash/',
bchAddrs, 'https://bitcoincash.blockexplorer.com/api/addr/', 1, 'balance'));

//btg
//let btgAddrs = [];
//coins.push(new Coin('BTG', 0, 'https://api.coinmarketcap.com/v1/ticker/bitcoin-gold/',
//btgAddrs, 'https://btgexp.com/ext/getaddress/', 1, 'balance'));

//ltc
let ltcAddrs = [];
coins.push(new Coin('LTC', 0, 'https://api.coinmarketcap.com/v1/ticker/litecoin/',
ltcAddrs, 'https://api.blockcypher.com/v1/ltc/main/addrs/', 1e8, 'balance'));

//helper function to retrieve coin price
getPrice = (coin) => {
  return new Promise((resolve, reject) => {
    axios.get(coin.usdPriceUrl)
    .then((resp) => {
      const price = parseFloat(resp.data[0]['price_usd']);
      const rank = parseInt(resp.data[0]['rank']);
      console.log('#' + rank + '-' + coin.name + ' price: ', price);
      resolve(price);
    })
    .catch((error) => {
      reject(error);
    });
  });
};

//helper function to retrieve coin balance
getBalance = (coin) => {
  return new Promise((resolve, reject) => {
    const addrCnt = coin.addrs.length;
    let respCnt = 0;
    let balance = 0;
    coin.addrs.forEach((addr) => {
      axios.get(coin.balanceUrl + addr)
      .then((resp) => {
        respCnt += 1;
        balance  += parseFloat(resp.data[coin.balanceProp]/coin.balanceScaleFactor);
        console.log(coin.name + ' balance: ', balance);
        if (respCnt >= addrCnt) {
          resolve(balance);
        }
      })
      .catch((error) => {
        reject(error);
      });
    });
  });
};

// async function to combine price and balance into coin holdings
const getCoinUsdBalance = async (coin) => {
  let price = await getPrice(coin);
  let balance = await getBalance(coin);
  return price * balance
};

//Time to update Mint
let user = "email@server.com";
let pass = "";

pepperMint(user, pass)
.then((mint) => {
  console.log("Logged into Mint at:" + new Date().toISOString());

  /*
  //UNCOMMENT BLOCK TO LIST ACCOUNTS
  mint.getAccounts().then((accounts) => {
    //accounts is the array of account objects
    accounts.forEach((account) => {
      // EG: "Bank of America", "Savings", 1234567
      console.log(account.fiName, account.accountName, account.accountId);
    });
  });
  */

  let totalHoldings = 0;
  let costBasis2017 = 0;
  let costBasis2018 = 0;
  let totalCostBasis = costBasis2017 + costBasis2018;
  const coinCnt = coins.length;
  let balanceCnt = 0;

  coins.forEach((coin) => {
    getCoinUsdBalance(coin).then((coinUsdBalance) => {
      balanceCnt += 1;
      totalHoldings += coinUsdBalance;
      console.log('Updating Mint balance for ' + coin.name + ' to: $', coinUsdBalance.toFixed(2));
      mint.updateAccount({
        accountId: coin.mintAcctId,
        accountValue: coinUsdBalance
      });
      if (balanceCnt >= coinCnt) {
        console.log('==============================================');
        console.log('totalHoldings: $' + totalHoldings.toFixed(2));
        console.log('costBasis2017: $' + costBasis2017.toFixed(2));
        console.log('costBasis2018: $' + costBasis2018.toFixed(2));
        console.log('totalCostBasis: $' + totalCostBasis.toFixed(2));
        console.log('gains: $' + (totalHoldings-totalCostBasis).toFixed(2));
        console.log('return: ' + (totalHoldings/totalCostBasis*100).toFixed(2) + '%');
        console.log('estCapGains(@15%): $' + ((totalHoldings - totalCostBasis)*0.15).toFixed(2));
      }
    });
  });
  return;
})
.catch(function(err) {
  console.error("Something has gone wrong: ", err);
});
