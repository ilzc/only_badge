import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import {useRouter} from "next/router"
import {useEffect, useRef, useState} from "react"
import useTransactionsContext from "src/components/Transactions/useTransactionsContext"
import {paths} from "src/global/constants"
import publicConfig from "src/global/publicConfig"
import useRequest from "src/hooks/useRequest"
import {EVENT_ITEM_MINTED, getKittyItemsEventByType} from "src/util/events"
import {useSWRConfig} from "swr"
import useAppContext from "src/hooks/useAppContext"
import analytics from "src/global/analytics"
import MINT_BADGES_SCRIPT from "cadence/transactions/mint_badges.cdc"

// Mints an item and lists it for sale. The item is minted on the service account.
export default function useMintAndList() {
  const {currentUser} = useAppContext()
  const {addTransaction} = useTransactionsContext()
  const [_mintState, executeMintRequest] = useRequest()
  const txStateSubscribeRef = useRef()
  const txSealedTimeout = useRef()

  const router = useRouter()
  const {mutate} = useSWRConfig()

  const [isMintingLoading, setIsMintingLoading] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState(null)
  const transactionAction = isMintingLoading ? "Minting Item" : "Processing"

  const resetLoading = () => {
    setIsMintingLoading(false)
    setTransactionStatus(null)
  }

  const onTransactionSealed = tx => {
    if (!!tx.errorMessage?.length) {
      resetLoading()
      return
    }
  }

  const mintAndList = async (reqValues) => {

    //recipient, name, description, badge_image, max, royalty_cut, royalty_cut, royalty_description, royalty_receiver, externalURL
    const recipient = currentUser.addr

    console.log("reqValues:" + reqValues.recipient)

    const newTxId = await fcl.mutate({
      cadence: MINT_BADGES_SCRIPT,
      args: (arg, t) => [
        arg(reqValues.recipient, t.Address),
        arg(reqValues.name, t.String),
        arg(reqValues.description, t.String),
        arg(reqValues.badge_image, t.String),
        arg("sm.jpg", t.String),
        arg(reqValues.max, t.UInt64),
        arg(reqValues.royalty_cut, t.Optional(t.UFix64)),
        arg(reqValues.royalty_description, t.Optional(t.String)),
        arg(reqValues.royalty_receiver, t.Optional(t.Address)),
        arg(reqValues.externalURL, t.Optional(t.String)),
      ],
      limit: 9999,
    })

    console.log(newTxId);
    txStateSubscribeRef.current = fcl.tx(newTxId).subscribe(tx => {
          console.log("tx.status:" + tx.status)
          setTransactionStatus(tx.status)
          if (fcl.tx.isSealed(tx)) onTransactionSealed(tx)
        })
  }

  useEffect(() => {
    return () => {
      if (!!txStateSubscribeRef.current) txStateSubscribeRef.current()
      clearTimeout(txSealedTimeout.current)
    }
  }, [])

  const isLoading = isMintingLoading
  return [{isLoading, transactionAction, transactionStatus}, mintAndList]
}
