export function normalizeApiListing(item) {
  return {
    itemID: item.item_id,
    kind: Number(item.item_kind),
    rarity: Number(item.item_rarity),
    owner: item.owner,
    name: item.name,
    image: item.image,
    listingResourceID: item.listing_resource_id,
    price: item.price.toString(),
    txID: item.transaction_id,
  }
}

export function normalizeListing(listing) {
  return {
    itemID: listing.itemID,
    kind: Number(listing.kind.rawValue),
    rarity: Number(listing.rarity.rawValue),
    owner: listing.owner,
    name: listing.name,
    image: listing.image,
    listingResourceID: listing.listingResourceID,
    price: listing.price,
    txID: "",
  }
}

export function normalizeMerchants(item) {
  console.log("item:" + JSON.stringify(item))
  return {
    name: item.name,
    image: item.image_path,
    address: item.address,
    txID: item.transaction_id,
  }
}

export function normalizeItem(accountItem, apiListing) {
  return {
    itemID: accountItem.itemID,
    kind: Number(accountItem.kind.rawValue),
    rarity: Number(accountItem.rarity.rawValue),
    owner: accountItem.owner,
    name: accountItem.name,
    image: accountItem.image,
    owner: accountItem.owner,
    listingResourceID: apiListing?.listingResourceID,
    price: apiListing?.price,
    txID: apiListing?.txID,
  }
}
