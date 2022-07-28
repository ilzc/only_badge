import OnlyBadges from 0xOnlyBadges
import MetadataViews from 0xMetadataViews

transaction(recipient: Address, name: String, description: String, badge_image_cid: String, badge_image_path: String,max: UInt64, royalty_cut: UFix64?, royalty_description: String?, royalty_receiver: Address?, externalURL: String?) {

    // local variable for storing the minter reference
    let minter: &OnlyBadges.NFTMinter

    prepare(signer: AuthAccount) {

        // borrow a reference to the NFTMinter resource in storage
        self.minter = signer.borrow<&OnlyBadges.NFTMinter>(from: OnlyBadges.MinterStoragePath)
            ?? panic("Could not borrow a reference to the NFT minter")
    }

    execute {
        // get the public account object for the recipient
        let recipientAccount = getAccount(recipient)

        let capability = recipientAccount
            .getCapability(OnlyBadges.CollectionPublicPath)

        // borrow the recipient's public NFT collection reference
        let receiver = capability
            .borrow<&{OnlyBadges.OnlyBadgesCollectionPublic}>()
            ?? panic("Could not get receiver reference to the NFT Collection")

        // mint the NFT and deposit it to the recipient's collection
        var i:UInt64 = 0
        while i < max {
            
            self.minter.mintNFT(recipient: receiver, name: name, description: name, badge_image: MetadataViews.IPFSFile(cid: badge_image_cid, path: badge_image_path), number: i, max: max, royalty_cut: royalty_cut, royalty_description: royalty_description, royalty_receiver: royalty_receiver, externalURL:externalURL)
            i = i + 1
        }
    }
}