export default class Coin {
  constructor(
    name,
    mintAcctId,
    usdPriceUrl,
    addrs,
    qty = 0.0,
    balanceUrl,
    balanceScaleFactor,
    balanceProp
  ) {
    this.name = name
    this.mintAcctId = mintAcctId
    this.usdPriceUrl = usdPriceUrl
    this.addrs = addrs
    this.qty = qty
    this.balanceUrl = balanceUrl
    this.balanceScaleFactor = balanceScaleFactor
    this.balanceProp = balanceProp
  }
}
