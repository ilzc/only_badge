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
import MINT_NFTMINTER_SCRIPT from "cadence/scripts/mint_nftminter.cdc"

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

  const getSignature = async (signable) => {
    const response = await fetch(publicConfig.signWithAdminMinter, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signable })
    });
  
    const signed = await response.json();
    console.log("getSignature:" + signed)
    return signed.signature;
  }
  
  const serverAuthorization = async (account) => {
  
    const addr = publicConfig.flowAddress;//admin minter address
    const keyId = 0;

    const auth = {
      ...account,
      tempId: `${addr}-${keyId}`,
      addr: fcl.sansPrefix(addr),
      keyId: Number(keyId),
      signingFunction: async (signable) => {
  
        const signature = await getSignature(signable);
        console.log("signature2:" + signature)
        const result = {
          addr: fcl.withPrefix(addr),
          keyId: Number(keyId),
          signature
        }
        console.log("result:" + JSON.stringify(result))
        return result
      }
    }

    console.log("auth:" + JSON.stringify(auth))
  
    return auth
  }

  const mintAndList = async () => {
    // setIsMintingLoading(true)
    // const recipient = publicConfig.flowAddress
    const recipient = currentUser.addr

    const transactionId = await fcl.send([
      fcl.transaction(MINT_NFTMINTER_SCRIPT),
      fcl.args([
        fcl.arg("abc", t.String),
        fcl.arg("cde", t.String)
      ]),
      fcl.payer(serverAuthorization),
      fcl.proposer(fcl.authz),
      fcl.authorizations([serverAuthorization, fcl.authz]),
      fcl.limit(9999)
    ]).then(fcl.decode);

    console.log(transactionId);

    txStateSubscribeRef.current = fcl.tx(transactionId).subscribe(tx => {
          console.log("tx.status:" + tx.status)
          setTransactionStatus(tx.status)
          if (fcl.tx.isSealed(tx)) onTransactionSealed(tx)
        })

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

    // executeMintRequest({
    //   url: publicConfig.addMinterSampleTx,
    //   method: "GET",
    //   onSuccess: async data  => {
    //     // setIsMintingLoading(true)
    //     console.log("data" + JSON.stringify(data))
    //     data.txPayload.authorizers.push(recipient)
    //     const txPayload = JSON.stringify(data.txPayload)
        
    //     if (!txPayload) throw new Error("Missing txPayload")
    //     console.log("txPayload:" + txPayload)
    //     const txPayloadHex = Buffer.from(txPayload).toString("hex")
    //     console.log("txPayloadHex:" + txPayloadHex)
    //     const result = await fcl.currentUser.signUserMessage(txPayloadHex)
    //     console.log("result:" + JSON.stringify(result))

    //     executeMintRequest({
    //       url: publicConfig.apiKittyItemMintAndList,
    //       method: "POST",
    //       data: {
    //         recipient,
    //         key: result
    //       },
    //       onSuccess: data => {
    //         // setIsMintingLoading(true)

    //         // const txPayload = data?.txPayload
    //         // const payloadSignatures = data?.payloadSignatures

    //         // console.log(txPayload)
    //         // console.log(payloadSignatures)


    //         // if (!transactionId) throw new Error("Missing transactionId")
    //         // addTransaction({id: transactionId, title: "Minting new item"})

    //         // txStateSubscribeRef.current = fcl.tx(transactionId).subscribe(tx => {
    //         //   setTransactionStatus(tx.status)
    //         //   if (fcl.tx.isSealed(tx)) onTransactionSealed(tx)
    //         // })

    //         // analytics.track("kitty-items-item-minted", {params: {mint: data}})
    //       },
    //       onError: () => {
    //         resetLoading()
    //       },
    //     })

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
