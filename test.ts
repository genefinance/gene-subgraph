export function getUSDRate(token: Address, block: ethereum.Block): BigDecimal {
    let usdt = BIG_DECIMAL_ONE

    if (token != USDT_ADDRESS) {
      let address = block.number.le(BigInt.fromI32(10829344))
        ? UNISWAP_WETH_USDT_PAIR_ADDRESS
        : SUSHISWAP_WETH_USDT_PAIR_ADDRESS

      const tokenPriceETH = getEthRate(token, block)

      const pair = PairContract.bind(address)

      const reserves = pair.getReserves()

      const reserve0 = reserves.value0.toBigDecimal().times(BIG_DECIMAL_1E18)

      const reserve1 = reserves.value1.toBigDecimal().times(BIG_DECIMAL_1E18)

      const ethPriceUSD = reserve1.div(reserve0).div(BIG_DECIMAL_1E6).times(BIG_DECIMAL_1E18)

      return ethPriceUSD.times(tokenPriceETH)
    }

    return usdt
