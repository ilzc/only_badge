import NonFungibleToken from "./NonFungibleToken.cdc"
import MetadataViews from "./MetadataViews.cdc"
import FungibleToken from "./FungibleToken.cdc"

pub contract OnlyBadges: NonFungibleToken {

    // Events
    //
    pub event MinterAdded(address: Address)
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event Minted(id: UInt64, name: String)
    pub event ImagesAddedForNewKind(kind: UInt8)

    // Named Paths
    //
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let MinterStoragePath: StoragePath
    pub let AdminMinterStoragePath: StoragePath

    // totalSupply
    // The total number of OnlyBadges that have been minted
    //
    pub var totalSupply: UInt64

    
    // A Badges Item as an NFT
    //
    pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {

        pub let id: UInt64

        pub let name: String

        pub let description: String

        pub let badge_image: MetadataViews.IPFSFile

        //Edition View

        pub let number: UInt64

        pub let max: UInt64?

        //Royalty View

        pub let royalty_cut: UFix64? //0.0 -> 1.0

        pub let royalty_description: String?

        pub let royalty_receiver: Capability<&AnyResource{FungibleToken.Receiver}>?

        //NFTCollectionDisplay View

        pub let externalURL: String?

        init(id: UInt64, 
            name: String, 
            description: String, 
            badge_image: MetadataViews.IPFSFile,
            number: UInt64,
            max: UInt64?,
            royalty_cut: UFix64?,
            royalty_description: String?,
            royalty_receiver: Capability<&AnyResource{FungibleToken.Receiver}>?,
            externalURL: String?) {
            self.id = id
            self.name = name
            self.description = description
            self.badge_image = badge_image
            self.number = number
            self.max = max
            self.royalty_cut = royalty_cut
            self.royalty_description = royalty_description
            self.royalty_receiver = royalty_receiver
            self.externalURL = externalURL
        }

        pub fun getViews(): [Type] {
            let views = [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.Edition>(),
                Type<MetadataViews.ExternalURL>()
            ]
            if (self.royalty_receiver != nil) {
                views.append(Type<MetadataViews.Royalty>())
            }
            return views
        }

        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: self.name,
                        description: self.description,
                        thumbnail: self.badge_image
                    )
                case Type<MetadataViews.Edition>():
                    return MetadataViews.Edition(
                        name: self.name,
                        number: self.number,
                        max: self.max
                    )
                case Type<MetadataViews.ExternalURL>():
                    return MetadataViews.ExternalURL(
                        url: self.externalURL ?? ""
                    )
                case Type<MetadataViews.Royalty>():
                    if (self.royalty_receiver != nil) {
                        return MetadataViews.Royalty(
                            recepient: self.royalty_receiver!,
                            cut: self.royalty_cut ?? 0.0,
                            description: self.royalty_description ?? ""
                        )
                    }
            }

            return nil
        }
    }

    // This is the interface that users can cast their OnlyBadges Collection as
    // to allow others to deposit OnlyBadges into their Collection. It also allows for reading
    // the details of OnlyBadges in the Collection.
    pub resource interface OnlyBadgesCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowOnlyBadges(id: UInt64): &OnlyBadges.NFT? {
            // If the result isn't nil, the id of the returned reference
            // should be the same as the argument to the function
            post {
                (result == nil) || (result?.id == id):
                    "Cannot borrow KittyItem reference: The ID of the returned reference is incorrect"
            }
        }
    }

    // Collection
    // A collection of KittyItem NFTs owned by an account
    //
    pub resource Collection: OnlyBadgesCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        // dictionary of NFT conforming tokens
        // NFT is a resource type with an `UInt64` ID field
        //
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        // withdraw
        // Removes an NFT from the collection and moves it to the caller
        //
        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")

            emit Withdraw(id: token.id, from: self.owner?.address)

            return <-token
        }

        // deposit
        // Takes a NFT and adds it to the collections dictionary
        // and adds the ID to the id array
        //
        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @OnlyBadges.NFT

            let id: UInt64 = token.id

            // add the new token to the dictionary which removes the old one
            let oldToken <- self.ownedNFTs[id] <- token

            emit Deposit(id: id, to: self.owner?.address)

            destroy oldToken
        }

        // getIDs
        // Returns an array of the IDs that are in the collection
        //
        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        // borrowNFT
        // Gets a reference to an NFT in the collection
        // so that the caller can read its metadata and call its methods
        //
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }

        // borrowOnlyBadges
        // Gets a reference to an NFT in the collection as a KittyItem,
        // exposing all of its fields (including the typeID & rarityID).
        // This is safe as there are no functions that can be called on the KittyItem.
        //
        pub fun borrowOnlyBadges(id: UInt64): &OnlyBadges.NFT? {
            if self.ownedNFTs[id] != nil {
                let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
                return ref as! &OnlyBadges.NFT
            } else {
                return nil
            }
        }

        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let OnlyBadges = nft as! &OnlyBadges.NFT
            return OnlyBadges as &AnyResource{MetadataViews.Resolver}
        }

        // destructor
        destroy() {
            destroy self.ownedNFTs
        }

        // initializer
        //
        init () {
            self.ownedNFTs <- {}
        }
    }

    // createEmptyCollection
    // public function that anyone can call to create a new empty collection
    //
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }

    //AdminMinter hold by Admin
    pub resource AdminMinter {

        access(self) var minters: {Address: Int}

        init() {
            self.minters = {};
        }

        pub fun addMinter(minterAccount: AuthAccount, minterName: String, minterImageFile: String) {
            if self.minters[minterAccount.address] == 1 {
                panic("Unable to add minter, already present as a minter for another token type.")
            }
            let minter <- create NFTMinter(minterName: minterName, minterImageFile: minterImageFile)
            emit MinterAdded(address: minterAccount.address)
            minterAccount.save(<-minter, to: OnlyBadges.MinterStoragePath)
            self.minters[minterAccount.address] = 1;
        }
    }

    // NFTMinter
    // Resource that an admin or something similar would own to be
    // able to mint new NFTs
    //
    pub resource NFTMinter {

        pub let name: String
        pub let imageFile: String

        init(minterName: String, minterImageFile: String) {
            self.name = minterName
            self.imageFile = minterImageFile
        }

        // mintNFT
        // Mints a new NFT with a new ID
        // and deposit it in the recipients collection using their collection reference
        //
        pub fun mintNFT(
            recipient: &{NonFungibleToken.CollectionPublic}, 
            name: String, 
            description: String, 
            badge_image: MetadataViews.IPFSFile,
            number: UInt64,
            max: UInt64?,
            royalty_cut: UFix64?,
            royalty_description: String?,
            royalty_receiver: Capability<&AnyResource{FungibleToken.Receiver}>?,
            externalURL: String?
        ) {
            // deposit it in the recipient's account using their reference
            recipient.deposit(token: <-create OnlyBadges.NFT(
                                                id: OnlyBadges.totalSupply, 
                                                name: name, 
                                                description: description, 
                                                badge_image: badge_image,
                                                number: number,
                                                max: max,
                                                royalty_cut: royalty_cut,
                                                royalty_description: royalty_description,
                                                royalty_receiver: royalty_receiver,
                                                externalURL: externalURL))

            emit Minted(
                id: OnlyBadges.totalSupply,
                name: name,
            )

            OnlyBadges.totalSupply = OnlyBadges.totalSupply + (1 as UInt64)
        }

        // Update NFT images for new type
        // pub fun addNewImagesForKind(from: AuthAccount, newImages: {Kind: {Rarity: String}}) {
        //     let kindValue = OnlyBadges.images.containsKey(newImages.keys[0]) 
        //     if(!kindValue) {
        //         OnlyBadges.images.insert(key: newImages.keys[0], newImages.values[0])
        //         emit ImagesAddedForNewKind(
        //             kind: newImages.keys[0].rawValue,
        //         )
        //     } else {
        //         panic("No Rugs... Can't update existing NFT images.")
        //     }
        // }
    }

    // fetch
    // Get a reference to a KittyItem from an account's Collection, if available.
    // If an account does not have a OnlyBadges.Collection, panic.
    // If it has a collection but does not contain the itemID, return nil.
    // If it has a collection and that collection contains the itemID, return a reference to that.
    //
    pub fun fetch(_ from: Address, itemID: UInt64): &OnlyBadges.NFT? {
        let collection = getAccount(from)
            .getCapability(OnlyBadges.CollectionPublicPath)!
            .borrow<&OnlyBadges.Collection{OnlyBadges.OnlyBadgesCollectionPublic}>()
            ?? panic("Couldn't get collection")
        // We trust OnlyBadges.Collection.borowKittyItem to get the correct itemID
        // (it checks it before returning it).
        return collection.borrowOnlyBadges(id: itemID)
    }

    // initializer
    //
    init() {

        // Set our named paths
        // self.CollectionStoragePath = /storage/OnlyBadgesCollectionV14
        // self.CollectionPublicPath = /public/OnlyBadgesCollectionV14
        // self.MinterStoragePath = /storage/OnlyBadgesMinterV14

        self.CollectionStoragePath = /storage/onlyBadgesItemsCollection
        self.CollectionPublicPath = /public/onlyBadgesItemsCollection
        self.MinterStoragePath = /storage/onlyBadgesItemsMinter
        self.AdminMinterStoragePath = /storage/onlyBadgesAdminMinter

        // Initialize the total supply
        self.totalSupply = 0

        // Create a Minter resource and save it to storage
        // let minter <- create NFTMinter()
        // self.account.save(<-minter, to: self.MinterStoragePath)
        let minter <- create AdminMinter()
        self.account.save(<-minter, to: self.AdminMinterStoragePath)
        

        emit ContractInitialized()
    }
}
