import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import MetadataViews from "../../contracts/MetadataViews.cdc"
import NFTStorefront from "../../contracts/NFTStorefront.cdc"
import OnlyBadges from "../../contracts/OnlyBadges.cdc"

pub struct ListingItem {
    pub let name: String
    pub let image: String
    pub let thumbnail: String
    pub let description: String

    pub let itemID: UInt64
    pub let resourceID: UInt64
    // pub let kind: OnlyBadges.Kind
    // pub let rarity: OnlyBadges.Rarity
    pub let owner: Address
    pub let price: UFix64

    init(
        name: String,
        image: String,
        thumbnail: String,
        description: String,
        itemID: UInt64,
        resourceID: UInt64,
        // kind: OnlyBadges.Kind,
        // rarity: OnlyBadges.Rarity,
        owner: Address,
        price: UFix64
    ) {
        self.name = name
        self.image = image
        self.thumbnail = thumbnail
        self.description = description

        self.itemID = itemID
        self.resourceID = resourceID
        // self.kind = kind
        // self.rarity = rarity
        self.owner = owner
        self.price = price
    }
}

pub fun dwebURL(_ file: MetadataViews.IPFSFile): String {
    var url = "https://"
        .concat(file.cid)
        .concat(".ipfs.dweb.link/")

    if let path = file.path {
        return url.concat(path)
    }

    return url
}

pub fun main(address: Address, listingResourceID: UInt64): ListingItem? {
    let account = getAccount(address)

    if let storefrontRef = account.getCapability<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(NFTStorefront.StorefrontPublicPath).borrow() {

        if let listing = storefrontRef.borrowListing(listingResourceID: listingResourceID) {

            let details = listing.getDetails()

            let itemID = details.nftID
            let itemPrice = details.salePrice

            if let collection = getAccount(address).getCapability<&OnlyBadges.Collection{NonFungibleToken.CollectionPublic, OnlyBadges.OnlyBadgesCollectionPublic}>(OnlyBadges.CollectionPublicPath).borrow() {

                if let item = collection.borrowOnlyBadges(id: itemID) {

                    if let view = item.resolveView(Type<MetadataViews.Display>()) {

                        let display = view as! MetadataViews.Display

                        let owner: Address = item.owner!.address!

                        let ipfsThumbnail = display.thumbnail as! MetadataViews.IPFSFile

                        return ListingItem(
                            name: display.name,
                            image: item.imageCID(),
                            thumbnail: dwebURL(ipfsThumbnail),
                            description: display.description,
                            itemID: itemID,
                            resourceID: item.uuid,
                            // kind: item.kind,
                            // rarity: item.rarity,
                            owner: address,
                            price: itemPrice
                        )
                    }
                }
            }
        }
    }

    return nil
}
