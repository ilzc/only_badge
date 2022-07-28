import Link from "next/link"
import PropTypes from "prop-types"
import {paths} from "src/global/constants"
import {normalizedMerchantItemType} from "src/global/types"
import useAppContext from "src/hooks/useAppContext"
import {rarityTextColors} from "src/util/classes"
import ListItemImage from "./ListItemImage"
import ListItemPrice from "./ListItemPrice"
import OwnerInfo from "./OwnerInfo"

export default function MerchantsListItem({
  item,
  showOwnerInfo,
  size = "sm",
  isStoreItem,
}) {
  const {currentUser} = useAppContext()
  const currentUserIsOwner = currentUser && item.owner === currentUser?.addr
  const hasListing = Number.isInteger(item.listingResourceID)
  const profileUrl = paths.profileItem(item.owner, item.itemID)
  // const rarityTextColor = rarityTextColors(item.rarity)
  return (
    <div className="w-full">
      <Link href={profileUrl} passHref>
        <a className="w-full">
          <ListItemImage
            name={item.name}
            // rarity={item.rarity}
            cid={item.image}
            address={item.address}
            // id={item.txID}
            size={size}
            isStoreItem={isStoreItem}
            classes="item-image-container-hover"
          >
            {/* {isStoreItem && (
              <div className="absolute top-3 left-3">
                <div
                  className={`bg-white py-1 px-4 font-bold text-sm rounded-full uppercase ${rarityTextColor}`}
                >
                  New
                </div>
              </div>
            )} */}
          </ListItemImage>
        </a>
      </Link>
      <div>
        {showOwnerInfo && <OwnerInfo address={item.address} />}
        <div className="flex justify-between items-center mt-5 gap-4">
          <div className="flex flex-col">
            <Link href={profileUrl}>
              <a className="text-lg items-center font-semibold">{item.name}</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

MerchantsListItem.propTypes = {
  item: normalizedMerchantItemType,
  showOwnerInfo: PropTypes.bool,
  size: PropTypes.string,
  isStoreItem: PropTypes.bool,
}
