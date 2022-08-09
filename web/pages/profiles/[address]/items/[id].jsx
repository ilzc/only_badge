import {useRouter} from "next/dist/client/router"
import ListItemImage from "src/components/ListItemImage"
import ListItemPageButtons from "src/components/ListItemPageButtons"
import ListItemPrice from "src/components/ListItemPrice"
import OwnerInfo from "src/components/OwnerInfo"
import PageTitle from "src/components/PageTitle"
import RarityScale from "src/components/RarityScale"
import SellListItem from "src/components/SellListItem"
import useAccountItem from "src/hooks/useAccountItem"
import useApiListing from "src/hooks/useApiListing"
import useAppContext from "src/hooks/useAppContext"
import { Badge, Descriptions } from 'antd';

export default function KittyItem() {



  const router = useRouter()
  const {currentUser} = useAppContext()
  const {address, id} = router.query

  console.log("id:" + JSON.stringify(id))

  const {listing} = useApiListing(id)
  const {item} = useAccountItem(address, id, listing)
  const currentUserIsOwner =
    currentUser && item?.owner && item.owner === currentUser?.addr
  const isSellable = currentUserIsOwner && !listing

  console.log("listing:" + JSON.stringify(listing))
  console.log("item:" + JSON.stringify(item))
  

  return (
    <div className="main-container pt-12 pb-24 w-full">
      <PageTitle>{["Kitty Item", id].filter(Boolean).join(" ")}</PageTitle>
      <main>
        <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-x-14">
          <ListItemImage
            name={item?.name}
            cid={item?.badge_image}
            address={item?.owner}
            id={item?.id}
            size="lg"
          />

          {!!item && (
            <div className="pt-20">
              <OwnerInfo address={item.owner} size="lg" />
              <h1 className="text-5xl text-gray-darkest mt-10 mb-6">
                {item.name}
              </h1>
              <Descriptions bordered>
                <Descriptions.Item label="ID" span={3}>{item.id}</Descriptions.Item>
                <Descriptions.Item label="Number">{item.number}</Descriptions.Item>
                <Descriptions.Item label="Max">{item.max}</Descriptions.Item>
                <Descriptions.Item label="On Sell" span={3}>
                  <Badge status="processing" text="Running" />
                </Descriptions.Item>
                <Descriptions.Item label="Website" span={3}><a href={item.externalURL} target="_blank">{item.externalURL}</a></Descriptions.Item>
                <Descriptions.Item label="Description" span={3}>{item.description}</Descriptions.Item>
                {!!item.royalty_cut && (<Descriptions.Item label="Cut">{item.royalty_cut}</Descriptions.Item>)}
                {!!item.royalty_receiver && (<Descriptions.Item label="Receiver">{item.royalty_receiver}</Descriptions.Item>)}
                {!!item.royalty_description && (<Descriptions.Item label="Receiver" span={3}>{item.royalty_description}</Descriptions.Item>)}
              </Descriptions>
              {isSellable ? (
                <SellListItem item={item} />
              ) : (
                <>
                  <div className="flex items-center h-6">
                    {!!listing && (
                      <div className="mr-5">
                        <ListItemPrice price={listing.price} />
                      </div>
                    )}
                    <div className="font-mono text-sm">#{id}</div>
                  </div>

                  <div className="mt-8">
                    <RarityScale highlightedRarity={item.rarity} />
                  </div>
                  <ListItemPageButtons item={listing} />
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
