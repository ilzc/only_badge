import FungibleToken from 0xFungibleToken
import NonFungibleToken from 0xNonFungibleToken
import KittyItems from 0xOnlyBadges
import NFTStorefront from 0xNFTStorefront

pub fun hasItems(_ address: Address): Bool {
  return getAccount(address)
    .getCapability<&KittyItems.Collection{NonFungibleToken.CollectionPublic, KittyItems.KittyItemsCollectionPublic}>(KittyItems.CollectionPublicPath)
    .check()
}

pub fun hasStorefront(_ address: Address): Bool {
  return getAccount(address)
    .getCapability<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(NFTStorefront.StorefrontPublicPath)
    .check()
}

transaction {
  prepare(acct: AuthAccount) {
    if !hasItems(acct.address) {
      if acct.borrow<&KittyItems.Collection>(from: KittyItems.CollectionStoragePath) == nil {
        acct.save(<-KittyItems.createEmptyCollection(), to: KittyItems.CollectionStoragePath)
      }
      acct.unlink(KittyItems.CollectionPublicPath)
      acct.link<&KittyItems.Collection{NonFungibleToken.CollectionPublic, KittyItems.KittyItemsCollectionPublic}>(KittyItems.CollectionPublicPath, target: KittyItems.CollectionStoragePath)
    }

    if !hasStorefront(acct.address) {
      if acct.borrow<&NFTStorefront.Storefront>(from: NFTStorefront.StorefrontStoragePath) == nil {
        acct.save(<-NFTStorefront.createStorefront(), to: NFTStorefront.StorefrontStoragePath)
      }
      acct.unlink(NFTStorefront.StorefrontPublicPath)
      acct.link<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(NFTStorefront.StorefrontPublicPath, target: NFTStorefront.StorefrontStoragePath)
    }
  }
}