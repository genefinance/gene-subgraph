# GeneFinance Subgraph

[GeneFinance](https://gene.finance/) is a decentralized protocol for automated token exchange on Ethereum.

## Subgraph for Gene Finance

### Initialzing the graph project

Install Graph CLI:

```bash
yarn global add @graphprotocol/graph-cli
```

Initialize a subgraph project:

```bash
graph init \
--from-contract 0xABc44F86563a9D557038412A3deE1c13BfFf42F0 \
--network mainnet \
genefinance/gene-subgraph
```

### Add access token

1. Set up a Graph Explorer account and retrieve the token from the [dashboard](https://thegraph.com/explorer/dashboard)
2. Save the access token.

```bash
graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN>
```

Note: you might need to install `libsecret-1-dev` first.

```bash
sudo apt install libsecret-1-dev
```

If that doesn't work, you can still run without stored key (and just pass the token in every time. See below in the deploy section.) 3. Add the subgraph by following the instructions [here](https://thegraph.com/docs/deploy-a-subgraph#create-the-subgraph).

### Generate Codes or Build

```bash
yarn codegen
```

```bash
yarn build
```

### Deploy or Redeploy

Upload subgraph files to IPFS and trigger the Graph Explorer to start indexing.

```bash
yarn deploy
```

Or

```bash
graph deploy --node https://api.thegraph.com/deploy/ --ipfs https://api.thegraph.com/ipfs/ genefinance/gene-subgraph --access-token <ACCESS_TOKEN>
```

This subgraph dynamically tracks any pair created by the geneFinance factory. It tracks of the current state of GeneFinance contracts, and contains derived stats for things like historical data and USD prices.

- aggregated data across pairs and tokens,
- data on individual pairs and tokens,
- data on transactions
- data on liquidity providers
- historical data on GeneFinance, pairs or tokens, aggregated by day

## Running Locally

Make sure to update package.json settings to point to your own graph account.

## Queries

Below are a few ways to show how to query the GeneFinance-subgraph for data. The queries show most of the information that is queryable, but there are many other filtering options that can be used, just check out the [querying api](https://thegraph.com/docs/graphql-api). These queries can be used locally or in The Graph Explorer playground.

## Key Entity Overviews

#### GeneFinanceFactory

Contains data across all of GeneFinance V2. This entity tracks important things like total liquidity (in ETH and USD, see below), all time volume, transaction count, number of pairs and more.

#### Token

Contains data on a specific token. This token specific data is aggregated across all pairs, and is updated whenever there is a transaction involving that token.

#### Pair

Contains data on a specific pair.

#### Transaction

Every transaction on GeneFinance is stored. Each transaction contains an array of mints, burns, and swaps that occured within it.

#### Mint, Burn, Swap

These contain specifc information about a transaction. Things like which pair triggered the transaction, amounts, sender, recipient, and more. Each is linked to a parent Transaction entity.

## Example Queries

### Querying Aggregated GeneFinance Data

This query fetches aggredated data from all GeneFinance pairs and tokens, to give a view into how much activity is happening within the whole protocol.

```graphql
{
  GeneFinanceFactories(first: 1) {
    pairCount
    totalVolumeUSD
    totalLiquidityUSD
  }
}
```
