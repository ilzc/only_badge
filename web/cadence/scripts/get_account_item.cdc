import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews
import OnlyBadges from 0xOnlyBadges

pub struct KittyItem {
  pub let name: String
  pub let description: String
  pub let badge_image: String

  pub let id: UInt64
  pub let resourceID: UInt64
  pub let owner: Address

  init(
    name: String,
    description: String,
    badge_image: String,
    id: UInt64,
    resourceID: UInt64,
    owner: Address,
  ) {
    self.name = name
    self.description = description
    self.badge_image = badge_image

    self.id = id
    self.resourceID = resourceID
    self.owner = owner
  }
}

pub fun fetch(address: Address, id: UInt64): KittyItem? {
  if let collection = getAccount(address).getCapability<&OnlyBadges.Collection{NonFungibleToken.CollectionPublic, OnlyBadges.OnlyBadgesCollectionPublic}>(OnlyBadges.CollectionPublicPath).borrow() {

    if let item = collection.borrowOnlyBadges(id: id) {

      if let view = item.resolveView(Type<MetadataViews.Display>()) {

        let display = view as! MetadataViews.Display

        let owner: Address = item.owner!.address!

        let ipfsThumbnail = display.thumbnail as! MetadataViews.IPFSFile

        return KittyItem(
          name: display.name,
          description: display.description,
          badge_image: item.badge_image.cid,
          id: id,
          resourceID: item.uuid,
          owner: address,
        )
      }
    }
  }

  return nil
}

pub fun main(keys: [String], addresses: [Address], ids: [UInt64]): {String: KittyItem?} {
  let r: {String: KittyItem?} = {}
  var i = 0
  while i < keys.length {
    let key = keys[i]
    let address = addresses[i]
    let id = ids[i]
    r[key] = fetch(address: address, id: id)
    i = i + 1
  }
  return r
}