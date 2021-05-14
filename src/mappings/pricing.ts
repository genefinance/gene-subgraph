/* eslint-disable prefer-const */
import { Pair, Token, Bundle } from '../types/schema'
import { BigDecimal, Address, BigInt } from '@graphprotocol/graph-ts/index'
import { ZERO_BD, factoryContract, ADDRESS_ZERO, ONE_BD } from './helpers'

const WETP_ADDRESS = '0x757938BBD9a3108Ab1f29628C15d9c8715d2F481'
// const USDC_WETP_PAIR = '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc' // created 10008355
// const USDC_WETP_PAIR = '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc' // created 10008355 // TODO: Fix this once WETP/STABLECOIN is deployed, this is ETP <<=
// const DAI_WETP_PAIR = '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11' // created block 10042267
// const USDT_WETP_PAIR = '0x51866AC12965cdc30CF0640615E445253Ce8616D' // created block 10093341 //TODO: This is WETP-USDT === capital letter
const USDT_WETP_PAIR = '0x662B1B37EB45925adCdc76437ad9f1865fcEcBC8'

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  // let daiPair = Pair.load(DAI_WETP_PAIR) // dai is token0
  // let usdcPair = Pair.load(USDC_WETP_PAIR) // usdc is token0
  let usdtPair = Pair.load(USDT_WETP_PAIR) // usdt is token1

  // all 3 have been created
  // if (daiPair !== null && usdcPair !== null && usdtPair !== null) {
  if (usdtPair !== null) {
    // let totalLiquidityETH = daiPair.reserve1.plus(usdcPair.reserve1).plus(usdtPair.reserve0)
    let totalLiquidityETH = usdtPair.reserve0
    if (totalLiquidityETH <= ZERO_BD) {
      return ZERO_BD
    }
    // let daiWeight = daiPair.reserve1.div(totalLiquidityETH)
    // let usdcWeight = usdcPair.reserve1.div(totalLiquidityETH)
    // let usdtWeight = usdtPair.reserve0.div(totalLiquidityETH)
    // return daiPair.token0Price
    return usdtPair.token0Price
    // .times(daiWeight)
    // .plus(usdcPair.token0Price.times(usdcWeight))
    // .plus(usdtPair.token1Price.times(usdtWeight))
    // dai and USDC have been created
    // } else if (daiPair !== null && usdcPair !== null) {
    //   let totalLiquidityETH = daiPair.reserve1.plus(usdcPair.reserve1)
    //   let daiWeight = daiPair.reserve1.div(totalLiquidityETH)
    //   let usdcWeight = usdcPair.reserve1.div(totalLiquidityETH)
    //   return daiPair.token0Price.times(daiWeight).plus(usdcPair.token0Price.times(usdcWeight))
    //   // USDC is the only pair so far
    // } else if (usdcPair !== null) {
    //   return usdcPair.token0Price
  } else {
    return ZERO_BD
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  '0x757938bbd9a3108ab1f29628c15d9c8715d2f481', // WETP
  // '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  // '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0x623761f60d677addbd5a07385e037105a13201ef', // USDT
  '0xd2aee12b53895ff8ab99f1b7f73877983729888f', //GENE
  '0xc35f4bfa9ea8946a3740adfeb4445396834adf62' // DNA
  // '0x86c234f1afdf3b9c82b142c3101bfec769ff278a' //DLP
  // '0x11eef04c884e24d9b7b4760e7476d06ddf797f36' //MX
  // '0x0000000000085d4780b73119b644ae5ecd22b376', // TUSD
  // '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643', // cDAI
  // '0x39aa39c021dfbae8fac545936693ac917d5e7563', // cUSDC
  // '0x86fadb80d8d2cff3c3680819e4da99c10232ba0f', // EBASE
  // '0x57ab1ec28d129707052df4df418d58a2d46d5f51', // sUSD
  // '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', // MKR
  // '0xc00e94cb662c3520282e6f5717214004a7f26888', // COMP
  // '0x514910771af9ca656af840dff83e8264ecf986ca', //LINK
  // '0x960b236a07cf122663c4303350609a66a7b288c0', //ANT
  // '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f', //SNX
  // '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e', //YFI
  // '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8' // yCurv
]

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
// let MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('400000')

// minimum liquidity for price to get tracked
let MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('2')

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == WETP_ADDRESS) {
    return ONE_BD
  }
  // loop through whitelist and check if paired with any
  for (let i = 0; i < WHITELIST.length; ++i) {
    let pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(WHITELIST[i]))
    if (pairAddress.toHexString() != ADDRESS_ZERO) {
      let pair = Pair.load(pairAddress.toHexString())
      if (pair.token0 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token1 = Token.load(pair.token1)
        return pair.token1Price.times(token1.derivedETH as BigDecimal) // return token1 per our token * Eth per token 1
      }
      if (pair.token1 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token0 = Token.load(pair.token0)
        return pair.token0Price.times(token0.derivedETH as BigDecimal) // return token0 per our token * ETH per token 0
      }
    }
  }
  return ZERO_BD // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getTrackedVolumeUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token,
  pair: Pair
): BigDecimal {
  let bundle = Bundle.load('1')
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  // if less than 5 LPs, require high minimum reserve amount amount or return 0
  // if (pair.liquidityProviderCount.lt(BigInt.fromI32(5))) {
  //   let reserve0USD = pair.reserve0.times(price0)
  //   let reserve1USD = pair.reserve1.times(price1)
  //   if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
  //     if (reserve0USD.plus(reserve1USD).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
  //       return ZERO_BD
  //     }
  //   }
  //   if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
  //     if (reserve0USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
  //       return ZERO_BD
  //     }
  //   }
  //   if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
  //     if (reserve1USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
  //       return ZERO_BD
  //     }
  //   }
  // }

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0
      .times(price0)
      .plus(tokenAmount1.times(price1))
      .div(BigDecimal.fromString('2'))
  }

  // take full value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0)
  }

  // take full value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1)
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedLiquidityUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let bundle = Bundle.load('1')
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1))
  }

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString('2'))
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString('2'))
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}
