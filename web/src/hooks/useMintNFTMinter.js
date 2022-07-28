import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import {useRouter} from "next/router"
import {useEffect, useRef, useState} from "react"
import useTransactionsContext from "src/components/Transactions/useTransactionsContext"
import {paths} from "src/global/constants"
import publicConfig from "src/global/publicConfig"
import useRequest from "src/hooks/useRequest"
import useNFTStorage from "src/hooks/useNFTStorage"
import {EVENT_ITEM_MINTED, getKittyItemsEventByType} from "src/util/events"
import {useSWRConfig} from "swr"
import useAppContext from "src/hooks/useAppContext"
import analytics from "src/global/analytics"
import MINT_NFTMINTER_SCRIPT from "cadence/transactions/mint_nftminter.cdc"

// Mints an item and lists it for sale. The item is minted on the service account.
export default function useMintNFTMinter() {
  const {currentUser} = useAppContext()
  const {addTransaction} = useTransactionsContext()
  const [_mintState, executeMintRequest] = useRequest()
  const [ isUploading, uploadNftStorage ] = useNFTStorage()
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

  const mintNFTMinter = async ({name, image}) => {
    console.log("name:" + name + " image:" + JSON.stringify(image))
    image = image.file.response
    const transactionId = await fcl.send([
      fcl.transaction(MINT_NFTMINTER_SCRIPT),
      fcl.args([
        fcl.arg(name, t.String),
        fcl.arg(image, t.String)
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
  }

  useEffect(() => {
    return () => {
      if (!!txStateSubscribeRef.current) txStateSubscribeRef.current()
      clearTimeout(txSealedTimeout.current)
    }
  }, [])

  const isLoading = isMintingLoading
  return [{isLoading, transactionAction, transactionStatus}, mintNFTMinter]
}
