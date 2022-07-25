import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import * as fs from "fs"
import * as path from "path"
import { json } from "stream/consumers"
import {FlowService} from "./flow"

const nonFungibleTokenPath = '"../../contracts/NonFungibleToken.cdc"'
const metadataViewsPath = '"../../contracts/MetadataViews.cdc"'
const kittyItemsPath = '"../../contracts/OnlyBadges.cdc"'
const fungibleTokenPath = '"../../contracts/FungibleToken.cdc"'
const flowTokenPath = '"../../contracts/FlowToken.cdc"'
const storefrontPath = '"../../contracts/NFTStorefront.cdc"'

enum Kind {
  Fishbowl = 0,
  Fishhat,
  Milkshake,
  TukTuk,
  Skateboard,
}

enum Rarity {
  Blue = 0,
  Green,
  Purple,
  Gold,
}

const randomKind = () => {
  const values = Object.keys(Kind)
    .map(n => Number.parseInt(n))
    .filter(n => !Number.isNaN(n))

  const index = Math.floor(Math.random() * values.length)

  return values[index]
}

const ITEM_RARITY_PROBABILITIES = {
  [Rarity.Gold]: 10,
  [Rarity.Purple]: 20,
  [Rarity.Green]: 30,
  [Rarity.Blue]: 40,
}

const randomRarity = () => {
  const rarities = Object.keys(ITEM_RARITY_PROBABILITIES)
  const rarityProbabilities = rarities.flatMap(rarity =>
    Array(ITEM_RARITY_PROBABILITIES[rarity]).fill(rarity)
  )

  const index = Math.floor(Math.random() * rarityProbabilities.length)

  return rarityProbabilities[index]
}

class KittyItemsService {
  constructor(
    private readonly flowService: FlowService,
    private readonly nonFungibleTokenAddress: string,
    private readonly metadataViewsAddress: string,
    private readonly kittyItemsAddress: string,
    private readonly fungibleTokenAddress: string,
    private readonly flowTokenAddress: string,
    private readonly storefrontAddress: string
  ) {}

  setupAccount = async () => {
    const authorization = this.flowService.authorizeMinter()

    const transaction = fs
      .readFileSync(
        path.join(
          __dirname,
          `../../../cadence/transactions/kittyItems/setup_account.cdc`
        ),
        "utf8"
      )
      .replace(
        nonFungibleTokenPath,
        fcl.withPrefix(this.nonFungibleTokenAddress)
      )
      .replace(kittyItemsPath, fcl.withPrefix(this.kittyItemsAddress))

    return this.flowService.sendTx({
      transaction,
      args: [],
      authorizations: [authorization],
      payer: authorization,
      proposer: authorization,
    })
  }

  mint = async (recipient: string) => {
    const authorization = this.flowService.authorizeMinter()

    const transaction = fs
      .readFileSync(
        path.join(
          __dirname,
          `../../../cadence/transactions/kittyItems/min_nftminter.cdc`
        ),
        "utf8"
      )
      .replace(
        nonFungibleTokenPath,
        fcl.withPrefix(this.nonFungibleTokenAddress)
      )
      .replace(kittyItemsPath, fcl.withPrefix(this.kittyItemsAddress))

    return this.flowService.sendTx({
      transaction,
      args: [
        fcl.arg(recipient, t.Address),
        fcl.arg("test", t.String),
        fcl.arg("test1", t.String),
      ],
      authorizations: [authorization],
      payer: authorization,
      proposer: authorization,
      skipSeal: true,
    })
  }

  get_minter_sample_tx = async () => {
    const authorization = this.flowService.authorizeMinter()

    const transaction = fs
      .readFileSync(
        path.join(
          __dirname,
          `../../../cadence/transactions/kittyItems/mint_nftminter.cdc`
        ),
        "utf8"
      )
      .replace(
        nonFungibleTokenPath,
        fcl.withPrefix(this.nonFungibleTokenAddress)
      )
      .replace(kittyItemsPath, fcl.withPrefix(this.kittyItemsAddress))

    let txPayload = {
      cadence: transaction,
      args: [
        fcl.arg("test", t.String),
        fcl.arg("test1", t.String),
      ],
      authorizers: [this.flowService.getAdminMinterAddress()],
      payer: this.flowService.getAdminMinterAddress(),
      proposalKey: {
        ...await this.flowService.getProposalKey()
      }
      // skipSeal: true,
    }

    return { txPayload }
  }

  add_minter = async (recipient: string) => {
    const authorization = this.flowService.authorizeMinter()
    console.log("add_minter:" + recipient)
    // const recipientAccount = await this.flowService.getAccount(recipient)
    const account = await fcl.getAccount(recipient)
    console.log("account:" + account)
    const user = await fcl.send([account])

    console.log("user:" + recipient)

    const key = user.keys[0];
      let sequenceNum;
      if (account.role.proposer) {
        sequenceNum = key.sequenceNumber;
      }
    
      console.log("recipient:" + recipient)
      console.log("sequence number:" + sequenceNum)

    const transaction = fs
      .readFileSync(
        path.join(
          __dirname,
          `../../../cadence/transactions/kittyItems/mint_nftminter.cdc`
        ),
        "utf8"
      )
      .replace(
        nonFungibleTokenPath,
        fcl.withPrefix(this.nonFungibleTokenAddress)
      )
      .replace(kittyItemsPath, fcl.withPrefix(this.kittyItemsAddress))

    let txPayload = JSON.stringify({
      cadence: transaction,
      args: [
        fcl.arg("test", t.String),
        fcl.arg("test1", t.String),
      ],
      authorizations: [authorization, recipient],
      payer: recipient,
      proposer: recipient
      // skipSeal: true,
    })

    return { txPayload, payloadSignatures: this.flowService.generateMinterSignature(txPayload)}
  }

  mintAndList = async (recipient: string) => {
    const authorization = this.flowService.authorizeMinter()

    const kind = randomKind()
    const rarity = randomRarity()

    const transaction = fs
      .readFileSync(
        path.join(
          __dirname,
          `../../../cadence/transactions/kittyItems/mint_and_list_kitty_item.cdc`
        ),
        "utf8"
      )
      .replace(
        nonFungibleTokenPath,
        fcl.withPrefix(this.nonFungibleTokenAddress)
      )
      .replace(kittyItemsPath, fcl.withPrefix(this.kittyItemsAddress))
      .replace(fungibleTokenPath, fcl.withPrefix(this.fungibleTokenAddress))
      .replace(flowTokenPath, fcl.withPrefix(this.flowTokenAddress))
      .replace(storefrontPath, fcl.withPrefix(this.storefrontAddress))

    return this.flowService.sendTx({
      transaction,
      args: [
        fcl.arg(recipient, t.Address),
        fcl.arg(Number(kind), t.UInt8),
        fcl.arg(Number(rarity), t.UInt8),
      ],
      authorizations: [authorization],
      payer: authorization,
      proposer: authorization,
      skipSeal: true,
    })
  }

  transfer = async (recipient: string, itemID: number) => {
    const authorization = this.flowService.authorizeMinter()

    const transaction = fs
      .readFileSync(
        path.join(
          __dirname,
          `../../../cadence/transactions/kittyItems/transfer_kitty_item.cdc`
        ),
        "utf8"
      )
      .replace(
        nonFungibleTokenPath,
        fcl.withPrefix(this.nonFungibleTokenAddress)
      )
      .replace(kittyItemsPath, fcl.withPrefix(this.kittyItemsAddress))

    return this.flowService.sendTx({
      transaction,
      args: [fcl.arg(recipient, t.Address), fcl.arg(itemID, t.UInt64)],
      authorizations: [authorization],
      payer: authorization,
      proposer: authorization,
    })
  }

  getCollectionIds = async (account: string): Promise<number[]> => {
    const script = fs
      .readFileSync(
        path.join(
          __dirname,
          `../../../cadence/scripts/kittyItems/get_collection_ids.cdc`
        ),
        "utf8"
      )
      .replace(
        nonFungibleTokenPath,
        fcl.withPrefix(this.nonFungibleTokenAddress)
      )
      .replace(kittyItemsPath, fcl.withPrefix(this.kittyItemsAddress))

    return this.flowService.executeScript<number[]>({
      script,
      args: [fcl.arg(account, t.Address)],
    })
  }

  getKittyItem = async (itemID: number, address: string): Promise<number> => {
    const script = fs
      .readFileSync(
        path.join(
          __dirname,
          `../../../cadence/scripts/kittyItems/get_kitty_item.cdc`
        ),
        "utf8"
      )
      .replace(
        nonFungibleTokenPath,
        fcl.withPrefix(this.nonFungibleTokenAddress)
      )
      .replace(metadataViewsPath, fcl.withPrefix(this.metadataViewsAddress))
      .replace(kittyItemsPath, fcl.withPrefix(this.kittyItemsAddress))

    return this.flowService.executeScript<number>({
      script,
      args: [fcl.arg(address, t.Address), fcl.arg(itemID, t.UInt64)],
    })
  }

  getSupply = async (): Promise<number> => {
    const script = fs
      .readFileSync(
        path.join(
          __dirname,
          `../../../cadence/scripts/kittyItems/get_kitty_items_supply.cdc`
        ),
        "utf8"
      )
      .replace(kittyItemsPath, fcl.withPrefix(this.kittyItemsAddress))

    return this.flowService.executeScript<number>({script, args: []})
  }
}

export {KittyItemsService}
