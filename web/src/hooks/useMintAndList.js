import * as fcl from "@onflow/fcl"
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

    const event = getKittyItemsEventByType(tx.events, EVENT_ITEM_MINTED)

    if (!Number.isInteger(event?.data?.id))
      throw new Error("Minting error, missing itemID")
    if (!Number.isInteger(event?.data?.kind))
      throw new Error("Minting error, missing kind")

    // TODO: Poll api for listing presence before mutating the apiMarketItemsList
    txSealedTimeout.current = setTimeout(() => {
      mutate(paths.apiMarketItemsList())
      router.push({
        pathname: paths.profileItem(publicConfig.flowAddress, event.data.id),
      })
    }, 1000)
  }

  // getAccount = async (addr) => {
  //   const { account } = await fcl.send([fcl.getAccount(addr)]);
  //   return account;
  // };

  const mintAndList = async () => {
    // setIsMintingLoading(true)
    // const recipient = publicConfig.flowAddress
    // const recipient = currentUser.addr

    // const transactionId = await fcl.mutate({
    //   cadence: `
    //     transaction {
    //       execute {
    //         log("Hello from execute")
    //       }
    //     }
    //   `,
    //   proposer: fcl.currentUser,
    //   payer: fcl.currentUser,
    //   limit: 50
    // })

    // console.log(transactionId)
    
    // const auth = await fcl.send([fcl.getAccount(fcl.currentUser.)])
    // const acc = await fcl.account("0xc9634bcd9b086d58")

    // const key = acc.keys[0];

    // sequenceNum = key.sequenceNumber;
    //   }

    // console.log(key)
    // console.log(sequenceNum)

    executeMintRequest({
      url: publicConfig.addMinterSampleTx,
      method: "GET",
      onSuccess: async data  => {
        setIsMintingLoading(true)
        console.log("data" + data)
        const txPayload = data?.txPayload
        
        if (!txPayload) throw new Error("Missing txPayload")
        console.log("txPayload" + txPayload)
        const txPayloadHex = txPayload.toString("hex")
        console.log("console.log(result)" + console.log(result))
        const result = await fcl.currentUser.signUserMessage(txPayloadHex)
        console.log(result)
        // addTransaction({id: transactionId, title: "Minting new item"})

        // txStateSubscribeRef.current = fcl.tx(transactionId).subscribe(tx => {
        //   setTransactionStatus(tx.status)
        //   if (fcl.tx.isSealed(tx)) onTransactionSealed(tx)
        // })

        // analytics.track("kitty-items-item-minted", {params: {mint: data}})
      },
      onError: () => {
        resetLoading()
      },
    })

    // executeMintRequest({
    //   url: publicConfig.apiKittyItemMintAndList,
    //   method: "POST",
    //   data: {
    //     recipient,
    //   },
    //   onSuccess: data => {
    //     // setIsMintingLoading(true)

    //     const txPayload = data?.txPayload
    //     const payloadSignatures = data?.payloadSignatures

    //     console.log(txPayload)
    //     console.log(payloadSignatures)


    //     // if (!transactionId) throw new Error("Missing transactionId")
    //     // addTransaction({id: transactionId, title: "Minting new item"})

    //     // txStateSubscribeRef.current = fcl.tx(transactionId).subscribe(tx => {
    //     //   setTransactionStatus(tx.status)
    //     //   if (fcl.tx.isSealed(tx)) onTransactionSealed(tx)
    //     // })

    //     // analytics.track("kitty-items-item-minted", {params: {mint: data}})
    //   },
    //   onError: () => {
    //     resetLoading()
    //   },
    // })
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
