## Subgraph for Gene Finance

### Initialzing the graph project

Install Graph CLI:

```bash
yarn global add @graphprotocol/graph-cli
```

Initialize a subgraph project:

```bash
graph init \
--from-contract 0x989581F7F3E2B2D9045a06dbBC7Feb7cCe21A77E \
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
